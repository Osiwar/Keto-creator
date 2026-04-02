import random
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
        await db.delete(existing_plan)
        await db.flush()

    allergies = json.loads(profile.allergies or "[]")
    diet_type = profile.diet_type or "keto"
    target_calories = profile.target_calories or 1800

    # Fetch all meals matching diet
    diet_filter = ["both", diet_type]
    result = await db.execute(select(Meal))
    all_meals = result.scalars().all()

    # Filter by diet and allergies
    def is_compatible(meal: Meal) -> bool:
        if meal.diet_type not in diet_filter:
            return False
        meal_allergens = json.loads(meal.allergens or "[]")
        if any(a in meal_allergens for a in allergies):
            return False
        return True

    compatible = [m for m in all_meals if is_compatible(m)]

    by_type: dict[str, list[Meal]] = {}
    for mt in MEAL_TYPES_ORDER:
        by_type[mt] = [m for m in compatible if m.meal_type == mt]

    meal_plan = MealPlan(user_id=user_id, week_start=week_start)
    db.add(meal_plan)
    await db.flush()

    slots = []
    for day in range(7):
        used_this_day: list[int] = []
        day_calories = 0

        for sort_order, mt in enumerate(MEAL_TYPES_ORDER):
            candidates = [m for m in by_type.get(mt, []) if m.id not in used_this_day]
            if not candidates:
                candidates = by_type.get(mt, [])
            if not candidates:
                continue

            # Pick meal closest to 1/3 of daily target
            target_per_meal = target_calories / len(MEAL_TYPES_ORDER)
            meal = min(candidates, key=lambda m: abs(m.calories - target_per_meal))

            slot = MealPlanSlot(
                meal_plan_id=meal_plan.id,
                day_of_week=day,
                meal_type=mt,
                meal_id=meal.id,
                sort_order=sort_order,
            )
            slots.append(slot)
            used_this_day.append(meal.id)
            day_calories += meal.calories

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
