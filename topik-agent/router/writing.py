import json
from fastapi import APIRouter, HTTPException
from schemas.request import EssayRequest, SentenceRequest

from services.agent_service import agent_service
import logging
from tools.question_finder import question_finder


from config.prompt_manager import prompt_manager
import config.prompt_keys as keys
from prompts.utils import build_evaluator_prompt, build_corrector_prompt

logger = logging.getLogger(__name__)

# tags: swagger group
router = APIRouter(prefix="/writing", tags=["writing"])


@router.post("/evaluator/sentence")
async def evaluate_sentence(request: SentenceRequest):
    payload = request.model_dump()
    if request.question_number not in [51, 52]:
        raise HTTPException(
            status_code=400, detail="Question number must be 51 or 52 for sentence completion.")

    agent_key = "sentence_completion_evaluator"

    q_data = question_finder(
        request.exam_year, request.exam_round, request.question_number)

    question_content = q_data["text"]

    image_urls = []

    template = prompt_manager.get_prompt(
        keys.EVALUATOR_CONTEXT_TEMPLATE_PROMPT).value
    prompt = build_evaluator_prompt(template, payload, question_content)

    response_text = await agent_service.run_agent(agent_key, prompt, image_urls)

    return response_text


@router.post("/evaluator/essay")
async def evaluate_essay(request: EssayRequest):
    payload = request.model_dump()

    if request.question_number == 53:
        agent_key = "info_description_evaluator"
    elif request.question_number == 54:
        agent_key = "opinion_essay_evaluator"
    else:
        raise HTTPException(
            status_code=400, detail="Question number must be 53 or 54 for essay evaluation.")

    q_data = question_finder(
        request.exam_year, request.exam_round, request.question_number)

    question_content = q_data["text"]
    if request.question_number == 54:
        image_urls = []
    else:
        image_urls = q_data["images"]

    # User Prompt 생성
    template = prompt_manager.get_prompt(
        keys.EVALUATOR_CONTEXT_TEMPLATE_PROMPT).value
    prompt = build_evaluator_prompt(template, payload, question_content)

    response_text = await agent_service.run_agent(agent_key, prompt, image_urls)

    try:
        response_json = json.loads(response_text)
        # [정확성 보정] 글자 수 계산은 백엔드에서 다시 수행하여 LLM의 실수를 방지합니다.
        student_answer = payload.get("answer", "")
        if student_answer:
            response_json["char_count"] = len(student_answer)
        return response_json
    except Exception as e:
        logger.error(f"Failed to parse evaluator response: {e}")
        return response_text


@router.post("/corrector")
async def correct(request: EssayRequest):
    payload = request.model_dump()

    if request.question_number == 53:
        agent_key = "info_description_corrector"
    elif request.question_number == 54:
        agent_key = "opinion_essay_corrector"
    else:
        raise HTTPException(
            status_code=400, detail="Question number must be 53 or 54 for correction.")

    q_data = question_finder(
        request.exam_year, request.exam_round, request.question_number)

    question_content = q_data["text"]

    if request.question_number == 54:
        image_urls = []
    else:
        image_urls = q_data["images"]

    template = prompt_manager.get_prompt(
        keys.CORRECTOR_CONTEXT_TEMPLATE_PROMPT).value

    prompt = build_corrector_prompt(template, payload, question_content)

    response_text = await agent_service.run_agent(agent_key, prompt, image_urls)

    try:
        response_json = json.loads(response_text)
        corrected_answer = response_json.get("corrected_answer", "")
        if corrected_answer:
            response_json["char_count"] = len(corrected_answer)
        return response_json
    except Exception as e:
        logger.error(f"Failed to parse corrector response: {e}")
        return response_text
