from typing import Dict, Any
import logging
import json
from config.prompt_registry import PROMPT_REGISTRY

logger = logging.getLogger(__name__)


class Prompt:
    def __init__(self, original_value: Any):
        self._value = original_value

    @property
    def value(self) -> Any:
        return self._value

    @value.setter
    def value(self, new_value: Any):
        self._value = new_value

    def __str__(self) -> str:
        if isinstance(self._value, str):
            return self._value
        return json.dumps(self._value, ensure_ascii=False)


class PromptManager:
    prompts: Dict[str, Prompt] = {}
    _loaded = False

    # 레지스트리에서 프롬프트 로드
    def load_prompts(self):
        if self._loaded:
            logger.warning("Prompts have already been loaded. Skipping.")
            return

        for key, value in PROMPT_REGISTRY.items():
            self.prompts[key] = Prompt(value)
            logger.info(f"Loaded prompt: {key}")

        self._loaded = True

    def get_prompt(self, prompt_id: str) -> Prompt:
        prompt = self.prompts.get(prompt_id)
        if prompt is None:
            raise KeyError(f"Prompt with id '{prompt_id}' not found.")
        return prompt

    def get_all_prompts(self) -> Dict[str, Any]:
        return {
            prompt_id: prompt.value for prompt_id, prompt in self.prompts.items()
        }

    def update_prompt(self, prompt_id: str, new_value: Any):
        if prompt_id in self.prompts:
            self.prompts[prompt_id].value = new_value
        else:
            raise KeyError(f"Prompt '{prompt_id}' not found.")


prompt_manager = PromptManager()
