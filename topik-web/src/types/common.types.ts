import { NextResponse } from "next/server";

export enum LlmMessageRole {
  USER = "user",
  MODEL = "model",
}

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export enum QuestionType {
  Q51 = "51",
  Q52 = "52",
  Q53 = "53",
  Q54 = "54",
}

export interface QuestionParams {
  year: string | number;
  round: string | number;
  type: QuestionType;
}

// API Response Types
export interface ErrorResponse {
  message: string;
  code?: string;
}
export type ApiResponse<T> = NextResponse<T | ErrorResponse>;

export type ActionResponse<T = void> = { success: true; data: T } | { success: false; error: ErrorResponse };
