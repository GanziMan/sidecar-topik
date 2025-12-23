from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class BaseTopikRequest(BaseModel):
    question_number: int
    exam_year: Optional[int] = None
    exam_round: Optional[int] = None
    evaluation_result: Optional[Dict[str, Any]] = None


class EssayRequest(BaseTopikRequest):
    answer: str = Field(..., description="작문형(53, 54) 답변")


class SentenceRequest(BaseTopikRequest):
    answer: Dict[str, str] = Field(...,
                                   description="단답형(51, 52) 답변 (answer1, answer2)")
