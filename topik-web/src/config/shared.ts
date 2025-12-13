export const AGENT_APP_EVALUATOR = process.env.AGENT_APP_EVALUATOR ?? "topik_writing_evaluator";
export const AGENT_APP_CORRECTOR = process.env.AGENT_APP_CORRECTOR ?? "topik_writing_corrector";

export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const SERVICE_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_BASE_URL;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
export const SESSION_ID = "session_id";
export const USER_ID = "user_id";

export const STOAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

export const AGENT_SESSION_URL = (userId: string, sessionId: string, appName: string) =>
  `apps/${appName}/users/${userId}/sessions/${sessionId}`;
