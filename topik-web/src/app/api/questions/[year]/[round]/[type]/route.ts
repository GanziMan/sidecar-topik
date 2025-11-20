import { GetQuestionContentResponse } from "@/types/topik-write.types";
import { ErrorResponse } from "@/types/topik.types";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string; round: string; type: string }> }
): Promise<NextResponse<GetQuestionContentResponse | ErrorResponse>> {
  const { year, round, type } = await params;

  if (!type || !year || !round) {
    return createErrorResponse("Year, round, and question ID are required", 400);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("id, title, question_text, image_url")
      .eq("exam_year", year)
      .eq("exam_round", round)
      .eq("question_number", Number(type))
      .single();

    if (error) {
      console.error("Error fetching question:", JSON.stringify(error, null, 2));
      return createErrorResponse("Internal Server Error", 500, "INTERNAL_SERVER_ERROR");
    }

    if (!data) {
      return createErrorResponse("Question not found", 404, "NOT_FOUND");
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return createErrorResponse("Internal Server Error", 500, "UNEXPECTED_ERROR");
  }
}
