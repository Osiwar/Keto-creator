import json
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.database import get_db
from app.models.meal import Meal, MealPlan, MealPlanSlot
from app.models.user import User, UserProfile
from app.middleware.auth_middleware import get_current_user
from app.services.meal_service import generate_week_plan
from app.routers.meals import meal_to_dict

router = APIRouter(prefix="/meal-plans", tags=["meal-plans"])


def slot_to_dict(slot: MealPlanSlot) -> dict:
    return {
        "id": slot.id,
        "day_of_week": slot.day_of_week,
        "meal_type": slot.meal_type,
        "is_eaten": slot.is_eaten,
        "sort_order": slot.sort_order,
        "meal": meal_to_dict(slot.meal) if slot.meal else None,
    }


def plan_to_dict(plan: MealPlan) -> dict:
    days: dict[int, list] = {i: [] for i in range(7)}
    for slot in sorted(plan.slots, key=lambda s: s.sort_order):
        days[slot.day_of_week].append(slot_to_dict(slot))
    return {
        "id": plan.id,
        "week_start": plan.week_start.isoformat(),
        "status": plan.status,
        "days": days,
    }


@router.post("/generate")
async def generate_plan(
    week_start: date = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    if not profile or not profile.onboarding_done:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    plan = await generate_week_plan(db, current_user.id, week_start, profile)

    # Reload with relationships
    result = await db.execute(
        select(MealPlan)
        .where(MealPlan.id == plan.id)
        .options(selectinload(MealPlan.slots).selectinload(MealPlanSlot.meal))
    )
    plan = result.scalar_one()
    return plan_to_dict(plan)


@router.get("")
async def get_plan(
    week_start: date,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MealPlan)
        .where(MealPlan.user_id == current_user.id, MealPlan.week_start == week_start)
        .options(selectinload(MealPlan.slots).selectinload(MealPlanSlot.meal))
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="No plan for this week")
    return plan_to_dict(plan)


@router.put("/{plan_id}/slot")
async def swap_slot(
    plan_id: int,
    slot_id: int = Body(..., embed=True),
    meal_id: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MealPlanSlot)
        .where(MealPlanSlot.id == slot_id, MealPlanSlot.meal_plan_id == plan_id)
        .options(selectinload(MealPlanSlot.meal))
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    meal_result = await db.execute(select(Meal).where(Meal.id == meal_id))
    meal = meal_result.scalar_one_or_none()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    slot.meal_id = meal_id
    slot.meal = meal
    await db.commit()
    return slot_to_dict(slot)


@router.patch("/{plan_id}/slot/{slot_id}/eaten")
async def mark_eaten(
    plan_id: int,
    slot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    result = await db.execute(
        select(MealPlanSlot)
        .where(MealPlanSlot.id == slot_id)
        .options(selectinload(MealPlanSlot.meal))
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot.is_eaten = not slot.is_eaten
    slot.eaten_at = datetime.utcnow() if slot.is_eaten else None
    await db.commit()
    return slot_to_dict(slot)
