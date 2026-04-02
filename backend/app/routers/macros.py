from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserProfile
from app.middleware.auth_middleware import get_current_user
from app.services.macro_service import calculate_tdee, calculate_keto_macros

router = APIRouter(prefix="/macros", tags=["macros"])


@router.get("/calculator")
async def macro_calculator(
    age: int = Query(...),
    weight_kg: float = Query(...),
    height_cm: float = Query(...),
    gender: str = Query(...),
    activity_level: str = Query(...),
    goal: str = Query(default="fat_loss"),
    diet_type: str = Query(default="keto"),
):
    tdee = calculate_tdee(weight_kg, height_cm, age, gender, activity_level)
    macros = calculate_keto_macros(tdee, goal, diet_type)
    return {"tdee": tdee, **macros}


@router.get("/targets")
async def get_targets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        return {"calories": 1800, "fat_g": 140, "protein_g": 120, "carbs_g": 20}
    return {
        "calories": profile.target_calories or 1800,
        "fat_g": profile.target_fat_g or 140,
        "protein_g": profile.target_protein_g or 120,
        "carbs_g": profile.target_carbs_g or 20,
    }
