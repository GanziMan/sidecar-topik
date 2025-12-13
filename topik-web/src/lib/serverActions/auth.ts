"use server";

import { auth, signIn, signOut, update } from "@/lib/auth";

import { AuthError } from "next-auth";
import { deleteAuthCookies } from "./cookies";
import { createActionError, createActionResponse } from "../api-utils";
import { ErrorCode } from "@/config/error-codes.config";
import { ActionResponse } from "@/types/common.types";

export const signInWithCredentials = async (formData: FormData): Promise<ActionResponse> => {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    return createActionResponse();
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        // TODO: error type 정의 필요
        case "CredentialsSignin":
          return createActionError("이메일 또는 비밀번호가 잘못되었습니다.", ErrorCode.VALIDATION_ERROR);
        default:
          return createActionError("로그인 중 알 수 없는 오류가 발생했습니다.", ErrorCode.UNEXPECTED_ERROR);
      }
    }

    return createActionError("로그인 중 알 수 없는 오류가 발생했습니다.", ErrorCode.UNEXPECTED_ERROR);
  }
};

export const signOutWithCredentials = async () => {
  await deleteAuthCookies();
  await signOut({ redirectTo: "/login" });
};

// 세션 조회 및 업데이트 함수
export { auth as getSession, update as updateSession };
