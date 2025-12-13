import ky, { AfterResponseHook, HTTPError, Options } from "ky";
import { SERVICE_BASE_URL, API_BASE_URL } from "@/config/shared";
import { ActionResponse, ErrorResponse } from "@/types/common.types";
import { mapToErrorCode } from "@/config/error-codes.config";

type ApiClientType = "service" | "next";

const handleHttpError: AfterResponseHook = async (request, options, response) => {
  if (response.ok) return response;

  const errorBody = (await response.json().catch(() => null)) as ErrorResponse | { detail: string } | null;
  const error = new HTTPError(response, request, options);

  if (errorBody && "detail" in errorBody) {
    error.message = errorBody.detail;
  } else if (errorBody && "message" in errorBody) {
    error.message = errorBody.message as string;
  }

  throw error;
};

const createApiClient = (type: ApiClientType) => {
  const options: Options = {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 300000,
    prefixUrl: type === "service" ? SERVICE_BASE_URL : API_BASE_URL,
    hooks: {
      afterResponse: [handleHttpError],
    },
  };

  const kyInstance = ky.create(options);

  const safeRequest = async <T>(request: Promise<T>): Promise<ActionResponse<T>> => {
    try {
      const data = await request;
      return { success: true, data };
    } catch (error) {
      const httpError = error as HTTPError;
      const status = httpError.response?.status ?? 500;
      const message = httpError.message || "Request Failed";

      return {
        success: false,
        error: {
          message,
          code: mapToErrorCode(status),
        },
      };
    }
  };

  return {
    get: <T>(url: string) => safeRequest(kyInstance.get<T>(url).json<T>()),
    post: <TReq, TRes>(url: string, data?: TReq) =>
      safeRequest(kyInstance.post<TRes>(url, { json: data ?? {} }).json<TRes>()),
    postStream: (url: string, data?: unknown): Promise<Response> => kyInstance.post(url, { json: data ?? {} }),
    put: <TReq, TRes>(url: string, data?: TReq) =>
      safeRequest(kyInstance.put<TRes>(url, { json: data ?? {} }).json<TRes>()),
    delete: <TRes>(url: string) => safeRequest(kyInstance.delete<TRes>(url).json<TRes>()),
    patch: <TReq, TRes>(url: string, data?: TReq) =>
      safeRequest(kyInstance.patch<TRes>(url, { json: data ?? {} }).json<TRes>()),
  };
};

export const ServiceApiClient = createApiClient("service");
export const NextApiClient = createApiClient("next");
