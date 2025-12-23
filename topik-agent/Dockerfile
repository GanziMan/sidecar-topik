FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# requirements.txt 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 설정
ENV PORT=3001

# 엔트리포인트 스크립트 생성
# 1. GOOGLE_CREDENTIALS_JSON 환경변수가 있으면 credentials.json 파일로 저장 (Vertex AI 인증용)
# 2. uvicorn 실행
RUN echo '#!/bin/bash\n\
if [ -n "$GOOGLE_CREDENTIALS_JSON" ]; then\n\
  echo "$GOOGLE_CREDENTIALS_JSON" > /app/credentials.json\n\
  export GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json\n\
fi\n\
\n\
exec uvicorn main:app --host 0.0.0.0 --port ${PORT}' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# 애플리케이션 실행
CMD ["/app/entrypoint.sh"]
