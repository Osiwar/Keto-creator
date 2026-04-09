from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, UserProfile
from app.middleware.auth_middleware import get_current_user
from app.services.macro_service import calculate_tdee, calculate_keto_macros

router = APIRouter(prefix="/users", tags=["users"])


class OnboardingData(BaseModel):
    diet_type: str
    goal: str
    activity_level: str
    age: int
    weight_kg: float
    height_cm: float
    gender: str
    weekly_budget: Optional[float] = None
    allergies: list[str] = []
    timezone: str = "UTC"


class ProfileUpdate(BaseModel):
    target_calories: Optional[int] = None
    target_fat_g: Optional[int] = None
    target_protein_g: Optional[int] = None
    target_carbs_g: Optional[int] = None
    weekly_budget: Optional[float] = None


class AllergiesUpdate(BaseModel):
    allergies: list[str]


@router.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Admin stats dashboard."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total = (await db.execute(select(func.count(User.id)))).scalar()
    new_today = (await db.execute(select(func.count(User.id)).where(User.created_at >= today_start))).scalar()
    new_this_week = (await db.execute(select(func.count(User.id)).where(User.created_at >= week_ago))).scalar()
    onboarding_done = (await db.execute(
        select(func.count(UserProfile.id)).where(UserProfile.onboarding_done == True)
    )).scalar()

    diet_rows = (await db.execute(
        select(UserProfile.diet_type, func.count(UserProfile.id)).group_by(UserProfile.diet_type)
    )).all()

    goal_rows = (await db.execute(
        select(UserProfile.goal, func.count(UserProfile.id)).group_by(UserProfile.goal)
    )).all()

    recent_users = (await db.execute(
        select(User.email, User.full_name, User.created_at)
        .order_by(User.created_at.desc()).limit(10)
    )).all()

    return {
        "total_users": total,
        "new_today": new_today,
        "new_this_week": new_this_week,
        "onboarding_done": onboarding_done,
        "onboarding_rate": round(onboarding_done / total * 100) if total else 0,
        "diet_breakdown": {row[0] or "not set": row[1] for row in diet_rows},
        "goal_breakdown": {row[0] or "not set": row[1] for row in goal_rows},
        "recent_signups": [
            {"email": r[0], "name": r[1] or "", "joined": r[2].isoformat() if r[2] else ""}
            for r in recent_users
        ],
    }


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        return {}
    return {
        "diet_type": profile.diet_type,
        "goal": profile.goal,
        "activity_level": profile.activity_level,
        "age": profile.age,
        "weight_kg": profile.weight_kg,
        "height_cm": profile.height_cm,
        "gender": profile.gender,
        "target_calories": profile.target_calories,
        "target_fat_g": profile.target_fat_g,
        "target_protein_g": profile.target_protein_g,
        "target_carbs_g": profile.target_carbs_g,
        "weekly_budget": profile.weekly_budget,
        "allergies": json.loads(profile.allergies or "[]"),
        "onboarding_done": profile.onboarding_done,
        "timezone": profile.timezone,
    }


@router.patch("/allergies")
async def update_allergies(
    data: AllergiesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.allergies = json.dumps(data.allergies)
    await db.commit()
    return {"allergies": data.allergies}


@router.post("/onboarding")
async def complete_onboarding(
    data: OnboardingData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    tdee = calculate_tdee(data.weight_kg, data.height_cm, data.age, data.gender, data.activity_level)
    macros = calculate_keto_macros(tdee, data.goal, data.diet_type)

    profile.diet_type = data.diet_type
    profile.goal = data.goal
    profile.activity_level = data.activity_level
    profile.age = data.age
    profile.weight_kg = data.weight_kg
    profile.height_cm = data.height_cm
    profile.gender = data.gender
    profile.weekly_budget = data.weekly_budget
    profile.allergies = json.dumps(data.allergies)
    profile.timezone = data.timezone
    profile.target_calories = macros["calories"]
    profile.target_fat_g = macros["fat_g"]
    profile.target_protein_g = macros["protein_g"]
    profile.target_carbs_g = macros["carbs_g"]
    profile.onboarding_done = True

    await db.commit()
    return {"success": True, "macros": macros}
