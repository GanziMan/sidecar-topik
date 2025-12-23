from google.adk.agents import LlmAgent
from config.model import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
import config.prompt_keys as keys
from prompts.utils import format_context_prompt
import logging
from schemas.response import CorrectorWritingOutput

logger = logging.getLogger(__name__)


def _build_system_prompt(_):
    """TOPIK 53번 설명문 교정 에이전트 시스템 프롬프트 생성"""
    from config.prompt_manager import prompt_manager

    role = prompt_manager.get_prompt(keys.CORRECTOR_ROLE_PROMPT).value
    rules_common = prompt_manager.get_prompt(keys.CORRECTOR_RULES_PROMPT).value
    rules_specific = prompt_manager.get_prompt(
        keys.CORRECTOR_ID_RULES_PROMPT).value

    fewshot = prompt_manager.get_prompt(keys.CORRECTOR_ID_FEWSHOT_PROMPT).value
    rubric_json = prompt_manager.get_prompt(
        keys.CORRECTOR_ID_CONTEXT_RUBRIC_PROMPT).value

    formatted_rubric = format_context_prompt(rubric_json, prefix="첨삭")

    parts = [role, rules_common, rules_specific, formatted_rubric, fewshot]
    built_prompt = "\n\n".join(part.strip() for part in parts if part)
    return built_prompt


info_description_corrector_agent = LlmAgent(
    name="info_description_corrector_agent",
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 53번 설명문 교정 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    planner=DEFAULT_PLANNER,
    output_schema=CorrectorWritingOutput,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
)

info_description_corrector_agent.instruction = _build_system_prompt
