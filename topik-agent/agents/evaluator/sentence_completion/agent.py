from google.adk.agents import LlmAgent
from config.model import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
import config.prompt_keys as keys
from prompts.utils import format_context_prompt
from schemas.response import EvaluatorSentenceCompletionOutput
from config.logger import log_system_prompt


def _build_system_prompt(_):
    """TOPIK 51, 52번 문장 완성 평가 에이전트 시스템 프롬프트 생성"""
    from config.prompt_manager import prompt_manager

    role = prompt_manager.get_prompt(keys.EVALUATOR_ROLE_PROMPT).value
    rules = prompt_manager.get_prompt(keys.EVALUATOR_RULES_PROMPT).value

    rubric_json = prompt_manager.get_prompt(
        keys.EVALUATOR_SC_CONTEXT_RUBRIC_PROMPT).value

    formatted_rubric = format_context_prompt(rubric_json)

    fewshot = prompt_manager.get_prompt(keys.EVALUATOR_SC_FEWSHOT_PROMPT).value

    parts = [role, rules, formatted_rubric, fewshot]

    built_prompt = "\n\n".join(part.strip() for part in parts if part)
    log_system_prompt("Sentence Completion Evaluator", built_prompt)
    return built_prompt


sentence_completion_evaluator_agent = LlmAgent(
    name="sentence_completion_evaluator_agent",
    instruction=_build_system_prompt,
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 51, 52번 문장 완성 평가 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    planner=DEFAULT_PLANNER,
    output_schema=EvaluatorSentenceCompletionOutput,
)
