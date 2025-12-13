from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict, Optional, Union

from agents.evaluator.prompt import evaluator_prompt
from agents.evaluator.registry import evaluator_routing_map
from agents.corrector.prompt import corrector_prompt
from agents.corrector.registry import corrector_routing_map

from services.agent_service import run_sub_agent
import logging

logger = logging.getLogger(__name__)

# tags: swagger group
router = APIRouter(prefix="/writing", tags=["writing"])


class TopikRequest(BaseModel):
    question_number: int
    answer: Union[str, Dict[str, str]]
    exam_year: Optional[int] = None
    exam_round: Optional[int] = None
    evaluation_result: Optional[Dict[str, Any]] = None


@router.post("/evaluator")
async def evaluate(request: TopikRequest):
    payload = request.model_dump()
    sub_agent = evaluator_routing_map[request.question_number]
    prompt = evaluator_prompt(payload)

    result = await run_sub_agent(sub_agent, prompt)
    return {"result": result}


@router.post("/corrector")
async def correct(request: TopikRequest):
    payload = request.model_dump()
    sub_agent = corrector_routing_map[request.question_number]
    prompt = corrector_prompt(payload)

    result = await run_sub_agent(sub_agent, prompt)
    return {"result": result}
