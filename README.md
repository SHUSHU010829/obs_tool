# OBS Tool

Twitch 直播主專用的 OBS 管理工具集，提供聊天顯示、歌曲播放列表管理、時鐘顯示、頻道點數獎勵視頻播放等功能。

## 功能特色

### 聊天顯示系統 (`/chat`)
- 即時 Twitch 聊天監聽與顯示
- 支援 Twitch 官方表情符號和 7TV 自訂表情
- 徽章系統（訂閱者、版主、VIP 等）
- 訂閱（新訂閱 / 續訂分開呈現）、禮物訂閱（依數量分 1/5/10/25/50+ 層級）、Bits 歡呼、Raid 等事件通知
- 實時觀眾數與直播狀態顯示
- 可配置的消息數量和自動隱藏時間

### 全螢幕 HUD 聊天室 (`/chat/full`)
- 三欄式全螢幕 HUD 佈局（左側資訊欄 / 中間聊天 / 右側活動欄）
- **左側欄**：即時觀眾數折線圖、每分鐘訊息數、TopChatters 排行（跨重新整理持久保存）、Spotify 現在播放
- **頂部 HUD**：聲納動畫 LIVE 指示燈、直播時長
- **右側欄**：訂閱 / 禮物 / Raid 等活動串流
- Spotify 播放區塊：顯示曲名、歌手、播放進度條，換曲時淡入淡出動畫

### Spotify Now Playing HUD (`/nowplaying`)
- 科幻 / Cyberpunk 風格的音樂 HUD，**不是播放器**，專注於視覺呈現與即時同步
- 顯示曲名、歌手、專輯封面、播放狀態（Playing / Paused）、播放時間、總長度、進度
- **封面動態取色**：自動分析專輯封面主色，套用到波形、文字、進度條、邊框、Glow 與背景光暈，換歌即換色（灰階封面自動退回預設色）
- **動態音訊波形**：播放時持續動畫，暫停時衰減為低幅度待機狀態
- 四種版面（`bar` / `minimal` / `ticker` / `square`）與三種視覺化樣式（`bars` / `wave` / `radial`）
- 透明背景，可直接疊在 OBS 畫面上
- 於後台「Now Playing HUD」分頁可視化調整並產生網址

### 時鐘顯示 (`/clock`)
- 多種風格選擇：數位時鐘、簡易時鐘
- 類比時鐘（時針/分針/秒針）
- 日期與星期顯示
- 支援 12 小時制

### 歌曲播放列表 (`/song`)
- 即時歌曲列表顯示（旋轉黑膠 + 曲目資訊）
- 使用 SSE（Server-Sent Events）即時推送，取代輪詢
- 顯示當前播放與待播歌曲

### 頻道點數獎勵視頻 (`/video`)
- 監聽 Twitch 頻道點數兌換
- 自動播放對應獎勵視頻
- 支援多種獎勵類型映射

### 後台管理系統 (`/`)
- 對話卡片風格儀表板介面
- 歌曲管理（新增、編輯、排序、歸檔）
- 拖曳排序功能
- 歌本分類管理
- 留言板管理
- **Live Tools Hub**：列出所有 Overlay 連結，支援分類篩選（聊天 / 多媒體 / 時鐘）、一鍵複製連結、內建 iframe 預覽面板
- 響應式設計（支援手機版）

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 15 (App Router)、React 19 |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS |
| UI 組件 | Radix UI、shadcn/ui |
| 動畫 | Framer Motion |
| Twitch 整合 | tmi.js、Twitch Helix API |
| Spotify 整合 | Spotify Web API（Now Playing） |
| HTTP 請求 | Axios |
| 視頻播放 | React Player |
| 開發工具 | ESLint、Prettier、Husky |

## 安裝

### 前置需求
- Node.js >= 18
- npm 或 bun

### 步驟

```bash
# 複製專案
git clone https://github.com/SHUSHU010829/obs_tool.git
cd obs_tool

# 安裝依賴
npm install
# 或使用 bun
bun install
```

## 環境變數

在專案根目錄建立 `.env.local` 檔案：

```bash
# Twitch API 認證
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_ACCESS_TOKEN=your_access_token
TWITCH_OAUTH_TOKEN=your_oauth_token

# Twitch 頻道資訊
TWITCH_CHANNEL_NAME=your_channel_name
TWITCH_CHANNEL_ID=your_channel_id

# WebSocket 配置
SOCKET_NONCE=random_nonce_string

# Spotify API（全螢幕 HUD 現在播放功能）
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
```

### 取得 Twitch API 認證

