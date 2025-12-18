import { createClient } from "@/supabase/server";
import { User } from "@supabase/supabase-js";

export const UserRepository = {
  async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  },

  async getCurrentUserOrThrow(errorMessage = "로그인이 필요합니다."): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error(errorMessage);
    }
    return user;
  },
};
