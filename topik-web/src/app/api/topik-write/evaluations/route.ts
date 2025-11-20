import { ApiClient, handleKyError } from "@/lib/ky";
import { NextResponse } from "next/server";
import { EvaluationResponseUnion } from "@/types/topik-write.types";
import { topikWritingEvaluatorRequestSchema } from "@/app/schemas/topik-write.schema";
import { cookies } from "next/headers";
import { AGENT_APP_EVALUATOR } from "@/config/shared";
import {
  AgentUserMessagePart,
  ErrorResponse,
  LlmMessageRole,
  TopikWritingAgentRequest,
  TopikWritingEvent,
} from "@/types/topik.types";
import { createErrorResponse } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server"; // Import Supabase client

export async function POST(request: Request): Promise<NextResponse<EvaluationResponseUnion | ErrorResponse>> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value ?? "";
  const userId = cookieStore.get("user_id")?.value ?? "";

  if (!userId) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const clientEvaluationRequest = await request.json();
  try {
    const { success, data: parsedData, error } = topikWritingEvaluatorRequestSchema.safeParse(clientEvaluationRequest);

    if (!success) {
      return createErrorResponse(error.message, 400, "VALIDATION_ERROR");
    }

    const { year, round, questionNumber, answer, question_id } = parsedData;

    const evaluationInputPayload = {
      exam_year: year,
      exam_round: round,
      question_number: Number(questionNumber),
      answer,
    } as Record<string, unknown>;

    const agentUserMessageParts: AgentUserMessagePart[] = [{ text: JSON.stringify(evaluationInputPayload) }];

    const agentEvents: TopikWritingEvent[] = await ApiClient.post(
      "run",
      EvaluationRequest(agentUserMessageParts, userId, sessionId)
    );

    const textOutputEvent = agentEvents
      .slice()
      .reverse()
      .find((e) => e.content?.parts[0]?.text);

    if (textOutputEvent && textOutputEvent.content?.parts[0]?.text) {
      const textFromAgent = textOutputEvent.content.parts[0].text;

      const cleanedJsonString = textFromAgent
        .replace(/```json\n?/, "")
        .replace(/```$/, "")
        .trim();

      try {
        const agentResponse = JSON.parse(cleanedJsonString);

        const supabase = await createClient();

        const { data: latestSubmission, error: latestSubmissionError } = await supabase
          .from("user_submissions")
          .select("attempt_no")
          .eq("user_id", userId)
          .eq("question_id", question_id)
          .order("attempt_no", { ascending: false })
          .limit(1)
          .single();

        if (latestSubmissionError && latestSubmissionError.code !== "PGRST116") {
          throw latestSubmissionError;
        }
        const newAttemptNo = latestSubmission ? latestSubmission.attempt_no + 1 : 1;

        const { data: newSubmission, error: submissionError } = await supabase
          .from("user_submissions")
          .insert({
            user_id: userId,
            question_id: question_id,
            user_answer: answer,
            attempt_no: newAttemptNo,
          })
          .select("id")
          .single();

        if (submissionError) throw submissionError;

        const { data: newSubmissionResult, error: submissionResultError } = await supabase
          .from("submission_results")
          .insert({
            submission_id: newSubmission.id,
            evaluation: agentResponse,
            correction: {},
          });

        return NextResponse.json(agentResponse);
      } catch (e) {
        console.error("Failed to parse or save results:", e);
        return createErrorResponse("Failed to parse or save results", 500);
      }
    }

    return createErrorResponse("No final response with text from agent", 500);
  } catch (err) {
    console.error("evaluation error:", err);
    return handleKyError(err);
  }
}

function EvaluationRequest(parts: AgentUserMessagePart[], userId: string, sessionId: string): TopikWritingAgentRequest {
  return {
    app_name: AGENT_APP_EVALUATOR,
    user_id: userId,
    session_id: sessionId,
    stream: true,
    new_message: { parts, role: LlmMessageRole.USER },
  };
}
