import { QuestionRepository } from "@/repositories/question.repository";
import { QuestionType } from "@/types/common.types";

export interface QuestionOption {
  year: number;
  round: number;
  type: QuestionType | number;
}

export async function getQuestionOptions(): Promise<QuestionOption[]> {
  try {
    const questions = await QuestionRepository.findAllOptions();

    return questions.map((q) => ({
      year: q.exam_year,
      round: q.exam_round,
      type: q.question_number,
    }));
  } catch (error) {
    console.error("Failed to get question options:", error);
    return [];
  }
}
