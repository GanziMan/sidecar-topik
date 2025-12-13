import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/shared";

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
