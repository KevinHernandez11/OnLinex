from app.prompts.default import DEFAULT_PROMPT
from app.prompts.dante import dante_prompt
from app.prompts.lady import lady_prompt
from app.prompts.vergil import vergil_prompt

PROFILES = {
    "default": {
        "prompt": DEFAULT_PROMPT,
        "model": "gpt-4.1-2025-04-14",
        "temperature": 0.7,
    },
    "dante": {
        "prompt": dante_prompt,
        "model": "gpt-4.1-2025-04-14",
        "temperature": 0.8,
    },
    "lady": {
        "prompt": lady_prompt,
        "model": "gpt-4.1-2025-04-14",
        "temperature": 0.7,
    },
    "vergil": {
        "prompt": vergil_prompt,
        "model": "gpt-4.1-2025-04-14",
        "temperature": 0.6,
    },
}
