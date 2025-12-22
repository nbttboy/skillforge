# SkillForge - AI Skill Generator

SkillForge 是一个基于 Web 的智能工具，旨在利用 Google Gemini 的多模态能力，将用户的屏幕操作录屏、PDF 文档或长截图自动转化为符合 [Claude Skill Creator](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) 标准的技能包（Skill Package）。

它能够识别工作流逻辑，自动生成 `SKILL.md` 指南，并提取可复用的代码脚本（Scripts）、参考文档（References）和资源文件（Assets），最终打包为 `.zip` 文件供分发使用。

## ✨ 主要功能 (Features)

*   **多模态输入支持**:
    *   🎥 **屏幕录制**: 直接在浏览器中录制屏幕操作流程。
    *   📂 **文件上传**: 支持上传现有的视频文件、PDF 文档或长截图。
*   **AI 智能分析**: 集成 Google Gemini 2.5 (Flash/Pro) 模型，自动分析视觉和文本内容，提取工作流步骤和逻辑。
*   **标准技能包生成**: 自动生成符合 Claude Skill 规范的目录结构：
    *   `SKILL.md` (包含 Frontmatter 和操作指南)
    *   `scripts/` (Python/Bash 脚本)
    *   `references/` (参考文档)
    *   `assets/` (模板或静态资源)
*   **在线编辑器**: 提供类似 IDE 的界面，支持在下载前预览和修改生成的 Markdown 和代码文件。
*   **本地历史记录**: 自动保存生成的技能记录到本地浏览器存储，方便随时查看和修改。
*   **一键打包导出**: 将所有生成的文件打包为通用的 `.zip` 格式下载。

## 🛠 环境配置 (Prerequisites & Setup)

### 前置要求
*   Node.js (v18 或更高版本)
*   Google Cloud Project (用于获取 Gemini API Key)

### 安装步骤

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/skillforge.git
    cd skillforge
    ```

2.  **安装依赖**
    本项目使用 ES Modules 和 CDN 引入 React，核心逻辑通过 TypeScript 编写。无需复杂的 `npm install` 过程（如果在 WebContainer 环境），但在本地开发时建议初始化：
    ```bash
    npm install
    ```

3.  **配置 API Key**
    本项目依赖 Google Gemini API。你需要在环境变量中配置 `API_KEY`。
    
    *   **本地开发**: 创建 `.env` 文件:
        ```env
        API_KEY=your_google_gemini_api_key_here
        ```
    *   **WebContainer / StackBlitz**: 这里的环境通常会自动注入 `process.env.API_KEY`。请确保你的运行环境已配置该变量。

## 📖 操作指引 (User Guide)

### 1. 启动应用
运行开发服务器：
```bash
npm run start
# 或者根据你的构建工具
npm run dev
```
打开浏览器访问 `http://localhost:3000` (或控制台显示的端口)。

### 2. 捕捉内容 (Capture)
在主页，你有两种方式输入内容：
*   **点击 "Record Screen"**: 选择要录制的屏幕区域（整个屏幕、窗口或标签页）。完成操作后点击 "Stop Recording"。
*   **点击 "Upload File"**: 上传现有的视频文件 (`.webm`, `.mp4`)、PDF 文档 (`.pdf`) 或图片。

### 3. AI 分析 (Analyze)
*   进入预览界面后，你可以查看刚才录制或上传的内容。
*   **(可选)** 在 "Context Notes" 输入框中添加备注，例如："这是一个关于如何提交发票的流程" 或 "请重点提取其中的 Python 脚本"。
*   点击 **"Generate Skill"**。Gemini AI 将开始分析内容结构。

### 4. 编辑与预览 (Edit & Preview)
分析完成后，进入结果视图：
*   **左侧**: 文件资源管理器，列出了生成的 `SKILL.md` 及 `scripts/`, `references/` 等文件夹下的文件。
*   **右侧**: 代码编辑器。你可以直接修改生成的内容（例如修正 Markdown 格式或优化 Python 代码）。
*   修改后点击 **"Save Changes"** 保存当前状态。

### 5. 导出 (Export)
*   点击右上角的 **"Download Package (.zip)"** 按钮。
*   浏览器将下载一个包含完整目录结构的 ZIP 压缩包。解压后即可作为标准的 Claude Skill 使用。

## 📁 项目结构

```
.
├── index.html          # 入口 HTML (包含 Tailwind 和 ImportMap)
├── index.tsx           # React 入口
├── App.tsx             # 主应用逻辑与路由状态管理
├── types.ts            # TypeScript 类型定义
├── services/
│   └── geminiService.ts # Google Gemini API 调用逻辑 (Prompt Engineering)
├── components/
│   ├── Recorder.tsx    # 录屏与文件上传组件
│   ├── AnalysisView.tsx# 媒体预览与分析触发组件
│   ├── ResultView.tsx  # 结果展示与编辑器组件
│   └── LoadingScreen.tsx
└── utils/
    ├── videoUtils.ts   # Blob 处理工具
    └── zipUtils.ts     # JSZip 打包工具
```

## ⚠️ 注意事项

*   **API 配额**: 请确保你的 Google Gemini API Key 有足够的配额，尤其是处理长视频时。
*   **隐私**: 所有的视频处理和分析均通过 Google Gemini API 进行。请勿上传包含敏感个人信息（PII）或机密数据的录屏，除非你了解并接受相关风险。
*   **浏览器兼容性**: 建议使用 Chrome、Edge 或 Firefox 以获得最佳的 `MediaRecorder` 支持。

---
License: MIT
