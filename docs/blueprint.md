# OrgVerse 系統架構藍圖 (Blueprint)

## 核心願景
OrgVerse 是一個現代化的工作空間架構系統，旨在將「數位身分」從單一組織中解構，演進為跨維度、跨空間的「多維度協作網路」。

## 1. 階層架構 (Hierarchy)

### 1.1 組織維度 (Organization) - [Root Boundary]
- **定義**：最高等級的資料與身分邊界（數據孤島）。
- **職責**：管理全局身分、訂閱層級與組織層級的安全策略。
- **成員模型**：**組織成員 (Org Members)** 具備進入該維度的基本身分，但不代表具備所有空間的存取權。

### 1.2 邏輯空間 (Workspace) - [Logic Boundary]
- **定義**：組織內的純粹技術運行環境（容器）。
- **職責**：定義運行上下文 (Context)、資源範圍 (Scope) 與安全策略 (Policy)。
- **成員模型**：**空間成員 (Workspace Members)** 針對特定空間定義的存取名單，實現精確的最小權限原則。

### 1.3 能力註冊表 (Specs/Blocks) - [Atomic Capabilities]
- **定義**：掛載於 Workspace 內的獨立技術規範單元。
- **職責**：定義 API、數據模型或組件規範，模組間保持絕對隔離，僅透過 Facade 接口進行通訊。

## 2. 核心功能模組

- **身分主權入口 (SSO)**：統一的身分驗證門戶 (demo/12345)。
- **維度切換器 (Global Switcher)**：允許使用者在不同組織維度間無縫切換。
- **UI 共振適配 (UI Adapter)**：利用 GenAI (Genkit) 偵測 Workspace 上下文，自動生成並應用符合品牌特色的 HSL 色彩配置。
- **雙層成員管理**：
  - 組織級：人才招募與全局身分管理。
  - 空間級：特定技術節點的存取授權。

## 3. 技術棧 (Tech Stack)

- **框架**: Next.js 15 (App Router)
- **UI**: ShadCN UI + Tailwind CSS
- **狀態管理**: Zustand (Persist)
- **AI 引擎**: Genkit v1.x (Google Gemini 2.5 Flash)
- **後端整合**: Firebase (Authentication / Firestore / Storage)
- **字體**: Inter (Headline & Body)

## 4. 視覺語言 (Visual Identity)

- **Primary**: Deep Sky Blue (#00BFFF) - 代表信任與權威。
- **Background**: Light Gray (#E0E0E0) - 提供中性底色。
- **Accent**: Coral (#FF807A) - 用於交互元素。
- **風格**: 原子化、模塊化疊加、磨砂玻璃效果、流體過渡。

---
*文件狀態：已同步於重構 v2.0 - 原子化空間架構優化版*
