from sqlmodel import Session
from app.database import engine, create_db
from app.models.user import User, UserRole
from app.models.vendor import Vendor
from app.core.security import hash_password

def seed():
    create_db()
    
    vendors_data = [
        {
            "full_name": "Ayolayo Admin",
            "email": "ayolayo@campusmarket.com",
            "phone": "08011111111",
            "shop_name": "Ayolayo Enterprises",
            "description": "Slides, shoes, make-up kits, clothes, birthday packages",
            "location": "BUSA Building",
            "category": "Fashion & Accessories"
        },
        {
            "full_name": "Lilly Foods Admin",
            "email": "lillyfoods@campusmarket.com",
            "phone": "08022222222",
            "shop_name": "The Lilly Foods and Bakeries",
            "description": "Foods, breads, cakes and snacks",
            "location": "BUSA Building",
            "category": "Food & Bakery"
        },
        {
            "full_name": "BIG Store Admin",
            "email": "bigstore@campusmarket.com",
            "phone": "08033333333",
            "shop_name": "B.I.G Store",
            "description": "Golden Morn, breads, juices, water",
            "location": "BUSA Building",
            "category": "Provisions & Drinks"
        },
        {
            "full_name": "Big Meals Admin",
            "email": "bigmeals@campusmarket.com",
            "phone": "08044444444",
            "shop_name": "Big Meals",
            "description": "Foods, snacks and minerals",
            "location": "BUSA Building",
            "category": "Food"
        },
        {
            "full_name": "Helena Admin",
            "email": "helena@campusmarket.com",
            "phone": "08055555555",
            "shop_name": "Helena Ventures",
            "description": "Clothes, skin care, bags, provisions",
            "location": "BUSA Building",
            "category": "Fashion & Skincare"
        },
        {
            "full_name": "Gods Favor Admin",
            "email": "godsfavor@campusmarket.com",
            "phone": "08066666666",
            "shop_name": "God's Favor Limited",
            "description": "Rice, doughnuts, spaghetti, chin chin, moi moi, zobo",
            "location": "BUSA Building",
            "category": "Food"
        },
        {
            "full_name": "WholeU Admin",
            "email": "wholeu@campusmarket.com",
            "phone": "08077777777",
            "shop_name": "WholeU",
            "description": "Organic and natural foods, healthy and beauty products",
            "location": "BUSA Building",
            "category": "Health & Beauty"
        },
        {
            "full_name": "Jummychi Admin",
            "email": "jummychi2@campusmarket.com",
            "phone": "08088888888",
            "shop_name": "Jummychi Trendsetters",
            "description": "Waffles, mishia, shawarma, kunu, zobo, stir fry spaghetti and noodles",
            "location": "BUSA Building",
            "category": "Food & Snacks"
        },
        {
            "full_name": "Nmas Place Admin",
            "email": "nmasplace@campusmarket.com",
            "phone": "08099999999",
            "shop_name": "Nma's Place",
            "description": "Cakes, popcorn, sausage rolls, drinks and fresh juice",
            "location": "BUSA Building",
            "category": "Snacks & Drinks"
        },
        {
            "full_name": "Big Farm Admin",
            "email": "bigfarm@campusmarket.com",
            "phone": "08010101010",
            "shop_name": "Big Farm Shop",
            "description": "Fresh veggies and fruits, apples, mangoes, coconut and red oils",
            "location": "BUSA Building",
            "category": "Fresh Produce"
        },
        {
            "full_name": "BU Bookshop Admin",
            "email": "bubookshop@campusmarket.com",
            "phone": "08012121212",
            "shop_name": "BU Bookshop",
            "description": "Textbooks, novels, newspapers, compendiums, writing materials",
            "location": "BUSA Building",
            "category": "Books & Stationery"
        },
        {
            "full_name": "Mima Ventures Admin",
            "email": "mima@campusmarket.com",
            "phone": "08013131313",
            "shop_name": "Mima Ventures",
            "description": "POS, online registration, research works, bill payments, airtime",
            "location": "BUSA Building",
            "category": "Services"
        },
    ]

    with Session(engine) as session:
        from sqlmodel import select
        # Create Admin User
        admin_email = "admin@campusmarket.com"
        existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
        if not existing_admin:
            admin = User(
                full_name="System Administrator",
                email=admin_email,
                phone="08000000000",
                password_hash=hash_password("Admin@123"),
                role=UserRole.admin,
                created_at=str(__import__('datetime').datetime.utcnow())
            )
            session.add(admin)
            session.commit()
            print("Created Admin: admin@campusmarket.com")

        for v in vendors_data:
            # Check if vendor already exists
            from sqlmodel import select
            existing = session.exec(
                select(User).where(User.email == v["email"])
            ).first()
            if existing:
                print(f"Skipping {v['shop_name']} - already exists")
                continue

            # Create vendor user account
            user = User(
                full_name=v["full_name"],
                email=v["email"],
                phone=v["phone"],
                password_hash=hash_password("Vendor@123"),
                role=UserRole.vendor,
                created_at=str(__import__('datetime').datetime.utcnow())
            )
            session.add(user)
            session.commit()
            session.refresh(user)

            # Create vendor shop
            vendor = Vendor(
                owner_id=user.id,
                shop_name=v["shop_name"],
                description=v["description"],
                location=v["location"],
                category=v["category"],
                is_approved=True  # Auto approve seed data
            )
            session.add(vendor)
            session.commit()
            print(f"Created: {v['shop_name']}")

    print("\nSeeding complete! All vendors created.")

if __name__ == "__main__":
    seed()
