import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.database import get_db
from app.models.meal import MealPlan, MealPlanSlot
from app.models.shopping import ShoppingList, ShoppingItem
from app.models.user import User
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/shopping", tags=["shopping"])

SECTION_MAP = {
    "beef": "meat", "steak": "meat", "chicken": "meat", "pork": "meat",
    "lamb": "meat", "bacon": "meat", "sausage": "meat", "ground beef": "meat",
    "salmon": "fish", "tuna": "fish", "shrimp": "seafood",
    "egg": "dairy", "butter": "dairy", "cream": "dairy", "cheese": "dairy",
    "mozzarella": "dairy", "parmesan": "dairy", "ricotta": "dairy",
    "avocado": "produce", "arugula": "produce", "zucchini": "produce",
    "mushroom": "produce", "celery": "produce", "lettuce": "produce",
    "garlic": "produce", "lemon": "produce", "rosemary": "produce",
    "thyme": "produce", "dill": "produce",
    "olive oil": "pantry", "coconut oil": "pantry", "almond butter": "pantry",
    "chia seeds": "pantry", "vanilla": "pantry", "paprika": "pantry",
    "bone broth": "pantry", "tallow": "pantry",
}


def categorize(name: str) -> str:
    lower = name.lower()
    for keyword, section in SECTION_MAP.items():
        if keyword in lower:
            return section
    return "other"


def item_to_dict(item: ShoppingItem) -> dict:
    return {
        "id": item.id,
        "ingredient_name": item.ingredient_name,
        "amount": item.amount,
        "unit": item.unit,
        "store_section": item.store_section,
        "is_checked": item.is_checked,
    }


@router.post("/generate")
async def generate_shopping_list(
    meal_plan_id: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan_result = await db.execute(
        select(MealPlan)
        .where(MealPlan.id == meal_plan_id, MealPlan.user_id == current_user.id)
        .options(selectinload(MealPlan.slots).selectinload(MealPlanSlot.meal))
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    # Aggregate ingredients
    aggregated: dict[str, dict] = {}
    for slot in plan.slots:
        if not slot.meal:
            continue
        ingredients = json.loads(slot.meal.ingredients or "[]")
        for ing in ingredients:
            name = ing.get("name", "").lower()
            if name not in aggregated:
                aggregated[name] = {"name": ing.get("name"), "amount": ing.get("amount", ""), "unit": ing.get("unit", "")}

    # Delete old list for this plan
    old_result = await db.execute(
        select(ShoppingList).where(
            ShoppingList.user_id == current_user.id,
            ShoppingList.meal_plan_id == meal_plan_id
        )
    )
    old_list = old_result.scalar_one_or_none()
    if old_list:
        await db.delete(old_list)
        await db.flush()

    shopping_list = ShoppingList(
        user_id=current_user.id,
        meal_plan_id=meal_plan_id,
        title=f"Week of {plan.week_start.strftime('%b %d')}",
    )
    db.add(shopping_list)
    await db.flush()

    items = []
    for i, (_, ing) in enumerate(aggregated.items()):
        item = ShoppingItem(
            shopping_list_id=shopping_list.id,
            ingredient_name=ing["name"],
            amount=ing["amount"],
            unit=ing["unit"],
            store_section=categorize(ing["name"]),
            sort_order=i,
        )
        items.append(item)

    db.add_all(items)
    await db.commit()
    await db.refresh(shopping_list)

    result = await db.execute(
        select(ShoppingList)
        .where(ShoppingList.id == shopping_list.id)
        .options(selectinload(ShoppingList.items))
    )
    shopping_list = result.scalar_one()

    return {
        "id": shopping_list.id,
        "title": shopping_list.title,
        "items": [item_to_dict(i) for i in sorted(shopping_list.items, key=lambda x: x.store_section)],
    }


@router.get("")
async def get_shopping_list(
    meal_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ShoppingList)
        .where(ShoppingList.user_id == current_user.id, ShoppingList.meal_plan_id == meal_plan_id)
        .options(selectinload(ShoppingList.items))
    )
    sl = result.scalar_one_or_none()
    if not sl:
        raise HTTPException(status_code=404, detail="No shopping list found")
    return {
        "id": sl.id,
        "title": sl.title,
        "items": [item_to_dict(i) for i in sorted(sl.items, key=lambda x: x.store_section)],
    }


@router.patch("/items/{item_id}")
async def toggle_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ShoppingItem).where(ShoppingItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_checked = not item.is_checked
    await db.commit()
    return item_to_dict(item)
