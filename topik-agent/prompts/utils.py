from typing import Dict, Any, Optional
import json
import logging
import re
import config.prompt_keys as keys
from config.prompt_manager import prompt_manager
from config.constant import TOTAL_SCORE_INFO

logger = logging.getLogger(__name__)

# --- Constants ---
AVG_SENTENCE_LENGTH = 45  # 한국어 1문장 평균 길이 (공백 포함)
BUFFER_LENGTH = 20        # 글자수 안전 버퍼 범위


def format_context_prompt(context_data: Dict[str, Any], prefix: str = "채점") -> str:
    """채점 기준(Rubric) JSON을 마크다운 표 형태로 변환"""
    prompt_parts = [f"[{prefix} 기준 (Rubric)]"]

    for section in context_data.get("sections", []):
        prompt_parts.append(f"\n### {section.get('title', '')}")

        col_header = "첨삭" if prefix == "첨삭" else "평가"
        prompt_parts.extend([
            f"| {col_header} 유형 | {col_header} 기준 |",
            "|:---:|:---|"
        ])

        for item in section.get("rubric", []):
            prompt_parts.append(
                f"| {item.get('score', '')} | {item.get('description', '')} |")

    if "guidelines" in context_data:
        prompt_parts.append("\n[가이드라인]")
        prompt_parts.extend(
            [f"- {g}" for g in context_data.get("guidelines", [])])

    return "\n".join(prompt_parts)


# --- Helper Functions (Private) ---

def _get_target_length_range(question_number: int) -> tuple[int, int]:
    """문항별 목표 글자 수 범위 반환"""
    if question_number == 53:
        return 200, 300
    elif question_number == 54:
        return 600, 700
    return 0, 0


def _analyze_char_count(answer: str, question_number: int) -> str:
    """글자 수 분석 및 수정 가이드 생성 (Data-Driven Dashboard Format)"""
    char_count = len(answer) if isinstance(answer, str) else 0
    min_len, max_len = _get_target_length_range(question_number)

    if min_len == 0:
        return f"현재 글자 수: {char_count}자"

    base_msg = f"분량 상태: {{status}} | 현재: {char_count}자 | 목표: {min_len}~{max_len}자 | 수정 가이드: {{guide}}"

    if char_count < min_len:
        diff = min_len - char_count
        sentences = round(diff / AVG_SENTENCE_LENGTH, 1)
        return base_msg.format(status="부족", guide=f"+{diff}자 확보 필요 (약 {sentences}문장 추가)")

    if char_count > max_len:
        diff = char_count - max_len
        sentences = round(diff / AVG_SENTENCE_LENGTH, 1)
        return base_msg.format(status="초과", guide=f"-{diff}자 압축 필요 (약 {sentences}문장 삭제)")

    return base_msg.format(status="정상", guide="현재 분량 유지")


def _preprocess_answer(answer: str) -> str:
    """답안 전처리: 문장별 강제 줄바꿈 및 코드 블록 처리"""
    if not isinstance(answer, str):
        return str(answer)

    paragraphs = answer.split('\n')
    formatted_paragraphs = []

    for p in paragraphs:
        if not p.strip():
            continue
        # 마침표, 물음표, 느낌표 뒤에 줄바꿈 추가 (문장 경계 명확화)
        sentences = re.split(r'(?<=[.!?])\s+', p.strip())
        formatted_paragraphs.append("\n".join(sentences))

    return "\n\n".join(formatted_paragraphs)


def _create_score_guideline(evaluation_result: Optional[Dict], question_number: int) -> str:
    """점수 향상 가이드라인 생성"""
    if not evaluation_result:
        return ""

    total_score = evaluation_result.get("total_score")
    q_num_str = str(question_number)

    if q_num_str not in TOTAL_SCORE_INFO or total_score is None:
        return ""

    perfect_score = TOTAL_SCORE_INFO[q_num_str]["total"]

    if total_score >= perfect_score:
        return "학생의 답안은 이미 만점이므로 'expected_score_gain'은 '0점' 또는 '변동 없음'으로 설정하고, 점수 향상보다는 표현력 강화나 다른 접근법 제시에 초점을 맞춘 제안을 하세요."

    potential_gain = perfect_score - total_score
    return f"학생의 현재 점수는 {total_score}점입니다. 'expected_score_gain' 값은 {potential_gain}점을 초과할 수 없습니다. (53번 만점: 30점, 54번 만점: 50점)"


def _format_reference_info(evaluation_result: Optional[Dict]) -> str:
    """이전 채점 결과 포맷팅 (JSON 코드 블록 적용)"""
    if not evaluation_result:
        return ""
    # JSON 포맷으로 깔끔하게 반환하여 에이전트 혼란 방지
    return f"```json\n{json.dumps(evaluation_result, indent=2, ensure_ascii=False)}\n```"


# --- Builder Functions (Public) ---

def build_evaluator_prompt(template: str, payload_json: Dict[str, Any], question_content: str = "") -> str:
    """채점(Evaluator) 프롬프트 빌드"""
    q_num = payload_json.get("question_number")
    answer = payload_json.get("answer", "")
    answer_length = len(answer) if isinstance(answer, str) else 0

    # 53, 54번인 경우에만 글자수 정보 추가
    char_info = f" \n[글자수]\n{answer_length}" if q_num in [
        53, 54] and answer else ""

    # 재채점 시 이전 기록 추가 로직 (Evaluator용)
    prev_eval = payload_json.get("evaluation_result")
    reference_info = ""
    if prev_eval:
        weaknesses = "\n".join(
            [f"- {w}" for w in prev_eval.get("weaknesses", [])])
        reference_info = f"\n[이전 평가 기록]\n총점: {prev_eval.get('total_score')}점\n약점:\n{weaknesses}\n\n[주의] 개선 여부를 확인하여 점수를 상향 조정하십시오."

    return template.format(
        exam_year=payload_json.get("exam_year"),
        exam_round=payload_json.get("exam_round"),
        question_number=q_num,
        question=question_content,
        answer=json.dumps(answer, ensure_ascii=False),
        answer_length_prompt=char_info,
        reference_info=reference_info,
    )


def build_corrector_prompt(template: str, payload_json: Dict[str, Any], question_content: str = "") -> str:
    """첨삭(Corrector) 프롬프트 빌드"""
    q_num = payload_json.get("question_number")
    answer = payload_json.get("answer", "")
    eval_result = payload_json.get("evaluation_result")

    # 1. Rubric 로드
    rubric_key = keys.CORRECTOR_ID_CONTEXT_RUBRIC_PROMPT if q_num == 53 else keys.EVALUATOR_OE_CONTEXT_RUBRIC_PROMPT
    rubric_data = prompt_manager.get_prompt(rubric_key).value
    formatted_rubric = format_context_prompt(rubric_data)

    # 2. 데이터 가공 (Helper Functions 활용)
    char_guide = _analyze_char_count(answer, q_num)
    formatted_answer = _preprocess_answer(answer)
    score_guideline = _create_score_guideline(eval_result, q_num)
    reference_info = _format_reference_info(eval_result)

    return template.format(
        exam_year=payload_json.get("exam_year"),
        exam_round=payload_json.get("exam_round"),
        question_number=q_num,
        question=question_content,
        rubric=formatted_rubric,
        char_count=char_guide,
        answer=formatted_answer,
        reference_info=reference_info,
        score_guideline=score_guideline,
    )
