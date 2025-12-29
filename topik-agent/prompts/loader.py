import json
import logging

logger = logging.getLogger(__name__)


def load_prompt_text(path: str) -> str:
    """프롬프트 텍스트 파일 로드"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {path}")
        return ""


def load_prompt_json(path: str) -> dict:
    """프롬프트 JSON 파일 로드"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {path}")
        return {}
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in file: {path}")
        return {}
