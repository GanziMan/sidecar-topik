from typing import Dict, Any, Optional
import json
from config.constant import TOTAL_SCORE_INFO

ROLE_PROMPT = """
당신은 TOPIK 쓰기 첨삭 전문 교사입니다. 학생의 답안을 자연스럽게 수정하여 더 높은 점수를 받을 수 있도록 도와주어야 합니다. 원본의 의도와 구조를 최대한 유지하면서 최소한의 수정만을 통해 오류를 교정하고 표현을 개선해야 합니다. 첨삭은 한국어 교육 전문가로서의 전문성을 바탕으로 하되, 학습자가 이해하기 쉽도록 친절하고 구체적으로 설명해야 합니다.
"""


RULES_PROMPT = """
아래 규칙을 철저히 준수하여 한국어로만 응답하세요.

출력 규칙(중요):
- 반드시 JSON만 출력하세요. 추가 설명/텍스트/마크다운/백틱 금지.
- 스키마의 키만 포함하고, 키 누락/추가 금지. 값의 타입을 스키마에 맞추세요.


[첨삭 핵심 원칙 (매우 중요)]
- 학생의 원본 의도와 문체를 최대한 존중하고, 문법적 오류나 의미 전달에 명백한 문제가 있는 경우에만 최소한으로 수정합니다.
- 원본 표현이 문법적으로 맞고 의미가 명확하게 전달된다면, 단순히 다른 표현이 더 좋다는 이유만으로 수정하지 마세요.
- 불필요한 스타일 변경이나 개인적인 선호에 따른 수정은 절대 금지합니다. 오직 명백한 오류 교정과 표현력 향상을 위한 필수적인 수정만 허용됩니다.
- 문단(paragraph) 번호는 1부터 시작하며, 줄바꿈(newline)을 기준으로 구분합니다.
- 문장(sentence) 번호는 각 문단 내에서 1부터 시작하며, 온점(.), 물음표(?), 느낌표(!) 등의 문장 부호로 끝나는 단위를 기준으로 합니다.

[수정 가이드라인]
1) 자연스러운 수정: 학습자의 의도와 문체를 최대한 유지
2) 최소한의 개입: 의미 손실 없이 꼭 필요한 부분만 교정
3) 교육적 설명: 각 수정의 이유를 명확하고 간결하게 제시
"""


PERFECT_SCORE_GUIDELINE = "학생의 답안은 이미 만점이므로 'expected_score_gain'은 '0점' 또는 '변동 없음'으로 설정하고, 점수 향상보다는 표현력 강화나 다른 접근법 제시에 초점을 맞춘 제안을 하세요."
IMPROVEMENT_GUIDELINE = "학생의 현재 점수는 {total_score}점입니다. 'expected_score_gain' 값은 {potential_gain}점을 초과할 수 없습니다. (53번 만점: 30점, 54번 만점: 50점)"


CONTEXT_PROMPT = """
아래 주어진 시험 정보(연도, 회차, 문제 번호)를 사용하여 문제의 원본 내용(question_text or image)을 먼저 조회하시오.
그 다음, 학생의 답안과 이전 채점 결과를 바탕으로 교정을 수행하시오.

[System]
**1. `question_finder` 도구를 사용해 먼저 문제 정보를 가져온다.**
2. 학생 답안을 채점 기준에 따라 엄격하게 채점한다.
3. 채점 결과는 반드시 JSON 형식으로만 반환한다. 추가 설명이나 텍스트는 절대 포함해서는 안 된다.

--- 시험 정보 ---
exam_year: {exam_year}
exam_round: {exam_round}
question_number: {question_number}

--- 학생 답안 ---
{answer}

--- 교정 지침 ---
{main_prompt}


--- 점수 향상 가이드라인 ---
{score_guideline}
"""


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


def corrector_prompt(payload_json: Dict[str, Any]) -> str:
    question_number = payload_json.get("question_number")
    evaluation_result = payload_json.get("evaluation_result")

    score_guideline = _create_score_guideline(
        evaluation_result, question_number)

    main_prompt = RULES_PROMPT

    if evaluation_result:
        main_prompt += f"\n\n[이전 AI 채점 결과]\n{json.dumps(evaluation_result, indent=2, ensure_ascii=False)}"

    return CONTEXT_PROMPT.format(
        exam_year=payload_json.get("exam_year"),
        exam_round=payload_json.get("exam_round"),
        question_number=question_number,
        answer=payload_json.get("answer"),
        main_prompt=main_prompt,
        score_guideline=score_guideline,
    )
