# SkillForge - AI Skill Generator

SkillForge is a web-based intelligent tool designed to leverage the multi-modal capabilities of Google Gemini to automatically convert user screen recordings, PDF documents, or long screenshots into Skill Packages compliant with the [Claude Skill Creator](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) standard.

It identifies workflow logic, automatically generates `SKILL.md` guides, and extracts reusable code scripts, reference documents, and assets, finally packaging them into a `.zip` file for distribution.

## ✨ Features

*   **Multi-modal Input Support**:
    *   🎥 **Screen Recording**: Record screen operations directly in the browser.
    *   📂 **File Upload**: Support uploading existing video files, PDF documents, or images.
*   **AI Intelligent Analysis**: Integrated with Google Gemini 2.5 (Flash/Pro) models to automatically analyze visual and textual content, extracting workflow steps and logic.
*   **Standard Skill Package Generation**: Automatically generates directory structures compliant with Claude Skill specifications:
    *   `SKILL.md` (Contains Frontmatter and operation guide)
    *   `scripts/` (Python/Bash scripts)
    *   `references/` (Reference documents)
    *   `assets/` (Templates or static resources)
*   **Online Editor**: Provides an IDE-like interface to preview and modify generated Markdown and code files before downloading.
*   **Local History**: Automatically saves generated skill records to local browser storage for easy viewing and modification at any time.
*   **One-Click Export**: Package all generated files into a generic `.zip` format for download.

## 🛠 Prerequisites & Setup

### Requirements
*   Node.js (v18 or higher)
*   Google Cloud Project (for obtaining Gemini API Key)

### Installation Steps

1.  **Clone the Project**
    ```bash
    git clone https://github.com/your-username/skillforge.git
    cd skillforge
    ```

2.  **Install Dependencies**
    This project uses ES Modules and imports React via CDN. The core logic is written in TypeScript. No complex `npm install` process is strictly required (if in a WebContainer environment), but initializing for local development is recommended:
    ```bash
    npm install
    ```

3.  **Configure API Key**
    This project depends on the Google Gemini API. You need to configure the `API_KEY` in your environment variables.
    
    *   **Local Development**: Create a `.env` file:
        ```env
        API_KEY=your_google_gemini_api_key_here
        ```
    *   **WebContainer / StackBlitz**: The environment here usually automatically injects `process.env.API_KEY`. Please ensure your runtime environment has this variable configured.

## 📖 User Guide

### 1. Start the Application
Run the development server:
```bash
npm run start
# Or depending on your build tool
npm run dev
```
Open your browser and visit `http://localhost:3000` (or the port shown in the console).

### 2. Capture Content
On the homepage, you have two ways to input content:
*   **Click "Record Screen"**: Select the screen area to record (full screen, window, or tab). Click "Stop Recording" when finished.
*   **Click "Upload File"**: Upload existing video files (`.webm`, `.mp4`), PDF documents (`.pdf`), or images.

### 3. AI Analysis
*   Enter the preview interface to review the content you just recorded or uploaded.
*   **(Optional)** Add notes in the "Context Notes" input box, e.g., "This is a process for submitting invoices" or "Please focus on extracting Python scripts".
*   Click **"Generate Skill"**. Gemini AI will begin analyzing the content structure.

### 4. Edit & Preview
After analysis is complete, enter the Result View:
*   **Left**: File Explorer listing the generated `SKILL.md` and files under `scripts/`, `references/`, etc.
*   **Right**: Code Editor. You can directly modify the generated content (e.g., fixing Markdown formatting or optimizing Python code).
*   Click **"Save Changes"** to save the current state after modifications.

### 5. Export
*   Click the **"Download Package (.zip)"** button in the top right corner.
*   The browser will download a ZIP archive containing the full directory structure. Unzip it to use as a standard Claude Skill.

## 📁 Project Structure

```
.
├── index.html          # Entry HTML (includes Tailwind and ImportMap)
├── index.tsx           # React Entry
├── App.tsx             # Main App Logic & Route State Management
├── types.ts            # TypeScript Type Definitions
├── services/
│   └── geminiService.ts # Google Gemini API Call Logic (Prompt Engineering)
├── components/
│   ├── Recorder.tsx    # Screen Recording & File Upload Component
│   ├── AnalysisView.tsx# Media Preview & Analysis Trigger Component
│   ├── ResultView.tsx  # Result Display & Editor Component
│   └── LoadingScreen.tsx
└── utils/
    ├── videoUtils.ts   # Blob Processing Utils
    └── zipUtils.ts     # JSZip Packaging Utils
```

## ⚠️ Notes

*   **API Quota**: Please ensure your Google Gemini API Key has sufficient quota, especially when processing long videos.
*   **Privacy**: All video processing and analysis are conducted via the Google Gemini API. Do not upload screen recordings containing sensitive personal information (PII) or confidential data unless you understand and accept the risks.
*   **Browser Compatibility**: Chrome, Edge, or Firefox are recommended for the best `MediaRecorder` support.

---
License: MIT