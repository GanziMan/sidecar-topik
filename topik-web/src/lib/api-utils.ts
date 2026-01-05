import { NextResponse } from "next/server";
import { ErrorResponse, ActionResponse } from "@/types/common.types";

export const createResponse = <T>(data: T, status: number): NextResponse<T> => {
  return NextResponse.json(data, { status });
};

export const createActionResponse = <T = void>(data?: T): ActionResponse<T> => {
  return { success: true, data: data ?? (null as unknown as T) };
};

export const createActionError = (message: string, code?: string): ActionResponse<never> => {
  return { success: false, error: { message, code } };
};

export const createErrorResponse = (message: string, code?: string, status = 500): NextResponse<ErrorResponse> => {
  return NextResponse.json({ message, code }, { status });
};

/**
 * 에이전트로부터 오는 다양한 형태의 응답(객체, JSON 문자열, 마크다운 등)을
 * 객체로 파싱하는 로직
 */
export const parseAgentResponse = <T>(data: unknown): T | null => {
  if (!data) return null;

  if (typeof data === "object" && data !== null) {
    return data as T;
  }

  // 문자열인 경우 처리
  if (typeof data === "string") {
    const trimmed = data.trim();

    // 단순 JSON 파싱 시도
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // JSON 파싱 실패 시 마크다운 블록이나 텍스트 내 JSON 추출 시도 ({...} 형태 찾기)
      const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as T;
        } catch {
          // 최후의 수단: ```json 블록 제거 시도
          const cleaned = trimmed
            .replace(/```json\n?/, "")
            .replace(/```$/, "")
            .trim();
          try {
            return JSON.parse(cleaned) as T;
          } catch {
            return null;
          }
        }
      }
    }
  }

  return null;
};
