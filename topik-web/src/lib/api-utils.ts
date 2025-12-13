import { NextResponse } from "next/server";
import { ErrorResponse, ActionResponse } from "@/types/common.types";

export const createResponse = <T>(data: T, status: number): NextResponse<T> => {
  return NextResponse.json(data, { status });
};

export const createActionResponse = <T = void>(data?: T): ActionResponse<T> => {
  return { success: true, data };
};

export const createActionError = (message: string, code?: string): ActionResponse<never> => {
  return { success: false, error: { message, code } };
};

export const createErrorResponse = (message: string, code?: string, status = 500): NextResponse<ErrorResponse> => {
  return NextResponse.json({ message, code }, { status });
};
