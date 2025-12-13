export interface Criterion {
  score: string;
  description: string;
}

export interface PromptSection {
  title: string;
  criteria: Criterion[];
}

export interface StructuredPrompt {
  sections: PromptSection[];
  guidelines: string[];
}
