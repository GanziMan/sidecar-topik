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
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    overall_feedback: str
    model_answer_1: str = Field(description="㉠ 모범 답안")
    model_answer_2: str = Field(description="㉡ 모범 답안")


class WritingScores(BaseModel):
    task_performance: int = Field(description="내용 및 과제 수행 점수")
    structure: int = Field(description="글의 전개 구조 점수")
    language_use: int = Field(description="언어 사용 점수")


class EvaluatorWritingOutput(BaseModel):
    reasoning: str = Field(description="...")
    scores: WritingScores = Field(description="평가 기준별 상세 점수")
    strengths: List[str] = Field(description="답안의 강점 (없으면 빈 리스트)")
    weaknesses: List[str] = Field(description="답안의 약점 및 감점 요인")
    improvement_suggestions: List[str] = Field(
        description="구체적인 개선 방안 및 학습 조언")
    overall_feedback: str = Field(description="종합적인 평가 및 총평")
    char_count: int = Field(description="글자수 (공백 포함)")
    char_count_evaluation: str = Field(description="글자수 기준 충족 여부 및 감점 내용")
    model_answer: str = Field(description="학생 답안의 오류를 수정한 최적의 모범 답안")


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
    expected_score_gain: int = Field(description="예상 점수 상승")
    key_improvements: List[str]


class CorrectorWritingOutput(BaseModel):
    reasoning: str = Field(
        description="교정하기 전, 글 전체의 흐름과 문장별 오류를 분석하고 수정 방향을 설정하는 생각의 과정")
    corrected_answer: str
    sentence_corrections: List[SentenceCorrection] = Field(
        description="문장별 수정 내용")
    improvement_effects: ImprovementEffects
    overall_feedback: str
    char_count: int = Field(0, description="교정된 답안의 실제 글자 수 (백엔드에서 계산됨)")
