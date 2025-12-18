export interface Rubric {
  score: string;
  description: string;
}

export interface PromptSection {
  title: string;
  rubric: Rubric[];
}

export interface StructuredPrompt {
  sections: PromptSection[];
  guidelines: string[];
}
