from google.adk.agents import LlmAgent
from config.model import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
from config.prompt_manager import prompt_manager
from tools.question_finder import question_finder
import config.prompt_keys as keys
from agents.evaluator.info_description.prompt import FEWSHOT_PROMPT, OUTPUT_FORMAT_PROMPT
from prompt_utils import format_context_prompt


def _build_system_prompt(_):
    """Builds the system prompt string for the agent."""
    context_prompt = prompt_manager.get_prompt(
        keys.EVALUATOR_SUB_AGENTS_INFO_DESCRIPTION_CONTEXT_PROMPT
    ).value
    formatted_context_prompt = format_context_prompt(context_prompt)

    return f"""
    {OUTPUT_FORMAT_PROMPT}
    {formatted_context_prompt}
    {FEWSHOT_PROMPT}
    """


info_description_evaluator_agent = LlmAgent(
    name="info_description_evaluator_agent",
    instruction=_build_system_prompt,
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 53번 설명문 평가 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    planner=DEFAULT_PLANNER,
    tools=[question_finder],
)
