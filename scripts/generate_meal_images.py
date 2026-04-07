"""
KetoCoach — Générateur d'images DALL-E 3
=========================================
1. Remplis OPENAI_API_KEY et VERCEL_URL ci-dessous
2. Lance : python scripts/generate_meal_images.py
3. Fais un git push → les images s'affichent sur Vercel automatiquement
"""

import os
import re
import time
import requests
from pathlib import Path
from openai import OpenAI

# ─────────────────────────────────────────────
# ⚙️  CONFIG — Remplis ces deux lignes
# ─────────────────────────────────────────────
OPENAI_API_KEY = "sk-..."          # Ta clé OpenAI
VERCEL_URL     = "https://ton-app.vercel.app"  # Ex: https://keto-creator.vercel.app
# ─────────────────────────────────────────────

OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "meals"
KETO_DATA  = Path(__file__).parent.parent / "backend" / "app" / "utils" / "keto_data.py"

MEALS = [
    # ── BREAKFAST ──────────────────────────────────────────────────────────
    {
        "name": "Bacon & Egg Bowl",
        "slug": "bacon-egg-bowl",
        "prompt": (
            "Professional food photography of crispy bacon strips and sunny-side-up fried eggs "
            "with melted cheddar cheese in a rustic ceramic bowl, dark wooden table, "
            "natural side lighting, shallow depth of field, 4K restaurant quality"
        ),
    },
    {
        "name": "Keto Avocado Eggs",
        "slug": "keto-avocado-eggs",
        "prompt": (
            "Professional food photography of two fresh avocado halves with eggs baked inside, "
            "sprinkled with smoked paprika and sea salt, on a white ceramic plate, "
            "bright natural lighting, minimalist style, close-up"
        ),
    },
    {
        "name": "Steak & Eggs",
        "slug": "steak-and-eggs",
        "prompt": (
            "Professional food photography of a sliced medium-rare ribeye steak alongside "
            "two sunny-side-up eggs on a cast iron skillet, dark moody background, "
            "steam rising, dramatic lighting, restaurant quality"
        ),
    },
    {
        "name": "Keto Smoothie Bowl",
        "slug": "keto-smoothie-bowl",
        "prompt": (
            "Professional food photography of a thick creamy coconut smoothie bowl "
            "topped with fresh raspberries, chia seeds, and almond butter drizzle, "
            "white bowl on light marble surface, top-down shot, vibrant colors"
        ),
    },
    {
        "name": "Carnivore Sausage Scramble",
        "slug": "carnivore-sausage-scramble",
        "prompt": (
            "Professional food photography of fluffy scrambled eggs with sliced pork sausage "
            "rounds cooked in a skillet, golden and appetizing, rustic wooden background, "
            "warm natural lighting, close-up shot"
        ),
    },

    # ── LUNCH ──────────────────────────────────────────────────────────────
    {
        "name": "Ribeye Steak Salad",
        "slug": "ribeye-steak-salad",
        "prompt": (
            "Professional food photography of sliced medium-rare ribeye steak on fresh arugula "
            "with shaved parmesan and olive oil dressing, elegant ceramic plate, "
            "restaurant quality plating, natural side lighting"
        ),
    },
    {
        "name": "Ground Beef Bowl",
        "slug": "ground-beef-bowl",
        "prompt": (
            "Professional food photography of a bowl with seasoned ground beef and "
            "sauteed mushrooms topped with a fried egg, rustic bowl on wooden surface, "
            "warm lighting, close-up, appetizing"
        ),
    },
    {
        "name": "Chicken Thigh & Avocado Plate",
        "slug": "chicken-thigh-avocado",
        "prompt": (
            "Professional food photography of crispy golden skin-on chicken thighs "
            "on a plate with sliced ripe avocado and herb butter sauce drizzled over, "
            "dark slate background, restaurant quality, dramatic lighting"
        ),
    },
    {
        "name": "Tuna Lettuce Wraps",
        "slug": "tuna-lettuce-wraps",
        "prompt": (
            "Professional food photography of fresh butter lettuce cups filled with "
            "tuna mayo salad and celery, arranged neatly on a white plate, "
            "bright clean background, top-down view, fresh and light"
        ),
    },
    {
        "name": "Bone Broth Beef Stew",
        "slug": "bone-broth-beef-stew",
        "prompt": (
            "Professional food photography of rich hearty beef stew with tender chunks "
            "of beef chuck in dark bone broth with celery, in a rustic ceramic bowl, "
            "steam rising, cozy dark kitchen background, warm tones"
        ),
    },
    {
        "name": "Salmon Avocado Bowl",
        "slug": "salmon-avocado-bowl",
        "prompt": (
            "Professional food photography of pan-seared salmon fillet with crispy golden skin "
            "on a bed of sliced avocado with lemon butter dill sauce, "
            "elegant white ceramic plate, restaurant quality, natural lighting"
        ),
    },

    # ── DINNER ─────────────────────────────────────────────────────────────
    {
        "name": "New York Strip with Herb Butter",
        "slug": "ny-strip-herb-butter",
        "prompt": (
            "Professional food photography of a perfectly seared New York strip steak "
            "topped with melting garlic herb butter, fresh rosemary and thyme sprigs, "
            "cast iron skillet, dramatic dark background, steam, restaurant quality"
        ),
    },
    {
        "name": "Creamy Garlic Butter Shrimp",
        "slug": "creamy-garlic-shrimp",
        "prompt": (
            "Professional food photography of jumbo shrimp in a rich creamy garlic "
            "parmesan sauce in a skillet, golden and glistening, dark moody background, "
            "close-up, restaurant quality"
        ),
    },
    {
        "name": "Pork Belly Strips",
        "slug": "pork-belly-strips",
        "prompt": (
            "Professional food photography of slow-roasted pork belly strips "
            "with perfectly crispy golden crackling skin, caramelized exterior, "
            "arranged on a wooden board, dark background, dramatic side lighting"
        ),
    },
    {
        "name": "Lamb Chops with Rosemary",
        "slug": "lamb-chops-rosemary",
        "prompt": (
            "Professional food photography of three grilled lamb chops with "
            "char marks, garnished with fresh rosemary sprigs and crushed garlic, "
            "on a dark slate board, restaurant quality, dramatic lighting"
        ),
    },
    {
        "name": "Keto Zucchini Lasagna",
        "slug": "keto-zucchini-lasagna",
        "prompt": (
            "Professional food photography of a slice of zucchini lasagna with visible "
            "layers of ground beef, ricotta and bubbling melted mozzarella, "
            "golden brown top, baking dish, rustic Italian kitchen background"
        ),
    },
    {
        "name": "Butter Chicken (Keto)",
        "slug": "butter-chicken-keto",
        "prompt": (
            "Professional food photography of creamy butter chicken curry with "
            "tender chicken pieces in vibrant orange-red tomato cream sauce, "
            "in a ceramic bowl, garnished with cream swirl, Indian restaurant style"
        ),
    },
    {
        "name": "Organ Meat Patties",
        "slug": "organ-meat-patties",
        "prompt": (
            "Professional food photography of four seared beef patties with "
            "beautifully golden-brown crusts on a dark slate board, "
            "minimalist plating, dramatic moody lighting, close-up"
        ),
    },

    # ── SNACKS ─────────────────────────────────────────────────────────────
    {
        "name": "Beef Jerky (Homemade)",
        "slug": "beef-jerky",
        "prompt": (
            "Professional food photography of homemade beef jerky strips, "
            "dark mahogany brown and dried, arranged on parchment paper "
            "on a rustic wooden board, natural lighting, close-up"
        ),
    },
    {
        "name": "Cheese Crisps",
        "slug": "cheese-crisps",
        "prompt": (
            "Professional food photography of golden crispy parmesan cheese rounds "
            "on white parchment paper, perfectly browned and lacy, "
            "light minimalist background, close-up, macro shot"
        ),
    },
    {
        "name": "Hard Boiled Eggs & Bacon",
        "slug": "hard-boiled-eggs-bacon",
        "prompt": (
            "Professional food photography of hard-boiled eggs wrapped in "
            "crispy bacon strips, arranged on a wooden board with sea salt flakes, "
            "rustic background, warm natural lighting"
        ),
    },
    {
        "name": "Almond Butter Fat Bombs",
        "slug": "almond-butter-fat-bombs",
        "prompt": (
            "Professional food photography of small round frozen almond butter "
            "and coconut oil fat bombs, arranged on a dark slate board, "
            "minimalist styling, cool tones, elegant close-up"
        ),
    },
]


