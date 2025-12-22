import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedSkill, SkillSchema } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSkillFromVideo = async (
  videoBase64: string,
  mimeType: string,
  userNotes: string
): Promise<GeneratedSkill> => {
  try {
    const modelId = "gemini-2.5-flash-preview-09-2025"; // Best for multimodal analysis

    const videoPart = {
      inlineData: {
        data: videoBase64,
        mimeType: mimeType,
      },
    };

    const promptText = `
      You are an expert Robotic Process Automation (RPA) Engineer and AI Systems Architect.
      
      Your task is to analyze the attached screen recording video. The video shows a user performing a specific task on their computer (e.g., using Excel, editing a video, browsing the web).
      
      Goal: Abstract this workflow into a reusable "Skill" definition.
      
      Specific Instructions:
      1. Identify the software/tools being used.
      2. Analyze the sequence of actions taken by the user.
      3. Identify variable inputs (filenames, numbers, text) that should be generalized as parameters.
      4. Create a JSON structure defining this skill with a list of steps and parameters.
      
      User Notes Context: "${userNotes}"
      
      Return the response in strict JSON format matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          videoPart,
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A snake_case function name for this skill (e.g., `batch_process_excel_invoices`)." },
            description: { type: Type.STRING, description: "A comprehensive description of what this skill achieves." },
            tool_software: { type: Type.STRING, description: "The primary software or websites used in the video." },
            estimated_duration: { type: Type.STRING, description: "Estimated time to execute this task manually." },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A step-by-step natural language summary of the logic."
            },
            parameters: {
              type: Type.ARRAY,
              description: "List of input parameters detected in the workflow.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Parameter name (snake_case)" },
                  type: { type: Type.STRING, enum: ["string", "number", "boolean", "array"], description: "Data type" },
                  description: { type: Type.STRING, description: "Purpose of this parameter" }
                },
                required: ["name", "type", "description"]
              }
            }
          },
          required: ["name", "description", "tool_software", "steps", "parameters"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const skillData = JSON.parse(text) as SkillSchema;

    return {
      skill: skillData,
      rawResponse: text
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};