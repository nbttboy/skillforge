import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedSkill, SkillPackage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSkillFromVideo = async (
  mediaBase64: string,
  mimeType: string,
  userNotes: string
): Promise<GeneratedSkill> => {
  try {
    const modelId = "gemini-2.5-flash-preview-09-2025"; 

    const mediaPart = {
      inlineData: {
        data: mediaBase64,
        mimeType: mimeType,
      },
    };

    const systemPrompt = `
      You are an expert Skill Creator for Claude. You analyze media inputs (Screen Recordings, PDF Documents, or Screenshots) and create high-quality "Skills" that extend an AI agent's capabilities.

      ### CORE PRINCIPLES
      1. **Concise is Key**: The context window is precious. Do not include verbose explanations.
      2. **Structure**: A skill consists of a \`SKILL.md\` file and optional resources (\`scripts/\`, \`references/\`).
      3. **SKILL.md Format**:
         - **Frontmatter**: YAML with \`name\` and \`description\`. The description MUST explain *when* to use the skill (triggers).
         - **Body**: Markdown instructions (Overview, Workflow, etc.).
      4. **Progressive Disclosure**: Move large tables, schemas, or complex boilerplate code into \`references/\` or \`scripts/\` files.

      ### TASK
      Analyze the attached media (video workflow, PDF manual, or screenshot). Identify the workflow, logic, or knowledge provided. Create a JSON object representing the file structure for a new Skill.

      User Notes: "${userNotes}"
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          mediaPart,
          { text: systemPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slug: { 
              type: Type.STRING, 
              description: "The folder name for the skill. Hyphen-case (e.g., 'invoice-processor')." 
            },
            frontmatter: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Display name (hyphen-case preferred for internal name, but descriptive is okay)." },
                description: { type: Type.STRING, description: "Trigger-focused description. Example: 'Use when the user needs to process PDF invoices...'" }
              },
              required: ["name", "description"]
            },
            body: { 
              type: Type.STRING, 
              description: "The Markdown body of SKILL.md. Start with # Title. Do NOT include the YAML frontmatter here." 
            },
            resources: {
              type: Type.ARRAY,
              description: "List of helper files (scripts, references) extracted from the workflow.",
              items: {
                type: Type.OBJECT,
                properties: {
                  filename: { type: Type.STRING, description: "e.g., 'parse_data.py' or 'api_schema.md'" },
                  type: { type: Type.STRING, enum: ["script", "reference", "asset"] },
                  content: { type: Type.STRING, description: "The content of the file. For scripts, provide Python/Bash code. For references, provide Markdown." },
                  language: { type: Type.STRING, description: "Programming language for syntax highlighting (python, markdown, etc.)" }
                },
                required: ["filename", "type", "content"]
              }
            }
          },
          required: ["slug", "frontmatter", "body", "resources"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const skillPackage = JSON.parse(text) as SkillPackage;

    return {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      skillPackage,
      rawResponse: text
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};