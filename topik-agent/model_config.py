from google.genai import types
from google.adk.planners import BuiltInPlanner

GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    temperature=0,
    top_p=0.9,
)


DEFAULT_PLANNER = BuiltInPlanner(
    thinking_config=types.ThinkingConfig(
        thinking_budget=0
    )
)


class LLM_MODEL:
    GEMINI_25FLASH = "gemini-2.5-flash"
    GEMINI_20FLASH = "gemini-2.0-flash"
