# 企劃：曲庫（Song Repertoire）管理 ＋ 點歌審核（Song Request）佇列

## 背景

這是跨三個 repo 的功能（另兩個是 `stream_api`、`shushu.tw`，各自有自己的企劃文件）。觀眾在 shushu.tw 用 Twitch 登入、瀏覽曲庫、送出點歌，本 repo（obs_tool）是實況主用來**管理曲庫**與**審核點歌**的地方；核准後的歌會進入既有的 `song_list`（`/song` overlay 已透過 SSE 顯示）。stream_api 是唯一真實資料來源，本 repo 只負責串接與管理介面。

現況：`/song` overlay 是唯讀的即時歌單，`songBook` 分頁雖然導覽列寫著「管理歌曲類型與分類」，實際上只是歸檔歷史檢視，沒有分類功能。`src/api/song.ts` 的 base URL（`https://shustream.zeabur.app/songList`）是寫死的，瀏覽器直接呼叫 stream_api，沒有任何驗證。`tmi.js` 目前是匿名唯讀連線，不涉及本企劃。

## 決策

### 1. 用一個 catch-all 代理取代改寫 15 個函式

`src/api/song.ts` 目前每個函式都是 ~15 行重複的 axios try/catch，直接打 `https://shustream.zeabur.app`。stream_api 那邊即將要求所有寫入端點帶 `x-api-key`，**密鑰不能出現在瀏覽器**，所以必須讓 obs_tool 自己的伺服器代為附加密鑰。

不需要重寫全部函式——加一個 Next.js catch-all Route Handler：

```
src/app/api/stream/[...path]/route.ts
```

轉發 `GET/POST/PUT/DELETE` 到 `${STREAM_API_URL}/${path}`，帶上 `x-api-key: STREAM_API_ADMIN_KEY`。然後 `src/api/song.ts` 只需要把 base URL 從 `https://shustream.zeabur.app/songList` 改成 `/api/stream/songList`，**其餘每個函式的簽名與呼叫端完全不用動**——`songList.tsx`、`songBook.tsx` 都只讀 `res.data`，不受影響。

**例外**：`SONG_LIST_STREAM_URL`（SSE，`new EventSource(...)` 用的那個）維持絕對網址直連 stream_api，不透過代理——它是唯讀 GET，不需要密鑰，SSE 串流走 route handler 代理很麻煩，沒必要。

**這個 catch-all 必須加路徑白名單**（只允許 `songList`、`repertoire`、`songRequest`、`messageBoard` 這幾個第一段路徑），否則它等於一個掛著 admin 密鑰的通用轉發代理，任何人都能拿它打任何網址（SSRF）。

### 2. obs_tool 目前完全沒有驗證，代理上線前必須先補一道 Basic Auth

這點跟原本設想的不一樣：**只把密鑰移到伺服器端還不夠**。obs_tool 現在是公開網址、零驗證，任何人都能打開 `/` 操作歌單，一旦代理上線並附上 admin 密鑰，等於任何人都能透過這個代理對 stream_api 做任意寫入/刪除（包含清空整個歌單）——問題沒有解決，只是換了個地方發生。

所以要在 obs_tool 加 `src/middleware.ts`，對 `/` 與 `/api/stream/:path*` 做 HTTP Basic Auth（帳密走環境變數 `ADMIN_BASIC_USER`／`ADMIN_BASIC_PASS`）。**matcher 必須排除 `/song`、`/chat`、`/chat/full`、`/clock`、`/video`**——這些是 OBS Browser Source 直接載入的 overlay 頁面，不會帶認證資訊，一旦被 middleware 攔截會直接在 OBS 裡顯示 401 頁面而不是歌單/聊天室。

### 3. `songBook` 分頁改造成真正的曲庫管理，原本的歸檔檢視搬到新分頁

導覽列標籤本來就寫「管理歌曲類型與分類」，只是功能沒做。這次把 `songBook.tsx` 內容換成真正的曲庫 CRUD（新增/編輯/下架、多維度分類勾選、依分類篩選、搜尋），原本的歸檔歷史檢視原封不動搬到新檔案 `songArchive.tsx`，不改行為。

