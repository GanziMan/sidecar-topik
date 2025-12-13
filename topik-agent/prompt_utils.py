from typing import Dict, Any


def format_context_prompt(context_data: Dict[str, Any]) -> str:
    """Formats a context prompt dictionary into a markdown string."""
    prompt_parts = ["[채점 기준]"]

    for section in context_data.get("sections", []):
        prompt_parts.append(f"\\n**{section.get('title', '')}**")
        for criterion in section.get("criteria", []):
            prompt_parts.append(
                f"- {criterion.get('score', '')}: {criterion.get('description', '')}")

    if "guidelines" in context_data:
        prompt_parts.append("\\n[가이드라인]")
        for guideline in context_data.get("guidelines", []):
            prompt_parts.append(f"- {guideline}")

    return "\\n".join(prompt_parts)
