import os
import json
import logging

logger = logging.getLogger(__name__)

def load_prompt_text(path: str) -> str:
    """Reads a text file and returns its content."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {path}")
        return ""

def load_prompt_json(path: str) -> dict:
    """Reads a json file and returns its content as a dictionary."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {path}")
        return {}
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in file: {path}")
        return {}

