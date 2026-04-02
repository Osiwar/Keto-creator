from typing import Optional


def calculate_tdee(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str,
) -> int:
    # Mifflin-St Jeor BMR
    if gender == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    tdee = bmr * activity_multipliers.get(activity_level, 1.55)
    return round(tdee)


def calculate_keto_macros(
    tdee: int,
    goal: str,
    diet_type: str,
) -> dict:
    # Calorie adjustment based on goal
    if goal == "fat_loss":
        target_calories = round(tdee * 0.80)
    elif goal == "muscle_gain":
        target_calories = round(tdee * 1.10)
    else:
        target_calories = tdee

    if diet_type == "carnivore":
        # Carnivore: zero carbs, high protein, fat fills the rest
        protein_g = round(target_calories * 0.35 / 4)
        carbs_g = 0
        fat_g = round((target_calories - protein_g * 4) / 9)
    else:
        # Standard keto: 70% fat, 25% protein, 5% carbs (max 20g net)
        carbs_g = min(20, round(target_calories * 0.05 / 4))
        protein_g = round(target_calories * 0.25 / 4)
        fat_g = round((target_calories - carbs_g * 4 - protein_g * 4) / 9)

    return {
        "calories": target_calories,
        "fat_g": fat_g,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
    }