分類是多維度的（`dimension`／`slug`／`label`，例如 `language: zh/ja/en`），不是單一「語言」下拉——這樣以後主播想加「難度」「情境」之類的分類，只要在 stream_api 加資料，這裡的篩選 UI 就會自動多出一排選項，不用改程式碼。

### 4. 新增「點歌審核」分頁

獨立的 `songRequests.tsx`，輪詢（`setInterval`，這個 repo 沒有 SWR/react-query，維持現有習慣）待審清單，每列可「接受」／「拒絕」（拒絕可選填原因）。如果聊天室通知失敗（`chat_drop_reason` 有值，例如被 AutoMod 擋下），要在列表上顯示出來——不然主播不會知道觀眾其實沒收到確認訊息。

核准後 `/song` overlay 會自己透過既有的 SSE 更新，這個分頁不需要跟歌單分頁做任何跨元件同步，核准完刷新自己的待審清單就好。

## 新增／修改檔案

### API 層

- **新增** `src/lib/streamApi.ts`（伺服器端專用）：包一個 `streamApi(path, init)`，附 `x-api-key: process.env.STREAM_API_ADMIN_KEY`、`cache: 'no-store'`。
- **新增** `src/app/api/stream/[...path]/route.ts`：catch-all 代理，白名單 `["songList","repertoire","songRequest","messageBoard"]`，其餘一律 404。
- **新增** `src/middleware.ts`：Basic Auth，matcher 排除 overlay 路由。
- **修改** `src/api/song.ts`：`generateApiUrl` 改回傳 `/api/stream/songList${endpoint}`（相對路徑，同源，免 CORS，密鑰不進瀏覽器）；`SONG_LIST_STREAM_URL` 保持絕對網址。可以順手把 15 個函式的重複 try/catch 收斂成一個共用的 `request(method, endpoint, body?)` helper，只要回傳形狀仍是 `{data, status}` 讓既有 call site 的 `res.data` 不用改。
- **修改** `src/api/messageBoard.ts`：同樣改成 `/api/stream/messageBoard`。
- **新增** `src/api/repertoire.ts`：曲庫 CRUD 與分類 CRUD，走 `/api/stream/repertoire/*`，比照 `song.ts` 的函式風格。
- **新增** `src/api/songRequest.ts`：待審清單、核准、拒絕，走 `/api/stream/songRequest/*`。

### 管理介面

- **修改** `src/app/page.tsx`：`songs` 底下的分頁從 `songList | songBook` 擴充為 `songList | songBook | songRequest | archive`；`songGroup` 導覽項目新增「點歌審核」（可加待審數量小紅點）與「歷史紀錄」；標題/副標題如果目前是用 `activeSongTab === 'songList' ? … : …` 這種三元運算式，分頁一多就不好維護，改成一個 `Record<SongTab, {title, subtitle}>` 對照表。
- **新增** `src/components/admin/songArchive.tsx`：把目前 `songBook.tsx` 的歸檔檢視內容原封不動搬過來。
- **修改** `src/components/admin/songBook.tsx`：改寫成曲庫管理——統計卡片（總曲目數／各分類數量）、每個分類維度一排篩選 pills（用既有的 `admin-segmented`）＋搜尋框、清單列比照 `songList.tsx` 的列樣式加上分類 `admin-badge`、新增走 Radix `Dialog`（分類選擇用依 dimension 分組的 checkbox）、刪除走 `AlertDialog`。
- **新增** `src/components/admin/songRequests.tsx`：待審佇列，`admin-button-primary` 接受／`admin-button-danger` 拒絕，`chat_drop_reason` 用 `admin-badge--warn` 標示。
- **新增** `src/components/admin/categoryManager.tsx`：分類本身的 CRUD（新增/編輯/刪除 dimension/slug/label），可以做成曲庫分頁裡的一個可收合區塊。
- **新增** `src/hooks/usePendingRequests.ts`：輪詢待審數量，供 `page.tsx` 的導覽小紅點使用（這個 repo 目前沒有 `src/hooks/`，是新目錄）。

