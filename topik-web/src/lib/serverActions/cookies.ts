"use server";

import { ACCESS_TOKEN } from "@/config/shared";
import { cookies } from "next/headers";

export async function deleteAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN);
}
