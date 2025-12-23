# TOPIK AI 쓰기 채점 에이전트

## 주요 기능

- **AI 기반 자동 채점:** 사용자가 TOPIK 쓰기 답안을 제출하면, AI 에이전트가 채점 기준에 따라 종합 점수와 피드백을 제공합니다.
- **AI 기반 맞춤형 첨삭:** 53번(설명문), 54번(논술문) 문항에 대해 문법, 어휘, 문장 구조 등을 교정하고 구체적인 첨삭 가이드를 제공합니다.
- **문제 유형별 전문 에이전트:** TOPIK 51/52번(문장 완성), 53번(정보 설명), 54번(의견 논술) 각 유형에 최적화된 전문 LLM 에이전트가 채점을 수행합니다.
- **프롬프트 엔지니어링 시스템:** 관리자가 웹 인터페이스에서 직접 채점 기준(Rubric)과 Few-shot 예시를 수정하고 버전별로 히스토리를 관리할 수 있습니다.

## 기술 스택

### Frontend (`topik-web`)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **State Management:** Zustand, TanStack Query (React Query)
- **Styling:** Tailwind CSS, shadcn/ui
- **API Client:** ky
- **Architecture:** Server Actions, Repository Pattern

### Backend (`topik-agent`)

- **Framework:** FastAPI
- **Language:** Python
- **AI Framework:** Google Agent Development Kit (ADK)
- **LLM:** Google Gemini
- **Architecture:** Explicit Routing, Pydantic Schema Validation

## 아키텍처

- **Frontend (`topik-web`):** Next.js 기반 웹 애플리케이션으로, 사용자 입력을 받아 Server Actions 및 Repository Layer를 통해 백엔드와 통신합니다. Supabase를 사용하여 데이터(제출 이력, 프롬프트 등)를 관리합니다.
- **Backend (`topik-agent`):** FastAPI 서버로 구동되며, 문제 유형별(51/52, 53, 54) 및 작업 유형별(평가/첨삭)로 분리된 엔드포인트를 제공합니다. 각 엔드포인트는 Google ADK 기반의 전용 에이전트를 호출하여 작업을 수행합니다.

## 시작하기

### 1. Frontend (`topik-web`)

```bash
cd topik-web
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 2. Backend (`topik-agent`)

```bash
cd topik-agent
pip install -r requirements.txt
python main.py
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

## 프로젝트 구조

### **`topik-web`**

```
src/
├── app/             # Next.js App Router (Pages & API Routes)
├── components/      # UI 컴포넌트 (Question, Admin 등)
├── hooks/           # Custom Hooks (useSolver, usePromptEditor 등)
├── lib/             # 유틸리티 및 Server Actions
├── repositories/    # Data Access Layer (Supabase 연동 격리)
├── providers/       # Context Providers (Auth, Query)
└── config/          # 상수 및 설정 파일
```

### **`topik-agent`**

```
topik-agent/
├── agents/          # LLM Agent 정의 (Evaluator, Corrector)
│   ├── evaluator/   # 평가 에이전트 (Sentence, Essay)
│   └── corrector/   # 첨삭 에이전트
├── config/          # 설정 및 Prompt Registry
├── middleware/      # FastAPI Middleware (Error Handling)
├── prompts/         # 프롬프트 데이터 (Markdown/JSON) & 로더
├── router/          # API 엔드포인트 정의
├── schemas/         # Pydantic 데이터 모델 (Request/Response)
└── services/        # 비즈니스 로직 (Agent 실행 등)
```
