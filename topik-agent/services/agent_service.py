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
        start_time = time.time()
        runner = self.get_runner(agent_key)

        # 세션/유저 ID 생성 (요청마다 격리)
        session_id = str(uuid.uuid4())
        user_id = f"user_{session_id}"

        try:
            # 세션 생성
            await self.session_service.create_session(
                app_name=runner.app.name,
                user_id=user_id,
                session_id=session_id,
            )

            parts = [types.Part(text=prompt)]

            if image_urls:
                import httpx
                async with httpx.AsyncClient(timeout=10.0) as client:
                    for url in image_urls:
                        mime_type = "image/jpeg"
                        if url.lower().endswith(".png"):
                            mime_type = "image/png"
                        elif url.lower().endswith(".webp"):
                            mime_type = "image/webp"

                        # [Fix] await 추가
                        response = await client.get(url)
                        response.raise_for_status()
                        image_data = response.content

                        parts.append(types.Part.from_bytes(
                            data=image_data, mime_type=mime_type))

            content = types.Content(
                role="user",
                parts=parts,
            )

            response_text = ""

            first_token_received = False
            chunk_count = 0
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=content,
            ):
                chunk_count += 1
                if not first_token_received:
                    first_token_received = True

                # [Debug] 토큰 사용량 상세 로깅
                if event.usage_metadata:
                    prompt_token = event.usage_metadata.prompt_token_count
                    candidates_token = event.usage_metadata.candidates_token_count
                    total_token = event.usage_metadata.total_token_count

                    # 매 청크마다 찍으면 너무 많을 수 있으니 첫 번째와 마지막(추정), 그리고 10번째마다 찍기
                    if chunk_count == 1 or chunk_count % 10 == 0:
                        logger.debug(
                            f"Chunk {chunk_count} - Agent [{agent_key}] Token Usage - Input: {prompt_token}, Output: {candidates_token}, Total: {total_token}")

                    # 마지막 최종 사용량을 위해 변수에 저장해둘 수도 있음 (여기서는 로그만)

                if event.content and event.content.parts:
                    for part in event.content.parts:
                        text_content = getattr(part, "text", None)
                        if text_content:
                            response_text += text_content

                        if getattr(part, "function_call", None):
                            logger.warning(
                                f"Model triggered function call: {part.function_call.name}")

                if event.is_final_response():
                    # 최종 응답 시점의 토큰 사용량 (가장 정확)
                    if event.usage_metadata:
                        logger.info(
                            f"FINAL - Agent [{agent_key}] Token Usage - Input: {event.usage_metadata.prompt_token_count}, Output: {event.usage_metadata.candidates_token_count}, Total: {event.usage_metadata.total_token_count}")
                    break

            return response_text
        # 세션 삭제
        finally:
            elapsed_time = time.time() - start_time
            logger.info(
                f"Agent [{agent_key}] execution time: {elapsed_time:.2f} seconds")

            if hasattr(self.session_service, "delete_session"):
                # [Fix] 키워드 인자로 전달 및 필수 파라미터 포함
                await self.session_service.delete_session(
                    app_name=runner.app.name,
                    user_id=user_id,
                    session_id=session_id
                )
            elif hasattr(self.session_service, "delete"):
                await self.session_service.delete(session_id)


agent_service = AgentService()
