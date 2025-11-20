OUTPUT_FORMAT_SCHEMA = """
{
  "original_answer": String,
  "sentence_corrections": [
    { 
      "original": String, // 중요: 교정의 대상이 되는 '단일 문장'이어야 합니다. 두 문장 이상을 포함할 수 없습니다.
      "revised": String, // 교정된 문장 - 두 문장 이상을 포함할 수 없습니다.
      "position": { "paragraph": Integer, "sentence": Integer }, // 문단과 문장 번호
      "reason": String 
    }  
  ],
  "improvement_effects": {
    "expected_score_gain": Number,
    "key_improvements": [String]
  },
  "overall_feedback": String
}
"""

CONTEXT_PROMPT = """
[첨삭 기준]
- 제시된 자료 활용의 적절성
- 도입-전개-마무리 구조의 명확성
- 200~300자 글자수 준수
- 설명문에 적합한 문체와 표현
- - 'original' 필드는 반드시 학생 답안의 '단일 문장'이어야 합니다. 문장 통합 시, 통합 대상이 되는 문장 하나를 original 값으로 지정하고 reason에 설명을 추가하세요.
"""