**UI 規則**：一律用 `admin-button`／`admin-input`／`admin-card`／`admin-badge`／`admin-segmented` 這些既有的全域 class，**不要用已安裝但整個 admin 都沒在用的 shadcn 基本元件**。Radix `Dialog`／`AlertDialog` 可以用，但每個 `DialogContent`／`AlertDialogContent` 都要重新掛上 `admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)]`，因為 Radix 會 portal 到 `.admin-shell` 之外。維持專案慣例：`useCallback` fetch + `useEffect` + mutation 後手動 refetch + `sonner` toast 回饋；Prettier 單引號、無分號。

## 環境變數

`STREAM_API_URL`（預設 `https://shustream.zeabur.app`）、`STREAM_API_ADMIN_KEY`、`ADMIN_BASIC_USER`、`ADMIN_BASIC_PASS`。

**`STREAM_API_ADMIN_KEY` 絕對不能放進 `next.config.mjs` 的 `env:` 區塊**——那個區塊會把值編進 client bundle，現在 `TWITCH_OAUTH_TOKEN`／`SOCKET_NONCE` 就是這樣暴露在瀏覽器裡的。新密鑰只能透過 route handler 讀 `process.env`。

## 上線順序（本 repo 這一側）

1. `src/lib/streamApi.ts`、`src/app/api/stream/[...path]/route.ts`、`src/middleware.ts` 一起上，缺一不可——代理跟 Basic Auth 是同一個資安措施的兩半，不能只上代理不上驗證。
2. 改 `src/api/song.ts`、`src/api/messageBoard.ts` 的 base URL，部署，確認既有的歌單管理與悄悄話功能沒壞（stream_api 那邊此時仍是「密鑰未設定即放行」，所以就算 obs_tool 先上線也不會有相容性問題）。
3. 曲庫管理、分類管理、點歌審核三個新分頁分開開發、分開上線都可以，彼此不互相依賴，只依賴 stream_api 的 `/repertoire`、`/songRequest` 端點就緒。

## 驗證方式

1. 本機 `bun dev`（或 `npm run dev`），確認 Basic Auth 會攔住 `/`，但 `/song`、`/chat`、`/clock`、`/video` 不受影響（在瀏覽器分頁直接開這幾個網址，應該正常顯示無需登入）。
2. 用瀏覽器 devtools 檢查 network，確認 `/api/stream/*` 的請求裡看不到 `x-api-key`（它只出現在伺服器對 stream_api 的請求裡），也確認直接打 `/api/stream/whatever-not-in-allowlist` 會 404。
3. 新增一首曲庫歌曲、掛上兩個分類、在篩選 pills 上驗證能篩出來；下架一首確認它從清單消失但沒被真的刪除。
4. 從 shushu.tw 端（或用 curl 模擬）送一筆點歌請求，確認出現在待審清單；接受後確認 `/song` overlay 立即更新，且新歌排在佇列尾端而不是最前面。
5. 故意讓聊天室發送失敗（例如暫時清空 stream_api 的 bot refresh token），確認待審列表會標示出「通知失敗」而不是靜默假裝成功。

## 風險

- **代理若沒配 Basic Auth 等於幫任何人開了一個帶密鑰的 admin 後門**——這是本企劃裡最重要的一條，務必兩者同時上線，不要分開部署。
- **middleware matcher 排除清單要正確**，漏掉任何一個 overlay 路由，OBS 裡就會出現 401 頁面而不是歌單/聊天室，而且不容易在本機測試環境發現（要實際用 OBS Browser Source 載入才會踩到）。
- 曲庫、分類、審核三個功能都依賴 stream_api 對應端點的欄位形狀，若對方回應格式跟本文件假設的不同，串接時要以 stream_api 實際部署的回應為準調整。
- 這個 repo 目前把好幾個敏感變數（`TWITCH_OAUTH_TOKEN`、`SPOTIFY_CLIENT_SECRET`、`SPOTIFY_REFRESH_TOKEN`、`SUPABASE_PASSWORD`）塞在 `next.config.mjs` 的 `env:` 區塊裡曝露給瀏覽器，這是既有問題、不在本企劃範圍內，但新密鑰絕對不能重蹈覆轍。
