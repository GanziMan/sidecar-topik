from agents.evaluator.info_description import info_description_evaluator_agent
from agents.evaluator.opinion_essay import opinion_essay_evaluator_agent
from agents.evaluator.sentence_completion import sentence_completion_evaluator_agent

evaluator_routing_map = {
    51: sentence_completion_evaluator_agent,
    52: sentence_completion_evaluator_agent,
    53: info_description_evaluator_agent,
    54: opinion_essay_evaluator_agent,
}

