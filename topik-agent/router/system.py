from fastapi import APIRouter
from pydantic import BaseModel
from config.model import set_thinking_budget

router = APIRouter(tags=["system"])


class BudgetUpdateRequest(BaseModel):
    thinking_budget: int


@router.get("/")
def read_root():
    return {"message": "ADK server is running for topik_writing_agents"}


@router.post("/update-thinking-budget")
async def update_budget(request: BudgetUpdateRequest):
    set_thinking_budget(request.thinking_budget)
    return {"message": f"Thinking budget updated to {request.thinking_budget}"}
