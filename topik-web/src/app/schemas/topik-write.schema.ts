import { QuestionType } from "@/types/topik.types";
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
  total_score: z.number(),
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
});

export type TopikWritingCorrectorRequest = z.output<typeof topikWritingCorrectorRequestSchema>;
