from config import prompt_keys
from prompts.loader import load_prompt_text, load_prompt_json

PROMPT_REGISTRY = {
    # Evaluator Prompts (Common)
    prompt_keys.EVALUATOR_ROLE_PROMPT: load_prompt_text("prompts/evaluator/common/role.md"),
    prompt_keys.EVALUATOR_RULES_PROMPT: load_prompt_text("prompts/evaluator/common/rules.md"),
    prompt_keys.EVALUATOR_CONTEXT_TEMPLATE_PROMPT: load_prompt_text(
        "prompts/evaluator/common/context_template.md"),

    # Evaluator - Sentence Completion
    prompt_keys.EVALUATOR_SC_CONTEXT_RUBRIC_PROMPT: load_prompt_json(
        "prompts/evaluator/sentence_completion/context.json"),
    prompt_keys.EVALUATOR_SC_FEWSHOT_PROMPT: load_prompt_text(
        "prompts/evaluator/sentence_completion/fewshot.md"),

    # Evaluator - Info Description
    prompt_keys.EVALUATOR_ID_CONTEXT_RUBRIC_PROMPT: load_prompt_json(
        "prompts/evaluator/info_description/context.json"),
    prompt_keys.EVALUATOR_ID_FEWSHOT_PROMPT: load_prompt_text(
        "prompts/evaluator/info_description/fewshot.md"),
    prompt_keys.EVALUATOR_ID_RULES_PROMPT: load_prompt_text(
        "prompts/evaluator/info_description/rules.md"),

    # Evaluator - Opinion Essay
    prompt_keys.EVALUATOR_OE_CONTEXT_RUBRIC_PROMPT: load_prompt_json(
        "prompts/evaluator/opinion_essay/context.json"),
    prompt_keys.EVALUATOR_OE_FEWSHOT_PROMPT: load_prompt_text(
        "prompts/evaluator/opinion_essay/fewshot.md"),
    prompt_keys.EVALUATOR_OE_RULES_PROMPT: load_prompt_text(
        "prompts/evaluator/opinion_essay/rules.md"),

    # Corrector Prompts (Common)
    prompt_keys.CORRECTOR_RULES_PROMPT: load_prompt_text("prompts/corrector/common/rules.md"),
    prompt_keys.CORRECTOR_CONTEXT_TEMPLATE_PROMPT: load_prompt_text(
        "prompts/corrector/common/context_template.md"),

    # Corrector - Info Description
    prompt_keys.CORRECTOR_ID_CONTEXT_RUBRIC_PROMPT: load_prompt_json(
        "prompts/corrector/info_description/context.json"),
    prompt_keys.CORRECTOR_ID_FEWSHOT_PROMPT: load_prompt_text(
        "prompts/corrector/info_description/fewshot.md"),
    prompt_keys.CORRECTOR_ID_RULES_PROMPT: load_prompt_text(
        "prompts/corrector/info_description/rules.md"),

    # Corrector - Opinion Essay
    prompt_keys.CORRECTOR_OE_CONTEXT_RUBRIC_PROMPT: load_prompt_json(
        "prompts/corrector/opinion_essay/context.json"),
    prompt_keys.CORRECTOR_OE_FEWSHOT_PROMPT: load_prompt_text(
        "prompts/corrector/opinion_essay/fewshot.md"),
    prompt_keys.CORRECTOR_OE_RULES_PROMPT: load_prompt_text(
        "prompts/corrector/opinion_essay/rules.md"),
}
