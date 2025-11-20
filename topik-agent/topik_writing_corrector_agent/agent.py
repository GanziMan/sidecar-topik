from .topik_writing_corrector import TopikWritingCorrector
from .sub_agents.info_description import info_description_corrector_agent
from .sub_agents.opinion_essay import opinion_essay_corrector_agent


root_agent = TopikWritingCorrector(
    name="topik_writer_corrector_agent",
    description="TOPIK 주관식 문항에 대한 첨삭 에이전트",
    info_description_agent=info_description_corrector_agent,
    opinion_essay_agent=opinion_essay_corrector_agent,
)
