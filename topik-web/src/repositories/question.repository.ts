import { createClient } from "@/supabase/server";
import { DB_TABLES, DB_COLUMNS } from "@/config/db.config";
import { GetQuestionContentResponse } from "@/types/question.types";

export interface QuestionEntity {
  exam_year: number;
  exam_round: number;
  question_number: number;
}

export const QuestionRepository = {
  async findAllOptions(): Promise<QuestionEntity[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from(DB_TABLES.QUESTIONS).select(`
      ${DB_COLUMNS.QUESTIONS.EXAM_YEAR},
      ${DB_COLUMNS.QUESTIONS.EXAM_ROUND},
      ${DB_COLUMNS.QUESTIONS.QUESTION_NUMBER}
    `);

    if (error) {
      console.error("QuestionRepository.findAllOptions error:", error);
      throw error;
    }

    return data || [];
  },

  async findOne(year: number, round: number, type: number): Promise<GetQuestionContentResponse | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(DB_TABLES.QUESTIONS)
      .select(
        `
        ${DB_COLUMNS.QUESTIONS.ID}, 
        ${DB_COLUMNS.QUESTIONS.CONTENT}
        `
      )
      .eq(DB_COLUMNS.QUESTIONS.EXAM_YEAR, year)
      .eq(DB_COLUMNS.QUESTIONS.EXAM_ROUND, round)
      .eq(DB_COLUMNS.QUESTIONS.QUESTION_NUMBER, type)
      .single();

    if (error) {
      // no rows found is not an exception for findOne (return null)
      if (error.code === "PGRST116") return null;
      console.error("QuestionRepository.findOne error:", error);
      throw error;
    }

    return data as unknown as GetQuestionContentResponse;
  },
};
