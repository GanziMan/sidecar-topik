from typing import List
from pydantic import BaseModel, Field

# --- Evaluator Schemas ---


class SentenceCompletionScores(BaseModel):
    answer1: int = Field(description="㉠ 정답 점수")
    answer2: int = Field(description="㉡ 정답 점수")


class SentenceCompletionModelAnswer(BaseModel):
    answer1: str = Field(description="㉠ 모범 답안")
    answer2: str = Field(description="㉡ 모범 답안")


class EvaluatorSentenceCompletionOutput(BaseModel):
    reasoning: str = Field(
        description="채점하기 전, 답안의 문맥 적합성과 문법 정확성을 분석한 생각의 과정")
    scores: SentenceCompletionScores
    total_score: int
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    overall_feedback: str
    model_answer: SentenceCompletionModelAnswer


class WritingScores(BaseModel):
    task_performance: int = Field(description="내용 및 과제 수행 점수")
    structure: int = Field(description="글의 전개 구조 점수")
    language_use: int = Field(description="언어 사용 점수")


class EvaluatorWritingOutput(BaseModel):
    reasoning: str = Field(
        description="채점하기 전, 각 평가 기준(과제 수행, 구조, 언어)별로 답안을 분석한 생각의 과정")
    scores: WritingScores
    total_score: int
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    overall_feedback: str
    char_count: int
    char_count_evaluation: str
    model_answer: str


# --- Corrector Schemas ---

class SentencePosition(BaseModel):
    paragraph: int
    sentence: int


class SentenceCorrection(BaseModel):
    original: str = Field(description="교정 대상 원문 (단일 문장)")
    revised: str = Field(description="교정된 문장")
    position: SentencePosition
    reason: str = Field(description="수정 이유")


class ImprovementEffects(BaseModel):
    expected_score_gain: int
    key_improvements: List[str]


class CorrectorWritingOutput(BaseModel):
    reasoning: str = Field(
        description="교정하기 전, 글 전체의 흐름과 문장별 오류를 분석하고 수정 방향을 설정하는 생각의 과정")
    original_answer: str
    corrected_answer: str
    sentence_corrections: List[SentenceCorrection]
    improvement_effects: ImprovementEffects
    overall_feedback: str
