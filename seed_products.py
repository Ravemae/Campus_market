# QuickMart Product Seed Script
# Run this after seed.py to populate products for all vendors

from sqlmodel import Session, select
from app.database import engine, create_db
from app.models.vendor import Vendor
from app.models.product import Product
import uuid

def generate_uuid():
    return str(uuid.uuid4())

VENDOR_PRODUCTS = {
    "Ayolayo Enterprises": [
        {"name": "Ladies Canvas Sneakers", "description": "Trendy canvas sneakers for ladies, available in white, black, and pink. Comfortable for all-day campus wear.", "price": 8500, "category": "Fashion & Accessories"},
        {"name": "Men's Slide Slippers", "description": "Durable rubber slides perfect for hostel and campus use. Available in sizes 39-45 in multiple colors.", "price": 3500, "category": "Fashion & Accessories"},
        {"name": "Mini Makeup Kit", "description": "Compact makeup kit including foundation, eyeshadow palette, mascara, and lip gloss. Perfect for students on a budget.", "price": 5500, "category": "Fashion & Accessories"},
        {"name": "Birthday Gift Package", "description": "Beautiful birthday gift box with ribbon, customizable with snacks, perfume, or accessories. Perfect surprise for friends on campus.", "price": 12000, "category": "Fashion & Accessories"},
        {"name": "Ladies Handbag", "description": "Stylish medium-sized handbag with multiple compartments. Suitable for class, outings, and everyday campus use.", "price": 7500, "category": "Fashion & Accessories"},
    ],
    "The Lilly Foods and Bakeries": [
        {"name": "Jollof Rice and Boiled Egg", "description": "Freshly cooked party-style jollof rice served with a boiled egg. A satisfying campus favorite.", "price": 1500, "category": "Food"},
        {"name": "Assorted Small Chops", "description": "Delicious mix of puff puff, spring rolls, samosa, and fried plantain. Great for quick bites and events.", "price": 2500, "category": "Snacks"},
        {"name": "Birthday Celebration Cake", "description": "Custom-designed celebration cake available in different sizes and flavors — chocolate, vanilla, red velvet. Order 24 hours in advance.", "price": 15000, "category": "Bakery"},
        {"name": "Bread (Small Loaf)", "description": "...", "price": 1000, "category": "Provisions"},
        {"name": "Bread (Medium Loaf)", "description": "...", "price": 1500, "category": "Provisions"},
        {"name": "Bread (Large Loaf)", "description": "...", "price": 2500, "category": "Provisions"},        {"name": "Chin Chin (500g)", "description": "Crunchy homemade chin chin in sweet and coconut flavors. Packaged in sealed bags, great as a study snack.", "price": 800, "category": "Snacks"},
        {"name": "Fried Sausage Add-on", "description": "One piece of fried sausage to pair alongside any meal. Add it to your order for a delicious protein boost.", "price": 300, "category": "Food"},
    ],
    "B.I.G Store": [
        {"name": "Golden Morn Cereal (500g)", "description": "Nestle Golden Morn maize cereal, great for a nutritious morning meal. Rich in vitamins and easy to prepare with hot water.", "price": 1500, "category": "Provisions"},
        {"name": "Eva Water (75cl)", "description": "Chilled Eva mineral water, perfectly safe and refreshing. Ideal after workouts, classes, or anytime you need hydration.", "price": 200, "category": "Drinks"},
        {"name": "Hollandia Yogurt (Strawberry)", "description": "Smooth and creamy Hollandia fruit yogurt in strawberry flavor. Chilled and ready to drink.", "price": 700, "category": "Drinks"},
        {"name": "Sliced White Bread", "description": "Fresh sliced bread loaf, soft and ready to eat. Available daily from the store.", "price": 900, "category": "Provisions"},
        {"name": "Indomie Noodles Pack (x5)", "description": "Pack of 5 Indomie instant noodles. Easy to prepare with an electric kettle — a hostel staple.", "price": 1000, "category": "Provisions"},
        {"name": "Kodak Instant Noodles (x5)", "description": "Pack of 5 Kodak instant noodles, a budget-friendly hostel favourite. Quick to make with your electric kettle.", "price": 800, "category": "Provisions"},
    ],
    "Big Meals": [
        {"name": "Fried Rice and Boiled Egg", "description": "Perfectly seasoned fried rice with mixed vegetables served with a boiled egg. A filling and satisfying campus meal.", "price": 2000, "category": "Food"},
        {"name": "Pepper Soup (Catfish)", "description": "Hot and spicy catfish pepper soup made with fresh fish and local spices. A warming and flavorful choice.", "price": 2500, "category": "Food"},
        {"name": "Moi Moi (2 wraps)", "description": "Steamed bean pudding made with blended beans, peppers, and onions. Soft, nutritious, and filling.", "price": 600, "category": "Food"},
        {"name": "Soft Drink (Coca Cola 60cl)", "description": "Ice cold Coca Cola served in a 60cl bottle. Refreshing alongside any meal.", "price": 400, "category": "Drinks"},
        {"name": "Egg Shawarma", "description": "Freshly made shawarma with boiled egg, sausage, vegetables, coleslaw, and special sauce wrapped in soft pita bread.", "price": 2000, "category": "Food"},
        {"name": "Fried Sausage Add-on", "description": "One piece of fried sausage to pair alongside any meal. Add it to your order for a delicious protein boost.", "price": 300, "category": "Food"},
    ],
    "Helena Ventures": [
        {"name": "Ladies T-Shirt (Graphic)", "description": "Trendy oversized graphic T-shirt for ladies in various designs and colors. Comfortable 100% cotton fabric.", "price": 4500, "category": "Fashion"},
        {"name": "Facial Moisturizer (Nivea)", "description": "Nivea soft moisturizing cream suitable for all skin types. Light formula absorbs quickly without greasiness.", "price": 2500, "category": "Skincare"},
        {"name": "Mini Backpack", "description": "Compact and stylish mini backpack with padded straps. Fits notebooks, water bottle, and essentials. Great for class.", "price": 6500, "category": "Accessories"},
        {"name": "Body Lotion (250ml)", "description": "Smooth and hydrating body lotion with shea butter and vitamin E. Leaves skin soft and glowing.", "price": 1800, "category": "Skincare"},
        {"name": "Men's Cargo Shorts", "description": "Durable cargo shorts with multiple pockets. Available in khaki, black, and grey. Perfect for casual campus wear.", "price": 5000, "category": "Fashion"},
    ],
    "God's Favor Limited": [
        {"name": "White Rice and Stew", "description": "Well-cooked white rice served with rich tomato stew and a boiled egg. A satisfying full meal from the canteen.", "price": 1500, "category": "Food"},
        {"name": "Doughnuts (6 pieces)", "description": "Freshly fried soft doughnuts coated in powdered sugar. Warm and fluffy, perfect as breakfast or snacks.", "price": 1000, "category": "Snacks"},
        {"name": "Zobo Drink (500ml)", "description": "Cold homemade zobo drink made from hibiscus flowers with ginger and pineapple flavor. Refreshing and natural.", "price": 500, "category": "Drinks"},
        {"name": "Spaghetti and Egg Sauce", "description": "Al dente spaghetti served with a rich tomato and egg sauce, seasoned to perfection. Filling and delicious.", "price": 1500, "category": "Food"},
        {"name": "Moi Moi and Pap", "description": "Nutritious combination of soft moi moi with smooth ogi/pap. A traditional Nigerian breakfast served fresh daily.", "price": 800, "category": "Food"},
        {"name": "Fried Sausage Add-on", "description": "One piece of fried sausage to pair alongside any meal. Add it to your order for a delicious protein boost.", "price": 300, "category": "Food"},
    ],
    "WholeU": [
        {"name": "Green Smoothie (500ml)", "description": "Freshly blended spinach, cucumber, banana, and ginger smoothie. Packed with vitamins and antioxidants.", "price": 1500, "category": "Health"},
        {"name": "Organic Groundnut Mix", "description": "Raw and roasted groundnut mix with dried fruits and seeds. High protein, energy-boosting healthy snack.", "price": 1200, "category": "Health"},
        {"name": "Shea Butter (100g)", "description": "Pure unrefined shea butter for skin and hair moisturizing. Natural, chemical-free, and sourced locally.", "price": 1000, "category": "Beauty"},
        {"name": "Herbal Tea Blend (20 bags)", "description": "Organic herbal tea with moringa, ginger, and lemon grass. Just add hot water — supports immunity and digestion.", "price": 2000, "category": "Health"},
        {"name": "Tiger Nut Milk (500ml)", "description": "Freshly made tiger nut (ofio) milk, naturally sweet and dairy-free. Rich in fiber and essential minerals.", "price": 1200, "category": "Health"},
    ],
    "Jummychi Trendsetters": [
        {"name": "Egg Shawarma", "description": "Freshly made shawarma with boiled egg, vegetables, coleslaw and special garlic sauce wrapped in soft pita bread.", "price": 2500, "category": "Food"},
        {"name": "Stir Fry Noodles and Egg", "description": "Spicy stir fried noodles with mixed vegetables and egg. Made fresh on order — quick, tasty, and filling.", "price": 1500, "category": "Food"},
        {"name": "Zobo Drink (500ml)", "description": "Chilled homemade zobo drink with ginger and pineapple flavour. Refreshing and made fresh daily.", "price": 500, "category": "Drinks"},
        {"name": "Waffles with Syrup", "description": "Freshly made crispy Belgian waffles served with maple syrup and powdered sugar. Sweet, light and satisfying.", "price": 2000, "category": "Food"},
        {"name": "Kunu Drink (500ml)", "description": "Refreshing homemade kunu aya (tiger nut) drink, lightly spiced and chilled. A traditional Northern Nigerian favorite.", "price": 500, "category": "Drinks"},
        {"name": "Fried Sausage Add-on", "description": "One piece of fried sausage to pair alongside any shawarma or meal. Crispy, juicy, and delicious.", "price": 300, "category": "Food"},
    ],
    "Nma's Place": [
        {"name": "Custom Birthday Cake (Small)", "description": "Small celebration cake for 5-10 persons, customized with name and design. Available in chocolate and vanilla. Order 24hrs ahead.", "price": 8000, "category": "Bakery"},
        {"name": "Caramel Popcorn (Large)", "description": "Sweet and buttery caramel popcorn in a large bucket. Perfect for movie nights, hangouts, or just snacking.", "price": 1000, "category": "Snacks"},
        {"name": "Sausage Rolls (4 pieces)", "description": "Freshly baked flaky pastry sausage rolls filled with seasoned minced meat. Warm, crispy, and satisfying.", "price": 1200, "category": "Snacks"},
        {"name": "Fresh Fruit Juice (500ml)", "description": "Freshly squeezed juice available in orange, watermelon, and mixed fruit. No artificial sweeteners — pure and natural.", "price": 1000, "category": "Drinks"},
        {"name": "Meat Pie (2 pieces)", "description": "Freshly baked golden pastry pies filled with seasoned minced beef, carrots, and potatoes. A Nigerian classic.", "price": 1000, "category": "Snacks"},
    ],
    "Big Farm Shop": [
        {"name": "Sweet Bananas (3 pieces)", "description": "Fresh ripe bananas, naturally sweet and energy-rich. A great grab-and-go snack between classes.", "price": 300, "category": "Snacks"},
        {"name": "Sweet Oranges (3 pieces)", "description": "Juicy and sweet oranges packed with Vitamin C. Freshly sourced and perfect for a healthy campus snack.", "price": 400, "category": "Snacks"},
        {"name": "Sliced Watermelon (pack)", "description": "Freshly cut chilled watermelon slices packed and ready to eat. Sweet, hydrating, and perfect for hot days on campus.", "price": 500, "category": "Snacks"},
        {"name": "Mixed Fruit Cup", "description": "Freshly prepared cup of mixed fruits — banana, watermelon, pineapple, and pawpaw. A healthy and refreshing snack.", "price": 700, "category": "Snacks"},
        {"name": "Pineapple Slices (pack)", "description": "Sweet and tangy freshly sliced pineapple, packed and chilled. Ready to eat — no prep needed.", "price": 500, "category": "Snacks"},
    ],
    "BU Bookshop": [
        {"name": "A4 Printing Paper (Ream)", "description": "500-sheet ream of 80gsm A4 white printing paper. Suitable for assignments, printing, and photocopying.", "price": 4500, "category": "Stationery"},
        {"name": "Scientific Calculator", "description": "Casio FX-991EX scientific calculator approved for Babcock University examinations. Essential for science and math courses.", "price": 8500, "category": "Stationery"},
        {"name": "Spiral Notebook (200 pages)", "description": "Durable spiral-bound notebook with 200 pages of ruled paper. Available in A4 and A5 sizes.", "price": 1200, "category": "Stationery"},
        {"name": "Ballpoint Pen Pack (10)", "description": "Pack of 10 blue and black Bic ballpoint pens. Smooth writing, reliable, and long-lasting.", "price": 800, "category": "Stationery"},
        {"name": "File Folder (10 pack)", "description": "Cardboard file folders for organizing course handouts, assignments, and important documents.", "price": 1500, "category": "Stationery"},
    ],
    "Mima Ventures": [
        {"name": "Document Printing (per page)", "description": "Black and white printing service at affordable rates. Bring your USB drive or share via WhatsApp. Color printing also available.", "price": 50, "category": "Services"},
        {"name": "Lamination Service", "description": "Professional lamination for certificates, ID cards, and important documents. Available in A4 and A5 sizes.", "price": 300, "category": "Services"},
        {"name": "POS Cash Withdrawal", "description": "Convenient POS cash withdrawal service. Quick, reliable, and available during shop hours. Standard bank charges apply.", "price": 100, "category": "Services"},
        {"name": "Online Registration Assistance", "description": "Assisted school portal registration, course registration, and online form filling. Experienced staff for all BU portals.", "price": 500, "category": "Services"},
        {"name": "MTN Airtime Top-up", "description": "Instant airtime recharge for MTN, Airtel, Glo, and 9mobile. Any amount from N100. Fast and reliable.", "price": 100, "category": "Services"},
    ],
    "ANDY Best": [
        {"name": "Bathing Soap Pack (3)", "description": "Pack of 3 Dettol or Lux bathing soaps. Antibacterial protection for daily hygiene on campus.", "price": 1200, "category": "Provisions"},
        {"name": "Toothpaste (Closeup 150g)", "description": "Closeup deep action toothpaste with fluoride protection. Fresh breath and cavity protection for daily use.", "price": 800, "category": "Provisions"},
        {"name": "Toilet Roll (12 pack)", "description": "Soft and strong 2-ply toilet tissue, pack of 12 rolls. Essential for every hostel room.", "price": 2500, "category": "Provisions"},
        {"name": "Body Spray (Lynx/Axe)", "description": "Long-lasting body spray deodorant. Available in various scents. Keeps you fresh all day.", "price": 1500, "category": "Provisions"},
        {"name": "Noodles and Sardine Combo", "description": "Indomie or Kodak noodles pack with a tin of sardine — a classic hostel meal. Easy to make with your electric kettle.", "price": 1200, "category": "Provisions"},
    ],
}

def seed_products():
    with Session(engine) as session:
        for vendor_name, products in VENDOR_PRODUCTS.items():
            vendor = session.exec(
                select(Vendor).where(Vendor.shop_name == vendor_name)
            ).first()

            if not vendor:
                print(f"Vendor not found: {vendor_name} -- skipping")
                continue

            added = 0
            for p in products:
                existing = session.exec(
                    select(Product).where(
                        Product.vendor_id == vendor.id,
                        Product.name == p["name"]
                    )
                ).first()

                if existing:
                    print(f"  Skipping existing: {p['name']}")
                    continue

                product = Product(
                    id=generate_uuid(),
                    vendor_id=vendor.id,
                    name=p["name"],
                    description=p["description"],
                    price=p["price"],
                    category=p["category"],
                    is_available=True,
                    stock_quantity=100
                )
                session.add(product)
                added += 1

            session.commit()
            print(f"OK {vendor_name}: {added} products added")

    print("\nProduct seeding complete!")

if __name__ == "__main__":
    create_db()
    seed_products()