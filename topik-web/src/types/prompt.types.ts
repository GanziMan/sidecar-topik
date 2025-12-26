export interface RubricDetail {
  intro: string;
  items: string[];
}

export interface Rubric {
  score: string;

  detail?: RubricDetail;
  // TODO: description 필드 제거
  description?: string;
}

export interface PromptSection {
  title: string;
  rubric: Rubric[];
}

export interface StructuredPrompt {
  sections: PromptSection[];
  guidelines: string[];
}
