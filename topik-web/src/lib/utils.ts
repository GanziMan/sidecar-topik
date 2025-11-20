import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";
import { ErrorResponse } from "@/types/topik.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createErrorResponse = (message: string, status: number, code?: string): NextResponse<ErrorResponse> => {
  return NextResponse.json({ error: message, code }, { status });
};
