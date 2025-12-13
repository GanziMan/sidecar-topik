OUTPUT_FORMAT_PROMPT = """
아래 스키마를 따르세요:

{
  "scores": {
    "answer1": Number,
    "answer2": Number
  },
  "total_score": Number,
  "strengths": [String],
  "weaknesses": [String],
  "improvement_suggestions": [String],
  "overall_feedback": String,
  "model_answer": { // 모범 답안
    "answer1": String,
    "answer2": String
  },
}
"""


CONTEXT_PROMPT = {
    "sections": [
        {
            "title": "㉠ (5점)",
            "criteria": [
                {"score": "상(5점)",
                 "description": "담화 문맥에 적합한 어휘와 문법을 사용하여 자연스럽게 완성"},
                {"score": "중(3~4점)",
                 "description": "기본적인 의미 전달은 되나 어휘나 문법이 다소 부적절"},
                {"score": "하(0~2점)", "description": "문맥에 맞지 않거나 문법 오류가 심각"},
            ],
        },
        {
            "title": "㉡ (5점)",
            "criteria": [
                {"score": "상(5점)",
                 "description": "담화 문맥에 적합한 어휘와 문법을 사용하여 자연스럽게 완성"},
                {"score": "중(3~4점)",
                 "description": "기본적인 의미 전달은 되나 어휘나 문법이 다소 부적절"},
                {"score": "하(0~2점)", "description": "문맥에 맞지 않거나 문법 오류가 심각"},
            ],
        },
    ],
    "guidelines": [
        "담화의 문맥에 적합하지 않은 어휘나 문법을 사용하면 감점이 됩니다. ㉠과 ㉡의 앞이나 뒤에 있는 문장들을 잘 살펴보고 내용이 자연스럽게 이어지도록 해야 합니다.",
        "불필요한 내용이 추가되어 원래의 의미를 해치는 경우 감점이 됩니다.",
        "철자법이 정확하지 않거나 글의 형식성, 격식성에 맞지 않으면 감점이 됩니다.",
        "문맥 파악: 담화의 앞뒤 내용을 정확히 파악하여 자연스럽게 연결",
        "답안을 한 문장 이상으로 쓰지 않도록 주의하십시오.",
        "답안에 ㉠과 ㉡ 앞뒤의 어구를 포함해서 쓰지 않도록 주의하십시오.",
    ],
}


# Few-shot examples for 51/52
FEWSHOT_PROMPT = """
[Few-shot]

# 예시 1: 완벽한 답안 (정답)

[문제]
"태권도 동아리 ‘태극’입니다. 이번에 ㉠(answer1) . 신입 회원 은 태권도에 관심 있는 학생이면 누구나 환영합니다. ㉡(answer2) 그래도 걱정하지 마십시오. 처음부터 천천히 가르쳐 드립니다."

[학생 답안]
"㉠(answer1) 신입 회원을 모집하려고 합니다. ㉡(answer2) 태권도를 잘 모르십니까?"

[출력]
{
  "scores": {"answer1": 5, "answer2": 5},
  "total_score": 10,
  "strengths": [
    "공지문 맥락에 맞는 어휘 선택(모집)과 존댓말 종결 사용.",
    "의문문 정중형과 문장부호 사용이 정확함."
  ],
  "weaknesses": [],
  "improvement_suggestions": [
    "동일한 품질로 대체 표현(예: '뽑으려고 합니다')도 연습해 표현 폭을 확장하세요."
  ],
  "overall_feedback": "형식·문맥·정중도 모두 적합한 모범 답안입니다.",
  "model_answer": {
    "answer1": "신입 회원을 모집하려고 합니다.",
    "answer2": "태권도를 잘 모르십니까?"
  }
}

# 예시 2: 완벽한 답안 (정답)

[문제]
"어려운 일이 생겼을 때 그 일을 대하는 우리의 태도는 크게 두 가지이다. ㉠(answer1) 다른 하나는 어려워서 불가능하다고 포기하는 것이다. 그런데 긍정적인 결과를 기대할수록 좋은 결과를 얻을 확률이 높다. 반대로 ㉡(answer2) 그러므로 우리는 시련이나 고난이 닥쳤을 때일수록 더욱 긍정적으로 생각할 필요가 있다."

[학생 답안]
"㉠(answer1) 하나는 아무리 어려워도 포기하지 않는 것이다. ㉡(answer2) 부정적으로 생각하면 좋은 결과를 얻기 어렵다."

[출력]
{
  "scores": {"answer1": 5, "answer2": 5},
  "total_score": 10,
  "strengths": [
    "대조 구조를 정확히 완성했고, 종결어미 통일을 지켰다.",
    "논리 전개가 자연스럽고 설명문 어조가 유지된다."
  ],
  "weaknesses": [],
  "improvement_suggestions": [
    "동일 의미의 대체 표현도 연습해보라: '가능하다는 믿음을 갖는다', '확률이 낮아진다' 등."
  ],
  "overall_feedback": "내용·구조·문체가 모두 적합한 완성도 높은 답안이다.",
  "model_answer": {
    "answer1": "하나는 아무리 어려워도 포기하지 않는 것이다.",
    "answer2": "부정적으로 생각하면 좋은 결과를 얻기 어렵다."
  }
}
"""
