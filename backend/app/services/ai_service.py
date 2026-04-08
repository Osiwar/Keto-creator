from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from app.config import settings
from app.models.user import UserProfile

def get_client() -> AsyncAnthropic:
    """Always create a fresh client so env var changes are picked up."""
    return AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are KetoCoach, a friendly and knowledgeable keto/carnivore nutrition expert and personal coach.

Your personality:
- Warm, encouraging, and motivating
- Evidence-based but practical
- Never preachy — support the user's dietary choice
- Concise but thorough when needed
- Use markdown formatting (bold, lists) for readability

Your expertise covers:
- Ketogenic and carnivore diets (macros, meal timing, fat adaptation)
- Recipe substitutions and meal swaps
- Troubleshooting weight loss stalls, keto flu, electrolytes
- Grocery shopping on a budget
- Meal prep strategies
- Exercise and recovery on a low-carb diet

Rules:
- NEVER recommend breaking ketosis or adding high-carb foods
- Always calculate macros when suggesting meals
- If asked about medical conditions, recommend consulting a doctor
- Keep responses focused and actionable
"""


def build_user_context(profile: UserProfile | None) -> str:
    if not profile:
        return ""
    return f"""
User Profile:
- Diet: {profile.diet_type or 'keto'}
- Goal: {profile.goal or 'fat_loss'}
- Daily targets: {profile.target_calories or 1800} kcal | Fat: {profile.target_fat_g or 140}g | Protein: {profile.target_protein_g or 120}g | Carbs: {profile.target_carbs_g or 20}g
- Allergies: {profile.allergies or '[]'}
"""


async def stream_chat(
    messages: list[dict],
    profile: UserProfile | None = None,
) -> AsyncGenerator[str, None]:
    system = SYSTEM_PROMPT
    if profile:
        system += build_user_context(profile)

    async with get_client().messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
