from typing import Dict, Any, Optional
import json
from config.constant import TOTAL_SCORE_INFO
import logging

logger = logging.getLogger(__name__)


def format_context_prompt(context_data: Dict[str, Any]) -> str:
    """Formats a context prompt dictionary into a markdown string."""
    prompt_parts = ["[채점 기준]"]

    for section in context_data.get("sections", []):
        prompt_parts.append(f"\n### {section.get('title', '')}")

        prompt_parts.append("| 점수 | 평가 기준 |")
        prompt_parts.append("|:---:|:---|")

        for item in section.get("rubric", []):
            score = item.get('score', '')
            desc = item.get('description', '')
            prompt_parts.append(f"| {score} | {desc} |")

    if "guidelines" in context_data:
        prompt_parts.append("\n[가이드라인]")
        for guideline in context_data.get("guidelines", []):
            prompt_parts.append(f"- {guideline}")

    prompt = "\n".join(prompt_parts)
    return prompt


def build_evaluator_prompt(template: str, payload_json: Dict[str, Any], question_content: str = "") -> str:
    """ TOPIK 51, 52, 53, 54번 평가 프롬프트 생성 """
    answer = payload_json.get("answer", "")
    answer_length = len(answer) if isinstance(answer, str) else 0

    # 51,52는 글자수 필요없음
    if payload_json.get("question_number") in [51, 52]:
        answer_length_prompt = ""
    else:
        answer_length_prompt = f" \n[글자수]\n{answer_length}" if answer_length > 0 else ""

    # 답안을 JSON 문자열로 변환 (가독성 및 파싱 용이성 확보)
    formatted_answer = json.dumps(answer, ensure_ascii=False)

    return template.format(
        exam_year=payload_json.get("exam_year"),
        exam_round=payload_json.get("exam_round"),
        question_number=payload_json.get("question_number"),
        question=question_content,
        answer=formatted_answer,
        answer_length_prompt=answer_length_prompt,
    )


PERFECT_SCORE_GUIDELINE = "학생의 답안은 이미 만점이므로 'expected_score_gain'은 '0점' 또는 '변동 없음'으로 설정하고, 점수 향상보다는 표현력 강화나 다른 접근법 제시에 초점을 맞춘 제안을 하세요."
IMPROVEMENT_GUIDELINE = "학생의 현재 점수는 {total_score}점입니다. 'expected_score_gain' 값은 {potential_gain}점을 초과할 수 없습니다. (53번 만점: 30점, 54번 만점: 50점)"


def _create_score_guideline(evaluation_result: Optional[Dict], question_number: int) -> str:
    if not evaluation_result:
        return ""
    total_score = evaluation_result.get("total_score")

    q_num_str = str(question_number)
    if q_num_str not in TOTAL_SCORE_INFO:
        return ""

    perfect_score = TOTAL_SCORE_INFO[q_num_str]["total"]
    if total_score is not None:
        if total_score >= perfect_score:
            return PERFECT_SCORE_GUIDELINE
        else:
            potential_gain = perfect_score - total_score
            return IMPROVEMENT_GUIDELINE.format(
                total_score=total_score,
                potential_gain=potential_gain
            )

    return ""


def build_corrector_prompt(template: str, payload_json: Dict[str, Any], question_content: str = "") -> str:
    """ TOPIK 53, 54번 첨삭 프롬프트 생성 """
    question_number = payload_json.get("question_number")
    evaluation_result = payload_json.get("evaluation_result")
    answer = payload_json.get("answer")

    score_guideline = _create_score_guideline(
        evaluation_result, question_number)

    # 참고 정보(채점 결과) 구성
    reference_info = ""
    if evaluation_result:
        reference_info = f"[이전 AI 채점 결과]\n{json.dumps(evaluation_result, indent=2, ensure_ascii=False)}"

    # 답안을 JSON 문자열로 변환
    formatted_answer = json.dumps(answer, ensure_ascii=False)

    return template.format(
        exam_year=payload_json.get("exam_year"),
        exam_round=payload_json.get("exam_round"),
        question_number=question_number,
        question=question_content,
        answer=formatted_answer,
        reference_info=reference_info,
        score_guideline=score_guideline,
    )
