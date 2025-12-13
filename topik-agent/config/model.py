from google.genai import types
from google.adk.planners import BuiltInPlanner
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def set_thinking_budget(new_budget: int) -> None:
    DEFAULT_PLANNER.thinking_config = types.ThinkingConfig(
        thinking_budget=new_budget)
    logger.info(
        f"Successfully set thinking_budget to {DEFAULT_PLANNER.thinking_config.thinking_budget}"
    )


DEFAULT_PLANNER = BuiltInPlanner(
    thinking_config=types.ThinkingConfig(thinking_budget=0)
)
GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    temperature=0,
    top_p=0.9,
)


class LLM_MODEL:
    GEMINI_25FLASH = "gemini-2.5-flash"
    GEMINI_20FLASH = "gemini-2.0-flash"