def generate_and_save():
    client = OpenAI(api_key=OPENAI_API_KEY)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    url_map = {}  # slug → final URL
    total = len(MEALS)

    print(f"\n🚀 Génération de {total} images avec DALL-E 3...\n")

    for i, meal in enumerate(MEALS, 1):
        slug     = meal["slug"]
        filename = f"{slug}.jpg"
        filepath = OUTPUT_DIR / filename
        final_url = f"{VERCEL_URL.rstrip('/')}/meals/{filename}"

        # Skip if already generated
        if filepath.exists():
            print(f"  ⏭️  [{i}/{total}] {meal['name']} — déjà généré, skip")
            url_map[meal["name"]] = final_url
            continue

        print(f"  🎨 [{i}/{total}] {meal['name']}...", end=" ", flush=True)

        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=meal["prompt"],
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = response.data[0].url

            # Download image
            img_response = requests.get(image_url, timeout=30)
            img_response.raise_for_status()

            with open(filepath, "wb") as f:
                f.write(img_response.content)

            url_map[meal["name"]] = final_url
            print(f"✅ sauvegardé → {filename}")

        except Exception as e:
            print(f"❌ ERREUR: {e}")
            url_map[meal["name"]] = None

        # Respect rate limit (5 images/min on DALL-E 3)
        if i < total:
            time.sleep(13)

    return url_map


