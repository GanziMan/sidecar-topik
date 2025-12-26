import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@/supabase/server";

import { Role } from "@/types/common.types";

export const {
  handlers,
  signIn,
  signOut,
  auth,
  unstable_update: update, // Beta!
} = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials): Promise<User | null> => {
        if (!credentials) return null;
        const { email, password } = credentials;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const client = await createClient();
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) return null;
        const { user, session } = data;

        // 세션 생성 API 호출 제거 (Python 서버 리팩토링으로 인해 불필요)

        return {
          ...user,
          accessToken: session.access_token,
          roles: user.app_metadata.roles as Role[],
        };
      },
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
  // 로그인 페이지 설정
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn() {
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;

        token.roles = user.roles;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.roles = token.roles as Role[] | undefined;
      return session;
    },
  },
});
