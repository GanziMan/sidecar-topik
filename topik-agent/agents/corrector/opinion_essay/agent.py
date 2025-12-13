from google.adk.agents import LlmAgent
from config.model import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
from config.prompt_manager import prompt_manager
from agents.corrector.opinion_essay.prompt import FEWSHOT_PROMPT, OUTPUT_FORMAT_PROMPT
from tools.question_finder import question_finder
import config.prompt_keys as keys
from prompt_utils import format_context_prompt
import logging

logger = logging.getLogger(__name__)


def _build_system_prompt(_):
    """Builds the system prompt string for the agent."""

    context_prompt = prompt_manager.get_prompt(
        keys.CORRECTOR_SUB_AGENTS_OPINION_ESSAY_CONTEXT_PROMPT
    ).value
    formatted_context_prompt = format_context_prompt(context_prompt)

    return f"""
    {OUTPUT_FORMAT_PROMPT}
    {formatted_context_prompt}
    {FEWSHOT_PROMPT}
    """


opinion_essay_corrector_agent = LlmAgent(
    name="opinion_essay_corrector_agent",
    instruction=_build_system_prompt,
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 54번 논술문 교정 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    planner=DEFAULT_PLANNER,
    tools=[question_finder],
)