1. 前往 [Twitch Developer Console](https://dev.twitch.tv/console)
2. 建立應用程式取得 Client ID 和 Client Secret
3. 使用 OAuth 流程取得 Access Token
4. 前往 [Twitch Chat OAuth Generator](https://twitchapps.com/tmi/) 取得聊天 OAuth Token

## 使用方式

### 開發模式

```bash
npm run dev
# 伺服器啟動於 http://localhost:3000
```

### 生產模式

```bash
npm run build
npm start
```

### 程式碼檢查

```bash
npm run lint
```

## 專案結構

```
obs_tool/
├── src/
│   ├── api/                    # API 呼叫層
│   │   ├── song.ts             # 歌曲管理 API
│   │   ├── twitch.ts           # Twitch Helix API
│   │   ├── spotify.ts          # Spotify Web API（現在播放）
│   │   └── messageBoard.ts     # 留言板 API
│   │
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 後台管理首頁
│   │   ├── layout.tsx          # 根佈局
│   │   ├── globals.css         # 全域樣式
│   │   ├── api/
│   │   │   └── spotify/        # playback（正規化播放狀態）、artwork（CORS 代理）、analysis
│   │   ├── nowplaying/         # Spotify Now Playing HUD overlay
│   │   │   ├── layouts/        # 版面註冊表（bar / minimal / ticker / square）
│   │   │   ├── visualizers/    # 視覺化註冊表（bars / wave / radial）
│   │   │   └── components/     # Artwork、ProgressBar、HUD 外框
│   │   ├── chat/               # 聊天顯示功能
│   │   │   ├── page.tsx        # 聊天側欄（/chat）
│   │   │   ├── full/           # 全螢幕 HUD（/chat/full）
│   │   │   │   ├── components/ # HUD 子組件（StatsPanel、TopChatters、SpotifyNowPlaying…）
│   │   │   │   └── hooks/      # useStreamTelemetry、useChatAggregates、useSpotifyNowPlaying
│   │   ├── clock/              # 時鐘顯示功能
│   │   ├── song/               # 歌曲播放列表（SSE）
│   │   └── video/              # 視頻播放
│   │
│   ├── components/             # React 組件
│   │   ├── admin/              # 後台管理組件
│   │   │   ├── songList.tsx    # 歌單管理
│   │   │   ├── songBook.tsx    # 歌本管理
│   │   │   ├── messageBoard.tsx# 留言板管理
│   │   │   └── liveTools.tsx   # Live Tools Hub（Overlay 管理）
│   │   ├── chat/               # 聊天相關組件
│   │   └── ui/                 # shadcn/ui 組件庫
│   │
│   └── lib/                    # 工具函式庫
│       ├── nowplaying/         # HUD 資料層：playback 同步、封面取色、波形資料、設定 schema
│       ├── twitch.ts           # Twitch WebSocket 聊天監聽
│       └── utils.ts            # 通用工具函式
│
├── public/                     # 靜態資源（獎勵視頻）
├── tailwind.config.ts          # Tailwind 配置
├── next.config.mjs             # Next.js 配置
└── package.json                # 專案依賴
```

## OBS 使用教學

### 新增瀏覽器來源

1. 在 OBS 中新增「瀏覽器」來源
2. 設定 URL 為對應功能的網址：
   - 聊天顯示（側欄）：`http://localhost:3000/chat`（建議 360 × 680）
   - 聊天室 Full HUD：`http://localhost:3000/chat/full`（建議 1280 × 720 或更大）
   - 時鐘顯示：`http://localhost:3000/clock?style=digital`
   - Spotify Now Playing HUD：`http://localhost:3000/nowplaying`（建議 920 × 200）
   - 歌曲列表：`http://localhost:3000/song`
   - 獎勵視頻：`http://localhost:3000/video`
3. 調整寬度和高度以符合需求
4. 勾選「關閉時重新整理瀏覽器」

> **提示**：後台管理系統（`/`）的 **Live Tools Hub** 頁籤提供所有 Overlay 的連結與即時預覽，可直接複製網址貼入 OBS。

### 時鐘風格參數

```
/clock?style=digital  # 數位時鐘
/clock?style=simple   # 簡易時鐘
/clock?style=all      # 全部風格
```

### Now Playing HUD 參數

所有參數皆可省略；數值超出範圍會自動夾值，未知的版面／樣式名稱會退回預設，不會讓畫面變成空白。

| 參數 | 值 | 預設 | 說明 |
|------|-----|------|------|
| `layout` | `bar` / `minimal` / `ticker` / `square` | `bar` | HUD 版面 |
| `viz` | `bars` / `wave` / `radial` | `bars` | 視覺化樣式（`radial` 建議搭配 `layout=square`） |
| `art` | `0` / `1` | `1` | 是否顯示專輯封面（取色不受此開關影響） |
| `color` | `auto` 或 `#rrggbb` | `auto` | `auto` = 取自專輯封面 |
| `opacity` | `0.1`–`1` | `1` | 整體透明度 |
| `glow` | `0`–`2` | `1` | Glow 強度 |
| `font` | `spaceMono` / `montserrat` / `poppins` / `notoSans` | `spaceMono` | 字體 |
| `speed` | `0.1`–`3` | `1` | 動畫速度倍率 |
| `bars` | `8`–`192` | `64` | 波形數量 |
| `fps` | `15`–`60` | `60` | 動畫 FPS 上限（低階機可調低） |
| `scanlines` / `grid` / `readout` | `0` / `1` | `1` | 掃描線／格線／技術資訊列 |
| `demo` | `0` / `1` | `0` | 使用假曲目，沒有在播歌時也能調整外觀 |
| `standby` | `0` / `1` | `0` | 沒在播放時顯示暗色待機 HUD（方便在 OBS 裡確認來源還活著） |
| `debug` | `0` / `1` | `0` | 顯示無法取得播放資料的原因。**勿用於直播** |

範例：`/nowplaying?layout=square&viz=radial&color=%23ff2d95&glow=1.4`

### 排錯：overlay 是空白的

**空白是正常設計**——沒有在播放歌曲時 overlay 會完全隱藏，直播畫面才不會殘留死掉的 HUD。但這也代表「沒在播放」和「憑證壞掉」長得一模一樣。要分辨：

1. 開啟後台的 **Now Playing HUD** 分頁，最上方的「Spotify 連線狀態」會直接寫出原因。
2. 或在 overlay 網址加上 `?debug=1`，畫面上會顯示狀態。
3. 或直接開 `/api/spotify/playback`，看回傳 JSON 的 `status` 欄位。

| `status` | 意思 | 怎麼處理 |
|---|---|---|
| `ok` | 正在播放或暫停 | 正常 |
| `idle` | 連線正常，但沒有在播放 | 正常，播首歌就會出現 |
| `unconfigured` | 環境變數缺漏（`detail` 會列出是哪幾個） | 到部署平台補上 |
| `auth_failed` | refresh token 被撤銷／過期，或憑證錯誤 | 需重新授權產生新的 refresh token |
| `rate_limited` | 打太頻繁 | 會自動恢復 |
| `upstream_error` | Spotify 回應異常 | 看 `detail` |

> 這個端點**永遠回 HTTP 200**，即使失敗也一樣——OBS 的 Browser Source 不該出現錯誤頁面，所以真正的結果放在 `status` 欄位裡。

> **關於波形**：Spotify Web API 不提供即時音訊頻譜。預設的波形由歌曲 ID 產生（每首歌固定且獨特，並與播放／暫停狀態同步），但**不對應實際音訊內容**。程式會在背景嘗試呼叫 Spotify 的 audio-analysis 端點，成功即自動升級為真實音訊驅動（HUD 右上角會顯示 `FFT·LIVE` 而非 `FFT·SYN`）；該端點自 2024-11-27 起已對新申請的 app 停用，取不到時會靜默沿用程序化波形。

## API 端點

專案使用外部 API 服務 (`https://shustream.zeabur.app`)：

### 歌曲管理
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/songList` | 取得所有歌曲 |
| GET | `/songList/active` | 取得活動歌曲 |
| GET | `/songList/history` | 取得歷史歌曲 |
| POST | `/songList` | 新增歌曲 |
| PUT | `/songList/:id` | 更新歌曲 |
| PUT | `/songList/start/:id` | 開始播放 |
| PUT | `/songList/stop/:id` | 停止播放 |
| DELETE | `/songList/:id` | 歸檔歌曲 |

### 留言板
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/messageBoard` | 取得留言 |

## 頻道點數獎勵映射

| 獎勵名稱 | 視頻檔案 |
|---------|---------|
| 888 | ksp884.mp4（隨機） |
| 退訂了 | shuunSubscribe.mp4 |
| TAT | kspCry.mp4 |
| 好想姊姊 | kspMiss.mp4 |

## 授權條款

此專案為私人專案。

---

![Repobeats Analytics](https://repobeats.axiom.co/api/embed/fcb7aef40a99304479a98e4429cbe0b2fb6e51f6.svg "Repobeats analytics image")
