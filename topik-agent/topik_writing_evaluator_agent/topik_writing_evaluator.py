from typing_extensions import override
from google.genai import types
from google.adk.agents import BaseAgent, InvocationContext, LlmAgent
import logging
import json

logger = logging.getLogger(__name__)


class TopikWritingEvaluator(BaseAgent):
    sentence_completion_agent: LlmAgent
    info_description_agent: LlmAgent
    opinion_essay_agent: LlmAgent

    model_config = {"arbitrary_types_allowed": True, }

    def __init__(
        self, name, description: str,
        sentence_completion_agent: LlmAgent,
        info_description_agent: LlmAgent,
        opinion_essay_agent: LlmAgent,
    ):

        sub_agents_list = [sentence_completion_agent,
                           info_description_agent, opinion_essay_agent]

        super().__init__(
            name=name,
            description=description,
            sentence_completion_agent=sentence_completion_agent,
            info_description_agent=info_description_agent,
            opinion_essay_agent=opinion_essay_agent,
            sub_agents=sub_agents_list
        )

    @override
    async def _run_async_impl(self, ctx: InvocationContext):

        payload_string = ""

        if ctx.user_content and ctx.user_content.parts:
            for part in ctx.user_content.parts:
                if getattr(part, "text", None):
                    payload_string = part.text or ""

        if payload_string:
            try:
                payload_json = json.loads(payload_string)
            except json.JSONDecodeError:
                raise ValueError("Failed to decode user input JSON.")

        exam_year = payload_json.get("exam_year")
        exam_round = payload_json.get("exam_round")
        question_number = payload_json.get("question_number")

        answer = payload_json.get("answer")
        answer_length = len(answer)

        answer_length_prompt = f" \n[글자수]\n{answer_length}" if answer_length is not None else ""
        standard_prompt = (
            f"아래 주어진 시험 정보(연도, 회차, 문제 번호)를 사용하여 문제의 원본 내용(question_text or image)을 먼저 조회하시오.\n"
            f"그 다음, 학생의 답안을 채점하시오.\n\n"
            f"--- 시험 정보 ---\n"
            f"exam_year: {exam_year}\n"
            f"exam_round: {exam_round}\n"
            f"question_number: {question_number}\n\n"
            f"--- 학생 답안 ---\n"
            f"[학생 답안]\n{answer}\n\n {answer_length_prompt}"
        )

        ctx.user_content = types.Content(
            parts=[types.Part(text=standard_prompt)]
        )

        routing_map = {
            51: self.sentence_completion_agent,
            52: self.sentence_completion_agent,
            53: self.info_description_agent,
            54: self.opinion_essay_agent,
        }

        sub_agent = routing_map.get(question_number)

        if sub_agent is None:
            raise ValueError(f"Invalid question number: {question_number}")

        final_event = None

        try:
            async for event in sub_agent.run_async(ctx):
                if event.is_final_response():
                    final_event = event
                else:
                    yield event
            if final_event:
                yield final_event
        except Exception as e:
            logger.exception("Sub-agent failed: %s", e)
