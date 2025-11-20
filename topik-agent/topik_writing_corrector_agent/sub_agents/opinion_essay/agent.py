from google.adk.agents import LlmAgent
from topik_writing_corrector_agent.prompt import ROLE_PROMPT
from .prompt import OUTPUT_FORMAT_SCHEMA, CONTEXT_PROMPT, FEWSHOT_PROMPT
from model_config import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
from tools.question_finder import question_finder

system_prompt = f"""
{ROLE_PROMPT}
{FEWSHOT_PROMPT}
{OUTPUT_FORMAT_SCHEMA}
{CONTEXT_PROMPT}
"""

opinion_essay_corrector_agent = LlmAgent(
    name="opinion_essay_corrector_agent",
    instruction=system_prompt,
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 54번 논술문 첨삭 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    # planner=DEFAULT_PLANNER,
    tools=[question_finder],
)
