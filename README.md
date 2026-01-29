# OBS Tool

Twitch 直播主專用的 OBS 管理工具集，提供聊天顯示、歌曲播放列表管理、時鐘顯示、頻道點數獎勵視頻播放等功能。

## 功能特色

### 聊天顯示系統 (`/chat`)
- 即時 Twitch 聊天監聽與顯示
- 支援 Twitch 官方表情符號和 7TV 自訂表情
- 徽章系統（訂閱者、版主、VIP 等）
- 訂閱、禮物、Bits 歡呼事件通知
- 實時觀眾數與直播狀態顯示
- 可配置的消息數量和自動隱藏時間

### 時鐘顯示 (`/clock`)
- 多種風格選擇：數位時鐘、簡易時鐘
- 類比時鐘（時針/分針/秒針）
- 日期與星期顯示
- 支援 12 小時制

### 歌曲播放列表 (`/song`)
- 即時歌曲列表顯示
- 每 2 秒自動更新
- 顯示當前播放與待播歌曲

### 頻道點數獎勵視頻 (`/video`)
- 監聽 Twitch 頻道點數兌換
- 自動播放對應獎勵視頻
- 支援多種獎勵類型映射

### 後台管理系統 (`/`)
- E-ink 風格儀表板介面
- 歌曲管理（新增、編輯、排序、歸檔）
- 拖曳排序功能
- 歌本分類管理
- 留言板管理
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
│   │   └── messageBoard.ts     # 留言板 API
│   │
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 後台管理首頁
│   │   ├── layout.tsx          # 根佈局
│   │   ├── globals.css         # 全域樣式
│   │   ├── chat/               # 聊天顯示功能
│   │   ├── clock/              # 時鐘顯示功能
│   │   ├── song/               # 歌曲播放列表
│   │   └── video/              # 視頻播放
│   │
│   ├── components/             # React 組件
│   │   ├── admin/              # 後台管理組件
│   │   ├── chat/               # 聊天相關組件
│   │   └── ui/                 # shadcn/ui 組件庫
│   │
│   └── lib/                    # 工具函式庫
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
   - 聊天顯示：`http://localhost:3000/chat`
   - 時鐘顯示：`http://localhost:3000/clock?style=digital`
   - 歌曲列表：`http://localhost:3000/song`
   - 獎勵視頻：`http://localhost:3000/video`
3. 調整寬度和高度以符合需求
4. 勾選「關閉時重新整理瀏覽器」

### 時鐘風格參數

```
/clock?style=digital  # 數位時鐘
/clock?style=simple   # 簡易時鐘
/clock?style=all      # 全部風格
```

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
