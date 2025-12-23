import uuid
import logging
import time
from typing import Dict
from google.adk.apps.app import App
from google.adk.runners import Runner
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.genai import types

from config.agent_registry import AGENT_REGISTRY

logger = logging.getLogger(__name__)


class AgentService:
    def __init__(self):
        # 1. 공용 세션 서비스 초기화
        self.session_service = InMemorySessionService()

        # 2. Runner 캐시 (key -> Runner instance)
        self.runners: Dict[str, Runner] = {}

        # 3. 초기화 시 모든 에이전트에 대한 Runner 생성 (Eager Loading)
        self._initialize_runners()

    def _initialize_runners(self):
        """에이전트의 Runner를 생성합니다."""
        for agent_key, agent in AGENT_REGISTRY.items():
            try:
                app_name = f"app_{agent_key}"
                agent_app = App(name=app_name, root_agent=agent)

                # 공용 session_service를 사용하여 Runner 생성
                runner = Runner(
                    app=agent_app,
                    session_service=self.session_service
                )
                self.runners[agent_key] = runner
                logger.info(f"Initialized Runner for agent: {agent_key}")
            except Exception as e:
                logger.error(
                    f"Failed to initialize runner for {agent_key}: {e}")

    def get_runner(self, agent_key: str) -> Runner:
        """캐싱된 Runner 반환"""
        if agent_key not in self.runners:
            raise ValueError(f"Unknown agent key: {agent_key}")
        return self.runners[agent_key]

    async def run_agent(self, agent_key: str, prompt: str, image_urls: list[str] = None) -> str:
        """
        지정된 agent_key에 해당하는 Runner를 사용하여 실행
        """
        runner = self.get_runner(agent_key)

        # 세션/유저 ID 생성 (요청마다 격리)
        session_id = str(uuid.uuid4())
        user_id = f"user_{session_id}"

        # 세션 생성
        await self.session_service.create_session(
            app_name=runner.app.name,
            user_id=user_id,
            session_id=session_id,
        )

        parts = [types.Part(text=prompt)]

        if image_urls:
            import httpx
            for url in image_urls:
                try:
                    mime_type = "image/jpeg"
                    if url.lower().endswith(".png"):
                        mime_type = "image/png"
                    elif url.lower().endswith(".webp"):
                        mime_type = "image/webp"

                    # 우리 서버가 먼저 이미지를 다운로드 받아서 바이트 데이터로 전송합니다(from_bytes).
                    with httpx.Client(timeout=10.0) as client:
                        response = client.get(url)
                        response.raise_for_status()
                        image_data = response.content

                        parts.append(types.Part.from_bytes(
                            data=image_data, mime_type=mime_type))

                except Exception as e:
                    logger.error(
                        f"Failed to download/attach image from {url}: {e}")
                    # 이미지 실패 시에도 멈추지 않고 텍스트로만 진행
                    continue

        content = types.Content(
            role="user",
            parts=parts,
        )

        response_text = ""

        first_token_received = False

        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        ):
            if not first_token_received:
                first_token_received = True

            if event.content and event.content.parts:
                for part in event.content.parts:
                    text_content = getattr(part, "text", None)
                    if text_content:
                        response_text += text_content

                    if getattr(part, "function_call", None):
                        logger.warning(
                            f"Model triggered function call: {part.function_call.name}")

            if event.is_final_response():
                break

        return response_text


agent_service = AgentService()
