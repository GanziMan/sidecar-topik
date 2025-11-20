from .prompt import WRITING_CORRECTOR_TEMPLATE
from config import TOTAL_SCORE_INFO
import json
import logging
from typing_extensions import override
from google.genai import types
from google.adk.agents import BaseAgent, InvocationContext, LlmAgent


logger = logging.getLogger(__name__)


class TopikWritingCorrector(BaseAgent):
    info_description_agent: LlmAgent
    opinion_essay_agent: LlmAgent

    model_config = {"arbitrary_types_allowed": True}

    def __init__(
        self,
        name: str,
        description: str,
        info_description_agent: LlmAgent,
        opinion_essay_agent: LlmAgent,
    ):
        sub_agents_list = [
            info_description_agent,
            opinion_essay_agent,
        ]

        super().__init__(
            name=name,
            description=description,
            info_description_agent=info_description_agent,
            opinion_essay_agent=opinion_essay_agent,
            sub_agents=sub_agents_list,
        )

    @override
    async def _run_async_impl(self, ctx: InvocationContext):
        payload_string = ""
        if ctx.user_content and ctx.user_content.parts:
            for part in ctx.user_content.parts:
                if getattr(part, "text", None):
                    payload_string = part.text or ""

        if not payload_string:
            raise ValueError("User input JSON payload is required.")

        try:
            payload_json = json.loads(payload_string)
        except json.JSONDecodeError:
            raise ValueError("Failed to decode user input JSON.")

        exam_year = payload_json.get("exam_year")
        exam_round = payload_json.get("exam_round")
        question_number = payload_json.get("question_number")
        answer = payload_json.get("answer")
        evaluation_result = payload_json.get("evaluation_result")

        score_guideline = ""
        if evaluation_result and str(question_number) in TOTAL_SCORE_INFO:
            total_score = evaluation_result.get("total_score")
            perfect_score = TOTAL_SCORE_INFO[str(question_number)]["total"]
            if total_score is not None:
                if total_score >= perfect_score:
                    score_guideline = "학생의 답안은 이미 만점이므로 'expected_score_gain'은 '0점' 또는 '변동 없음'으로 설정하고, 점수 향상보다는 표현력 강화나 다른 접근법 제시에 초점을 맞춘 제안을 하세요."
                else:
                    potential_gain = perfect_score - total_score
                    score_guideline = f"학생의 현재 점수는 {total_score}점입니다. 'expected_score_gain' 값은 {potential_gain}점을 초과할 수 없습니다. (53번 만점: 30점, 54번 만점: 50점)"

        main_prompt = WRITING_CORRECTOR_TEMPLATE.format(
            score_guideline=score_guideline)
        if evaluation_result:
            main_prompt += (
                f"\n\n[이전 AI 채점 결과]\n{json.dumps(evaluation_result, indent=2, ensure_ascii=False)}"
            )

        # Combine all information into a single final prompt
        final_prompt = (
            f"아래 주어진 시험 정보(연도, 회차, 문제 번호)를 사용하여 문제의 원본 내용(question_text or image)을 먼저 조회하시오.\n"
            f"그 다음, 학생의 답안과 이전 채점 결과를 바탕으로 교정을 수행하시오.\n\n"
            f"--- 시험 정보 ---\n"
            f"exam_year: {exam_year}\n"
            f"exam_round: {exam_round}\n"
            f"question_number: {question_number}\n\n"
            f"--- 학생 답안 ---\n"
            f"{answer}\n\n"
            f"--- 교정 지침 및 이전 채점 결과 ---\n"
            f"{main_prompt}"
        )

        ctx.user_content = types.Content(
            parts=[types.Part(text=final_prompt)]
        )

        routing_map = {
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
            logger.exception("Corrector sub-agent failed: %s", e)
