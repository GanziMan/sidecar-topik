import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// 해당 문제에 대한 채점 기록을 조회하는 API
export async function GET(_request: Request, { params }: { params: Promise<{ question_id: string }> }) {
  const supabase = await createClient();
  const { question_id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!question_id) {
    return NextResponse.json({ error: "question_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_submissions")
    .select(
      `
      id,
      created_at,
      user_answer,
      attempt_no,
      submission_results (
        id,
        created_at,
        evaluation,
        correction
      )
    `
    )
    .eq("user_id", user.id)
    .eq("question_id", question_id)
    .order("attempt_no", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
