from google.adk.agents import LlmAgent
from topik_writing_evaluator_agent.prompt import ROLE_PROMPT, WRITING_EVALUATOR_TEMPLATE
from .prompt import OUTPUT_FORMAT_SCHEMA, SCORING_GUIDE, CONTEXT_PROMPT, FEWSHOT_PROMPT
from model_config import DEFAULT_PLANNER, GENERATE_CONTENT_CONFIG, LLM_MODEL
from tools.question_finder import question_finder

WRITING_EVALUATOR_PROMPT = WRITING_EVALUATOR_TEMPLATE.format(
    output_format_schema=OUTPUT_FORMAT_SCHEMA,
    scoring_guide=SCORING_GUIDE,
)

system_prompt = f"""
{ROLE_PROMPT}
{WRITING_EVALUATOR_PROMPT}
{CONTEXT_PROMPT}
{FEWSHOT_PROMPT}
"""

info_description_agent = LlmAgent(
    name="info_description_agent",
    instruction=system_prompt,
    model=LLM_MODEL.GEMINI_25FLASH,
    description="TOPIK 53번 설명문 평가 에이전트",
    generate_content_config=GENERATE_CONTENT_CONFIG,
    # planner=DEFAULT_PLANNER,
    tools=[question_finder],
)
