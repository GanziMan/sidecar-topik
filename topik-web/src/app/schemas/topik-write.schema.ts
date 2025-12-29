import { QuestionType } from "@/types/common.types";
import z from "zod";

export const topikWritingEvaluatorRequestSchema = z.object({
  question_id: z.string(),
  year: z.number(),
  round: z.number(),
  questionNumber: z.enum(QuestionType),
  answer: z.union([
    z.string(),
    z.object({
      answer1: z.string(),
      answer2: z.string(),
    }),
  ]),
});

export type TopikWritingEvaluatorRequest = z.output<typeof topikWritingEvaluatorRequestSchema>;

const evaluationResultSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvement_suggestions: z.array(z.string()),
  overall_feedback: z.string(),
});

export const topikWritingCorrectorRequestSchema = z.object({
  year: z.number(),
  round: z.number(),
  questionNumber: z.enum([QuestionType.Q53, QuestionType.Q54]),
  answer: z.string(),
  evaluationResult: evaluationResultSchema,
  evaluationScores: z.object({
    task_performance: z.number(),
    structure: z.number(),
    language_use: z.number(),
  }),
});

export type TopikWritingCorrectorRequest = z.output<typeof topikWritingCorrectorRequestSchema>;

export const questionParamsSchema = z.object({
  year: z.coerce.number().int().default(2025),
  round: z.coerce.number().int().default(1),
  type: z.enum(QuestionType).default(QuestionType.Q51),
});
