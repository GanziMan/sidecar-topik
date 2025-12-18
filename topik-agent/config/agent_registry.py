from agents.evaluator.sentence_completion.agent import sentence_completion_evaluator_agent
from agents.evaluator.info_description.agent import info_description_evaluator_agent
from agents.evaluator.opinion_essay.agent import opinion_essay_evaluator_agent
from agents.corrector.info_description.agent import info_description_corrector_agent
from agents.corrector.opinion_essay.agent import opinion_essay_corrector_agent

# 에이전트 키 매핑
AGENT_REGISTRY = {
    "sentence_completion_evaluator": sentence_completion_evaluator_agent,
    "info_description_evaluator": info_description_evaluator_agent,
    "opinion_essay_evaluator": opinion_essay_evaluator_agent,
    "info_description_corrector": info_description_corrector_agent,
    "opinion_essay_corrector": opinion_essay_corrector_agent,
}
