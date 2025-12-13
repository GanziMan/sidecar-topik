import uuid
from google.adk.apps.app import App
from google.adk.runners import Runner
from google.adk.memory.in_memory_memory_service import InMemoryMemoryService
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.genai import types


async def run_sub_agent(sub_agent, prompt: str) -> str:
    # 1. 세션/메모리 서비스 생성
    session_service = InMemorySessionService()
    memory_service = InMemoryMemoryService()

    # 2. App + Runner 생성
    agent_app = App(name=f"app_{sub_agent.name}", root_agent=sub_agent)

    runner = Runner(
        app=agent_app,
        session_service=session_service,
        memory_service=memory_service,
    )

    # 3. 세션/유저 ID 생성 & 세션 생성
    session_id = str(uuid.uuid4())
    user_id = f"user_{session_id}"

    await session_service.create_session(
        app_name=agent_app.name,
        user_id=user_id,
        session_id=session_id,
    )

    # 4. Content 생성 (일반 TEXT 요청)
    content = types.Content(
        role="user",
        parts=[types.Part(text=prompt)],
    )

    # 5. run_async로 이벤트 스트림 처리
    response_text = ""

    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=content,
    ):
        # 컨텐츠에서 텍스트 긁어오기
        if event.content and event.content.parts:
            for part in event.content.parts:
                if getattr(part, "text", None):
                    response_text += part.text

        # 최종 응답이면 종료
        if event.is_final_response():
            break

    return response_text
