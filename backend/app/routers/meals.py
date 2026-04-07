import json
import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.meal import Meal
from app.models.user import User, UserProfile
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])


def meal_to_dict(meal: Meal) -> dict:
    return {
        "id": meal.id,
        "name": meal.name,
        "description": meal.description,
        "image_url": meal.image_url,
        "diet_type": meal.diet_type,
        "meal_type": meal.meal_type,
        "prep_time_mins": meal.prep_time_mins,
        "cook_time_mins": meal.cook_time_mins,
        "servings": meal.servings,
        "calories": meal.calories,
        "fat_g": meal.fat_g,
        "protein_g": meal.protein_g,
        "carbs_g": meal.carbs_g,
        "fiber_g": meal.fiber_g,
        "ingredients": json.loads(meal.ingredients or "[]"),
        "instructions": json.loads(meal.instructions or "[]"),
        "tags": json.loads(meal.tags or "[]"),
        "allergens": json.loads(meal.allergens or "[]"),
        "cost_estimate": meal.cost_estimate,
    }


@router.get("")
async def list_meals(
    diet_type: str = Query(default=None),
    meal_type: str = Query(default=None),
    q: str = Query(default=None),
    limit: int = Query(default=20),
    offset: int = Query(default=0),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Meal))
    meals = result.scalars().all()

    if diet_type:
        meals = [m for m in meals if m.diet_type in ["both", diet_type]]
    if meal_type:
        meals = [m for m in meals if m.meal_type == meal_type]
    if q:
        q_lower = q.lower()
        meals = [m for m in meals if q_lower in m.name.lower()]

    total = len(meals)
    meals = meals[offset: offset + limit]
    return {"total": total, "items": [meal_to_dict(m) for m in meals]}


@router.get("/{meal_id}")
async def get_meal(meal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meal).where(Meal.id == meal_id))
    meal = result.scalar_one_or_none()
    if not meal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal_to_dict(meal)


@router.get("/{meal_id}/alternatives")
async def get_alternatives(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return up to 4 alternative meals of the same type, compatible with user profile (no allergens)."""
    from fastapi import HTTPException

    meal_result = await db.execute(select(Meal).where(Meal.id == meal_id))
    meal = meal_result.scalar_one_or_none()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()

    user_allergies = json.loads(profile.allergies or "[]") if profile else []
    diet_type = profile.diet_type or "keto" if profile else "keto"

    all_result = await db.execute(select(Meal))
    all_meals = all_result.scalars().all()

    alternatives = [
        m for m in all_meals
        if m.id != meal_id
        and m.meal_type == meal.meal_type
        and m.diet_type in ["both", diet_type]
        and not any(a in json.loads(m.allergens or "[]") for a in user_allergies)
    ]
    random.shuffle(alternatives)
    return [meal_to_dict(m) for m in alternatives[:4]]
