export interface CorrectionChangeSentence {
  original: string;
  revised: string;
  position: {
    paragraph: number;
    sentence: number;
  };
  reason: string;
}

export interface CorrectionImprovement {
  expected_score_gain: string;
  key_improvements: string[];
}

export interface CorrectionResponse {
  original_answer: string;
  corrected_answer: string;
  sentence_corrections: CorrectionChangeSentence[];
  improvement_effects: CorrectionImprovement;
  overall_feedback: string;
}
