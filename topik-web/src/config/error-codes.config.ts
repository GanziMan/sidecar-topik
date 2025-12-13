export const ErrorStatusCode = {
  UNAUTHORIZED: 401,
  VALIDATION_ERROR: 400,
  SESSION_NOT_FOUND: 404,
  NOT_FOUND: 404,
  NO_AGENT_RESPONSE: 404,
  INTERNAL_SERVER_ERROR: 500,
  NO_TEXT_OUTPUT_EVENT: 500,
  DATABASE_ERROR: 500,
  UNEXPECTED_ERROR: 500,
} as const;

export const ErrorCode = {
  // Client Errors (4xx)
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  NOT_FOUND: "NOT_FOUND",
  NO_AGENT_RESPONSE: "NO_AGENT_RESPONSE",

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  NO_TEXT_OUTPUT_EVENT: "NO_TEXT_OUTPUT_EVENT",
  DATABASE_ERROR: "DATABASE_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const mapToErrorCode = (status: number): ErrorCode => {
  if (status === ErrorStatusCode.VALIDATION_ERROR) return ErrorCode.VALIDATION_ERROR;
  if (status === ErrorStatusCode.SESSION_NOT_FOUND) return ErrorCode.SESSION_NOT_FOUND;
  if (status === ErrorStatusCode.UNAUTHORIZED) return ErrorCode.UNAUTHORIZED;
  return ErrorCode.INTERNAL_SERVER_ERROR;
};
