# TODO: add character count
OUTPUT_FORMAT_SCHEMA = """
{
  "original_answer": String,
  "corrected_answer": String,
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
- 견해와 근거의 논리적 연결 강화
- 서론-본론-결론 구조의 완성도
- 600~700자 글자수 준수
- 논술문에 적합한 고급 표현
- 'original' 필드는 반드시 학생 답안의 '단일 문장'이어야 합니다. 문장 통합 시, 통합 대상이 되는 문장 하나를 original 값으로 지정하고 reason에 설명을 추가하세요.
"""

FEWSHOT_PROMPT = """
{
  "original_answer": "요즘 환경오염이 심각해요. 공기도 나빠지고 물도 더러워져요. 이런 문제들 때문에 사람들이 힘들어해요. 그래서 우리가 노력해야 해요. 쓰레기를 적게 버리고 대중교통을 이용하면 좋겠어요. 환경을 보호하는 것은 우리 모두의 책임이에요.",
  "sentence_corrections": [
      {
        "original": "심각해요",
        "revised": "심각한 문제로 대두되고 있다",
        "position": { "paragraph": 1, "sentence": 1 },
        "reason": "구어체를 문어체로 수정하고 더 정확한 표현으로 개선"
      },
      {
        "original": "공기도 나빠지고",
        "revised": "대기 오염으로 인한 공기질 악화와",
        "position": { "paragraph": 1, "sentence": 2 },
        "reason": "구체적이고 전문적인 어휘로 교체하여 설명력 향상"
      },
      {
        "original": "쓰레기를 적게 버리고",
        "revised": "폐기물 배출량을 줄이고",
        "position": { "paragraph": 1, "sentence": 5 },
        "reason": "더 격식 있고 정확한 표현으로 개선"
      }
  ],
  "improvement_effects": {
    "expected_score_gain": 17,
    "key_improvements": [
      "구어체에서 문어체로 완전한 문체 통일",
      "고급 어휘 사용으로 언어 품격 향상",
      "논리적 구조와 내용 전개의 명확성 증대",
      "논술문에 적합한 격식 있는 표현으로 개선"
    ]
  },
  "overall_feedback": "환경 문제에 대한 기본적인 이해는 있었으나 격식성과 표현력에서 크게 개선되었습니다. 특히 구어체에서 문어체로의 전환과 고급 어휘 사용으로 논술문의 품격이 현저히 향상되었습니다."
}

"""