def update_keto_data(url_map: dict):
    print("\n📝 Mise à jour de keto_data.py...")
    content = KETO_DATA.read_text(encoding="utf-8")

    updated = 0
    for meal in MEALS:
        new_url = url_map.get(meal["name"])
        if not new_url:
            continue

        # Replace any existing image_url for this meal block
        # We match the name then replace the next image_url line
        pattern = (
            r'("name":\s*"' + re.escape(meal["name"]) + r'".*?'
            r'"image_url":\s*")[^"]+(")'
        )
        replacement = r'\g<1>' + new_url + r'\g<2>'
        new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
        if count:
            content = new_content
            updated += 1

    KETO_DATA.write_text(content, encoding="utf-8")
    print(f"  ✅ {updated} URLs mises à jour dans keto_data.py")


def main():
    if OPENAI_API_KEY.startswith("sk-..."):
        print("❌ Remplis OPENAI_API_KEY dans le script !")
        return
    if "ton-app" in VERCEL_URL:
        print("❌ Remplis VERCEL_URL dans le script !")
        return

    url_map = generate_and_save()

    successful = sum(1 for v in url_map.values() if v)
    print(f"\n✅ {successful}/{len(MEALS)} images générées dans frontend/public/meals/")

    update_keto_data(url_map)

    print("\n" + "="*55)
    print("🎉 Terminé ! Prochaines étapes :")
    print("  1. git add frontend/public/meals/ backend/app/utils/keto_data.py")
    print("  2. git commit -m 'feat: add AI-generated meal images'")
    print("  3. git push")
    print("  → Vercel redéploie automatiquement avec les nouvelles images")
    print("  → Railway met à jour la DB au prochain démarrage")
    print("="*55 + "\n")


if __name__ == "__main__":
    main()
