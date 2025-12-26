import logging

logger = logging.getLogger(__name__)


def log_system_prompt(agent_name: str, prompt: str):
    """시스템 프롬프트를 보기 좋게 포맷팅하여 로그 출력"""
    separator = "=" * 100
    formatted_log = (
        f"\n\nSystem Prompt [{agent_name}]:\n\n"
        f"{separator}\n\n"
        f"{prompt.strip()}\n\n"
        f"{separator}\n"
    )
    logger.info(formatted_log)


def log_user_prompt(agent_name: str, prompt: str):
    """유저 프롬프트 로깅"""
    separator = "-" * 50
    formatted_log = (
        f"\nUser Prompt [{agent_name}]:\n"
        f"{separator}\n"
        # 너무 길면 자르기
        f"{prompt.strip()}... (Total: {len(prompt)} chars)\n"
        f"{separator}\n"
    )
    logger.info(formatted_log)
