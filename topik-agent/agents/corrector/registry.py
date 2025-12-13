from agents.corrector.info_description import info_description_corrector_agent
from agents.corrector.opinion_essay import opinion_essay_corrector_agent

corrector_routing_map = {
    53: info_description_corrector_agent,
    54: opinion_essay_corrector_agent,
}
