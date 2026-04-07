import random
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sql_delete
from app.models.meal import Meal, MealPlan, MealPlanSlot
from app.models.user import UserProfile
import json


MEAL_TYPES_ORDER = ["breakfast", "lunch", "dinner"]


async def generate_week_plan(
    db: AsyncSession,
    user_id: int,
    week_start: date,
    profile: UserProfile,
) -> MealPlan:
    # Delete existing plan for this week
    existing = await db.execute(
        select(MealPlan).where(MealPlan.user_id == user_id, MealPlan.week_start == week_start)
    )
    existing_plan = existing.scalar_one_or_none()
    if existing_plan:
        # Delete slots first (explicit cascade for async SQLAlchemy)
        await db.execute(sql_delete(MealPlanSlot).where(MealPlanSlot.meal_plan_id == existing_plan.id))
        await db.delete(existing_plan)
        await db.flush()

    allergies = json.loads(profile.allergies or "[]")
    diet_type = profile.diet_type or "keto"
    target_calories = profile.target_calories or 1800

    # Fetch all meals
    result = await db.execute(select(Meal))
    all_meals = result.scalars().all()

    # Filter by diet and allergies
    diet_filter = ["both", diet_type]

    def is_compatible(meal: Meal) -> bool:
        if meal.diet_type not in diet_filter:
            return False
        meal_allergens = json.loads(meal.allergens or "[]")
        if any(a in meal_allergens for a in allergies):
            return False
        return True

    compatible = [m for m in all_meals if is_compatible(m)]

    # Group by meal type and shuffle each group for variety
    by_type: dict[str, list[Meal]] = {}
    for mt in MEAL_TYPES_ORDER:
        pool = [m for m in compatible if m.meal_type == mt]
        random.shuffle(pool)
        by_type[mt] = pool

    meal_plan = MealPlan(user_id=user_id, week_start=week_start)
    db.add(meal_plan)
    await db.flush()

    target_per_meal = target_calories / len(MEAL_TYPES_ORDER)

    slots = []
    # Track used meal IDs per type across the whole week for variety
    used_per_type: dict[str, list[int]] = {mt: [] for mt in MEAL_TYPES_ORDER}

    for day in range(7):
        used_this_day: list[int] = []

        for sort_order, mt in enumerate(MEAL_TYPES_ORDER):
            pool = by_type.get(mt, [])
            if not pool:
                continue

            # Prefer meals not used this week, not used today
            candidates = [
                m for m in pool
                if m.id not in used_per_type[mt] and m.id not in used_this_day
            ]

            # If all weekly meals exhausted for this type, reset (allows reuse after full cycle)
            if not candidates:
                used_per_type[mt] = []
                candidates = [m for m in pool if m.id not in used_this_day]

            # Fallback: any meal for this type
            if not candidates:
                candidates = pool

            # Pick from top-3 closest to calorie target (adds variety while staying on-target)
            candidates_sorted = sorted(candidates, key=lambda m: abs(m.calories - target_per_meal))
            top_n = candidates_sorted[:3]
            meal = random.choice(top_n)

            slot = MealPlanSlot(
                meal_plan_id=meal_plan.id,
                day_of_week=day,
                meal_type=mt,
                meal_id=meal.id,
                sort_order=sort_order,
            )
            slots.append(slot)
            used_this_day.append(meal.id)
            used_per_type[mt].append(meal.id)

    db.add_all(slots)
    await db.commit()
    await db.refresh(meal_plan)
    return meal_plan


async def get_meal_suggestions(
    db: AsyncSession,
    meal_type: str,
    diet_type: str,
    exclude_ids: list[int],
    limit: int = 6,
) -> list[Meal]:
    result = await db.execute(select(Meal))
    all_meals = result.scalars().all()
    suggestions = [
        m for m in all_meals
        if m.meal_type == meal_type
        and m.diet_type in ["both", diet_type]
        and m.id not in exclude_ids
    ]
    random.shuffle(suggestions)
    return suggestions[:limit]
