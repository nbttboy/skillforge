export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface SkillParameter {
  name: string;
  type: string;
  description: string;
}

export interface SkillSchema {
  name: string;
  description: string;
  tool_software: string;
  estimated_duration: string;
  parameters: SkillParameter[];
  steps: string[];
}

export interface GeneratedSkill {
  skill: SkillSchema;
  rawResponse?: string;
}