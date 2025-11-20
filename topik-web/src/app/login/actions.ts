"use server";

import { AGENT_APP_CORRECTOR, AGENT_APP_EVALUATOR, API_BASE_URL } from "@/config/shared";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";

export async function login(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookie = await cookies();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const { session, user } = data;

  const userId = user?.id ?? "";
  const sessionId = session?.access_token ?? "";

  cookie.set("user_id", userId);
  cookie.set("session_id", sessionId);

  try {
    await Promise.all([
      fetch(`${API_BASE_URL}/api/topik-write/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_name: AGENT_APP_EVALUATOR,
          user_id: userId,
          session_id: sessionId,
        }),
      }),
      fetch(`${API_BASE_URL}/api/topik-write/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_name: AGENT_APP_CORRECTOR,
          user_id: userId,
          session_id: sessionId,
        }),
      }),
    ]);
  } catch (error) {
    console.error("Failed to initialize agent sessions from middleware:", error);
  }

  if (error) {
    console.error(error);
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/");
}
