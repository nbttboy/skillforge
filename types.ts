export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface SkillFile {
  filename: string;
  content: string;
  language?: string; // e.g., 'python', 'markdown', 'json'
  type: 'script' | 'reference' | 'asset';
}

export interface SkillPackage {
  slug: string; // hyphen-case-name
  frontmatter: {
    name: string; // Title Case
    description: string;
  };
  body: string; // The markdown body of SKILL.md
  resources: SkillFile[]; // scripts/, references/, assets/
}

export interface GeneratedSkill {
  skillPackage: SkillPackage;
  rawResponse?: string;
}