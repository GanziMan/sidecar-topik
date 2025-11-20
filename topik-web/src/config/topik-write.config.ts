import { QuestionType } from "@/types/topik.types";

type QuestionConfig = {
  [key in QuestionType]: {
    type: "sentenceCompletion" | "essay";
    maxLength: number;
    totalScore: number;
    scoreInfo: Record<string, number>;
    charLimits?: {
      min: number;
      max: number;
    };
  };
};

export const QUESTION_CONFIG: QuestionConfig = {
  [QuestionType.Q51]: {
    type: "sentenceCompletion",
    maxLength: 100,
    totalScore: 10,
    scoreInfo: {
      answer1: 5,
      answer2: 5,
    },
  },
  [QuestionType.Q52]: {
    type: "sentenceCompletion",
    maxLength: 100,
    totalScore: 10,
    scoreInfo: {
      answer1: 5,
      answer2: 5,
    },
  },
  [QuestionType.Q53]: {
    type: "essay",
    maxLength: 300,
    totalScore: 30,
    scoreInfo: {
      task_performance: 7,
      structure: 7,
      language_use: 16,
    },
    charLimits: {
      min: 200,
      max: 300,
    },
  },
  [QuestionType.Q54]: {
    type: "essay",
    maxLength: 700,
    totalScore: 50,
    scoreInfo: {
      task_performance: 12,
      structure: 12,
      language_use: 26,
    },
    charLimits: {
      min: 600,
      max: 700,
    },
  },
};

export const QUESTION_TYPES = Object.keys(QUESTION_CONFIG) as QuestionType[];

export const IMAGE_MIME_TYPES_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
