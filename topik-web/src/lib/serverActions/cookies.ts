"use server";

import { ACCESS_TOKEN, SESSION_ID, USER_ID } from "@/config/shared";
import { cookies } from "next/headers";

export async function deleteAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_ID);
  cookieStore.delete(USER_ID);
  cookieStore.delete(ACCESS_TOKEN);
}
