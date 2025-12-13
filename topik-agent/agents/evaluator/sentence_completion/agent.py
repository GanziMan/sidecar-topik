from google.adk.agents import LlmAgent
from config.model import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
from config.prompt_manager import prompt_manager
from agents.evaluator.sentence_completion.prompt import FEWSHOT_PROMPT, OUTPUT_FORMAT_PROMPT

from tools.question_finder import question_finder
import config.prompt_keys as keys
from prompt_utils import format_context_prompt
import logging
logger = logging.getLogger(__name__)


def _build_system_prompt(_):
    """Builds the system prompt string for the agent."""
    context_data = prompt_manager.get_prompt(
        keys.EVALUATOR_SUB_AGENTS_SENTENCE_COMPLETION_CONTEXT_PROMPT
    ).value

    formatted_context = format_context_prompt(context_data)

    return f"""
    {OUTPUT_FORMAT_PROMPT}
    {formatted_context}
    {FEWSHOT_PROMPT}
    """


sentence_completion_evaluator_agent = LlmAgent(
    name="sentence_completion_evaluator_agent",
    instruction=_build_system_prompt,
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 51, 52번 문장 완성 평가 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    planner=DEFAULT_PLANNER,
    tools=[question_finder],
)
