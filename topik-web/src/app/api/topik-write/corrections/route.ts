import { ApiClient, handleKyError } from "@/lib/ky";
import { NextResponse } from "next/server";
import { CorrectionResponse } from "@/types/topik-correct.types";
import { topikWritingCorrectorRequestSchema } from "@/app/schemas/topik-write.schema";
import { cookies } from "next/headers";
import {
  AgentUserMessagePart,
  ErrorResponse,
  LlmMessageRole,
  TopikWritingAgentRequest,
  TopikWritingEvent,
} from "@/types/topik.types";
import { createErrorResponse } from "@/lib/utils";
import { AGENT_APP_CORRECTOR } from "@/config/shared";

export async function POST(request: Request): Promise<NextResponse<CorrectionResponse | ErrorResponse>> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value ?? "";
  const userId = cookieStore.get("user_id")?.value ?? "";

  const clientRequest = await request.json();

  try {
    const { success, data: parsedData, error } = topikWritingCorrectorRequestSchema.safeParse(clientRequest);

    if (!success) {
      console.error("validation error:", error);
      return createErrorResponse(error.message, 400, "VALIDATION_ERROR");
    }

    const { year, round, questionNumber, answer, evaluationResult } = parsedData;

    const correctionInputPayload = {
      exam_year: year,
      exam_round: round,
      question_number: Number(questionNumber),
      answer,
      evaluation_result: evaluationResult,
    } as Record<string, unknown>;

    const agentUserMessageParts: AgentUserMessagePart[] = [{ text: JSON.stringify(correctionInputPayload) }];

    const agentEvents: TopikWritingEvent[] = await ApiClient.post(
      "run",
      TopikWritingAgentRunRequest(agentUserMessageParts, userId, sessionId)
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
        return NextResponse.json(agentResponse);
      } catch (e) {
        console.error("Failed to parse final JSON result from agent:", e, "text:", cleanedJsonString);
        return createErrorResponse("Invalid JSON result from agent", 500);
      }
    }

    return createErrorResponse("No final response with text from agent", 500);
  } catch (err) {
    console.error("correction error:", err);
    return handleKyError(err);
  }
}

function TopikWritingAgentRunRequest(
  parts: AgentUserMessagePart[],
  userId: string,
  sessionId: string
): TopikWritingAgentRequest {
  return {
    app_name: AGENT_APP_CORRECTOR,
    user_id: userId,
    session_id: sessionId,
    stream: true,
    new_message: { parts, role: LlmMessageRole.USER },
  };
}
