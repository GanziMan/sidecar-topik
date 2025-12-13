from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from config.prompt_manager import prompt_manager

router = APIRouter(prefix="/prompts", tags=["prompts"])


class PromptUpdateRequest(BaseModel):
    content: Dict[str, Any]


@router.get("")
async def get_prompts():
    return prompt_manager.get_all_prompts()


@router.get("/{prompt_id}")
async def get_prompt(prompt_id: str):
    try:
        response = prompt_manager.get_prompt(prompt_id)
        return response
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/{prompt_id}")
async def update_prompt(prompt_id: str, request: PromptUpdateRequest):
    try:
        prompt_manager.update_prompt(prompt_id, request.content)
        return {"message": f"Prompt '{prompt_id}' updated successfully."}
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error))
