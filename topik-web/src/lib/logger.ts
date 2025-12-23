// winston은 Node.js 전용 모듈이므로 클라이언트 번들에 포함되면 안 됩니다.
// 따라서 import 대신 require를 사용하여 조건부로 로드합니다.

const isServer = typeof window === "undefined";

let logger: any = null;

if (isServer) {
  // 런타임에 동적으로 모듈 로드
  const winston = require("winston");
  const path = require("path");

  // 로그 파일 경로 설정 (프로젝트 루트/logs)
  // Vercel 환경에서는 /tmp 외에는 쓰기 권한이 없으므로 주의
  const logDir = path.join(process.cwd(), "logs");

  const transports = [];

  // 개발 환경에서만 파일 로깅 활성화 (또는 로컬 환경)
  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
      })
    );
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, "combined.log"),
      })
    );
  }

  // 모든 환경에서 콘솔 출력 (Vercel 로그 수집용)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );

  logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.printf((info: any) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: transports,
  });
}

/**
 * 서버 사이드에서만 동작하는 안전한 로그 함수
 */
export const logError = (message: string, meta?: unknown) => {
  if (isServer && logger) {
    logger.error(`${message} ${meta ? JSON.stringify(meta) : ""}`);
  } else {
    // 클라이언트 사이드일 경우 콘솔에 출력
    console.error(`[Client Log] ${message}`, meta);
  }
};

export const logInfo = (message: string, meta?: unknown) => {
  if (isServer && logger) {
    logger.info(`${message} ${meta ? JSON.stringify(meta) : ""}`);
  } else {
    console.log(`[Client Log] ${message}`, meta);
  }
};
