from app.prompts.default import DEFAULT_PROMPT
from app.prompts.dante import dante_prompt
from app.prompts.lady import lady_prompt
from app.prompts.vergil import vergil_prompt
from app.prompts.emma import emma_frost_prompt

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
    "emma_frost": {
        "prompt": emma_frost_prompt,
        "model": "gpt-4.1-2025-04-14",
        "temperature": 0.6,
    },
}
