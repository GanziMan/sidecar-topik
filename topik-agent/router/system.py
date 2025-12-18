from fastapi import APIRouter
from pydantic import BaseModel
from config.model import set_thinking_budget, get_thinking_budget
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["system"])


class BudgetUpdateRequest(BaseModel):
    thinking_budget: int


@router.get("/")
def read_root():
    return {"message": "ADK server is running for topik_writing_agents"}


@router.get("/get-thinking-budget")
async def get_thinking_budget_route():
    response = get_thinking_budget()
    return response


@router.post("/update-thinking-budget")
async def update_thinking_budget_route(request: BudgetUpdateRequest):
    set_thinking_budget(request.thinking_budget)
    logger.info(f"Thinking budget updated to {request.thinking_budget}")
    return {"message": f"Thinking budget updated to {request.thinking_budget}"}
