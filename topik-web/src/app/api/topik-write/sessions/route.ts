import { AGENT_SESSION_URL } from "@/config/shared";
import { ApiClient, handleKyError } from "@/lib/ky";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { app_name, user_id, session_id } = await request.json();

  if (!app_name || !user_id || !session_id) {
    return createErrorResponse("Missing required fields", 400, "VALIDATION_ERROR");
  }

  try {
    await ApiClient.post(AGENT_SESSION_URL(user_id, session_id, app_name));
    return NextResponse.json({ message: `${app_name} session created successfully` });
  } catch (error) {
    console.error(`Failed to initialize ${app_name} session:`, error);
    return handleKyError(error);
  }
}
