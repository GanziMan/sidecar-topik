import ky, { HTTPError, isHTTPError, isKyError, isTimeoutError } from "ky";
import { NextResponse } from "next/server";
import { ErrorResponse } from "@/types/topik.types";
import { createErrorResponse } from "./utils";

export const kyInstance = ky.create({
  prefixUrl: process.env.AGENT_BASE_URL,
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (!response.ok) {
          const errorBody = await response.json();
          const error = new HTTPError(response, request, options);

          error.message = `HTTP Error: ${response.status} ${response.statusText}. Body: ${JSON.stringify(errorBody)}`;

          throw error;
        }
        return response;
      },
    ],
  },
});

export const ApiClient = {
  get: <T>(url: string): Promise<T> => kyInstance.get<T>(url).json(),
  post: <TReq, TRes>(url: string, data?: TReq): Promise<TRes> =>
    kyInstance.post<TRes>(url, { json: data ?? {} }).json(),
  postStream: (url: string, data?: unknown): Promise<Response> => kyInstance.post(url, { json: data ?? {} }),
  put: <TReq, TRes>(url: string, data?: TReq): Promise<TRes> => kyInstance.put<TRes>(url, { json: data ?? {} }).json(),
  delete: <TRes>(url: string): Promise<TRes> => kyInstance.delete<TRes>(url).json(),
  patch: <TReq, TRes>(url: string, data?: TReq): Promise<TRes> =>
    kyInstance.patch<TRes>(url, { json: data ?? {} }).json(),
};

export function handleKyError(err: unknown): NextResponse<ErrorResponse> {
  const errorBase = { error: "Agent proxy failed" };
  if (isHTTPError(err)) {
    return createErrorResponse(errorBase.error, err.response.status, "HTTP_ERROR");
  }
  if (isTimeoutError(err)) {
    return createErrorResponse(errorBase.error, 504, "TIMEOUT");
  }
  if (isKyError(err)) {
    return createErrorResponse(errorBase.error, 500, "KY_ERROR");
  }

  return createErrorResponse(errorBase.error, 500, "UNKNOWN_ERROR");
}
