from typing import Dict, Any
import importlib
import inspect
import os
import logging
import json
import config.prompt_keys as prompt_keys

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

    # 프롬프트 디렉토리에서 프롬프트 로드
    def discover_and_load_prompts(self, prompt_dirs: list[str]):
        if self._loaded:
            logger.warning("Prompts have already been loaded. Skipping.")
            return

        allowed_keys = self._get_allowed_keys()
        for base_dir in prompt_dirs:
            self._load_prompts_from_directory(base_dir, allowed_keys)

        self._loaded = True

    # 허용된 키 목록 반환
    def _get_allowed_keys(self) -> set:
        allowed_keys = set()
        for name, value in inspect.getmembers(prompt_keys):
            if name.isupper() and isinstance(value, str):
                allowed_keys.add(value)
        return allowed_keys

    def _load_prompts_from_directory(self, base_dir: str, allowed_keys: set):
        for root, _, files in os.walk(base_dir):
            if "prompt.py" in files:
                module_path = root.replace(os.path.sep, ".") + ".prompt"
                try:
                    module = importlib.import_module(module_path)
                    for name, value in inspect.getmembers(module):
                        if (
                            (isinstance(value, str) or isinstance(value, dict))
                            and name.isupper()
                            and not name.startswith("_")
                        ):
                            prompt_key_prefix = root.replace(
                                "topik_writing_", ""
                            ).replace(os.path.sep, ".")
                            prompt_id = f"{prompt_key_prefix}.{name}"
                            if prompt_id in allowed_keys:
                                self.prompts[prompt_id] = Prompt(value)
                except ImportError as e:
                    print(f"Error importing {module_path}: {e}")

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
