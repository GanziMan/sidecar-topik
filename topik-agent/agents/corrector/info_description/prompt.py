OUTPUT_FORMAT_PROMPT = """
아래 스키마를 따르세요:
{
  "original_answer": String,
  "sentence_corrections": [
    { 
      "original": String, // 중요: 교정의 대상이 되는 '단일 문장'이어야 합니다. 두 문장 이상을 포함할 수 없습니다.
      "revised": String, // 교정된 문장 - 두 문장 이상을 포함할 수 없습니다.
      "position": { "paragraph": Integer, "sentence": Integer }, // 문단과 문장 번호
      "reason": String  // // 문장 하나를 original 값으로 지정하고 reason에 설명을 추가하세요.
    }  
  ],
  "improvement_effects": {
    "expected_score_gain": Number,
    "key_improvements": [String]
  },
  "overall_feedback": String
}
"""

CONTEXT_PROMPT = {
    "sections": [
        {
            "title": "어휘/맞춤법 교정",
            "criteria": [
                {
                    "score": "맞춤법 오류",
                    "description": "철자, 띄어쓰기, 문장 부호 교정"
                },
                {
                    "score": "부적절한 어휘",
                    "description": "문맥에 맞지 않는 어휘를 적절한 어휘로 교체"
                },
                {
                    "score": "격식성 위반",
                    "description": "구어체 표현을 문어체로 수정"
                },
                {
                    "score": "어휘 선택",
                    "description": "더 정확하고 적절한 어휘로 교체 (수준 향상)"
                }
            ]
        },
        {
            "title": "문장 교정",
            "criteria": [
                {
                    "score": "문법 오류",
                    "description": "조사, 어미, 활용 등의 문법적 오류 수정"
                },
                {
                    "score": "문장 구조",
                    "description": "어색한 문장 구조를 자연스럽게 개선"
                },
                {
                    "score": "문체 통일",
                    "description": "격식체 일관성 확보 ('-습니다' 체 통일)"
                },
                {
                    "score": "문장 연결",
                    "description": "접속 표현 개선으로 논리적 흐름 강화"
                }
            ]
        }
    ],
    "guidelines": [
        "제시된 자료 활용의 적절성",
        "도입-전개-마무리 구조의 명확성",
        "200~300자 글자수 준수",
        "설명문에 적합한 문체와 표현",
    ]
}

FEWSHOT_PROMPT = """
"""
