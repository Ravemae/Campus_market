from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta

from app.database import get_session
from app.models.user import User, UserRole
from app.models.vendor import Vendor
from app.models.order import Order
from app.models.product import Product
from app.core.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


# =========================
# USERS
# =========================
@router.get("/users")
def get_all_users(
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    users = session.exec(select(User)).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    session.commit()

    return {"message": f"{user.full_name} deactivated successfully"}


@router.patch("/users/{user_id}/activate")
def activate_user(
    user_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    session.commit()

    return {"message": f"{user.full_name} activated successfully"}


# =========================
# VENDORS
# =========================
@router.get("/vendors")
def get_all_vendors(
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    return session.exec(select(Vendor)).all()


@router.patch("/vendors/{vendor_id}/approve")
def approve_vendor(
    vendor_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.is_approved = True
    session.commit()

    return {"message": f"{vendor.shop_name} approved"}


@router.patch("/vendors/{vendor_id}/reject")
def reject_vendor(
    vendor_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.is_approved = False
    vendor.is_active = False
    session.commit()

    return {"message": f"{vendor.shop_name} rejected"}


# =========================
# ORDERS
# =========================
@router.get("/orders")
def get_all_orders(
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    return session.exec(select(Order)).all()


# =========================
# DASHBOARD
# =========================
@router.get("/dashboard")
def get_dashboard(
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    users = session.exec(select(User)).all()
    vendors = session.exec(select(Vendor)).all()
    orders = session.exec(select(Order)).all()

    total_users = len([u for u in users if u.role == UserRole.user])
    total_vendors = len(vendors)
    pending_vendors = len([v for v in vendors if not v.is_approved])

    total_revenue = sum(o.total_amount for o in orders if o.is_paid)

    # Category breakdown
    category_map = {}
    for v in vendors:
        category_map[v.category] = category_map.get(v.category, 0) + 1

    category_breakdown = [
        {"name": k, "value": v} for k, v in category_map.items()
    ]

    # Last 7 days stats
    daily_stats = []
    for i in range(6, -1, -1):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")

        day_orders = [
            o for o in orders
            if o.created_at.startswith(date)
        ]

        daily_stats.append({
            "date": date,
            "orders": len(day_orders),
            "revenue": sum(o.total_amount for o in day_orders if o.is_paid)
        })

    return {
        "stats": {
            "total_users": total_users,
            "total_vendors": total_vendors,
            "pending_vendors": pending_vendors,
            "total_orders": len(orders),
            "total_revenue": total_revenue
        },
        "category_breakdown": category_breakdown,
        "daily_trends": daily_stats
    }


# =========================
# SEEDING
# =========================
def seed_products_logic(session: Session):
    """Seed sample products for all existing vendors - helper function"""
    
    vendors = session.exec(select(Vendor)).all()
    if not vendors:
        return "No vendors found. Seed vendors first."
    
    # Product templates for each vendor category
    product_templates = {
        "Fashion & Accessories": [
            {"name": "Nike Air Max", "description": "Comfortable running shoes", "price": 25000, "category": "Shoes", "stock_quantity": 10},
            {"name": "Leather Wallet", "description": "Genuine leather wallet", "price": 5000, "category": "Accessories", "stock_quantity": 25},
            {"name": "Designer Sunglasses", "description": "UV protection sunglasses", "price": 8000, "category": "Accessories", "stock_quantity": 15},
            {"name": "Cotton T-Shirt", "description": "Comfortable cotton t-shirt", "price": 3500, "category": "Clothing", "stock_quantity": 30},
        ],
        "Food & Bakery": [
            {"name": "Fresh Bread Loaf", "description": "Freshly baked bread", "price": 1200, "category": "Bakery", "stock_quantity": 20},
            {"name": "Chocolate Cake", "description": "Rich chocolate cake", "price": 4500, "category": "Bakery", "stock_quantity": 8},
            {"name": "Butter Cookies", "description": "Homemade butter cookies", "price": 800, "category": "Snacks", "stock_quantity": 50},
            {"name": "Croissant", "description": "Buttery French croissant", "price": 600, "category": "Bakery", "stock_quantity": 15},
        ],
        "Provisions & Drinks": [
            {"name": "Golden Morn", "description": "Cereal breakfast", "price": 1800, "category": "Cereals", "stock_quantity": 40},
            {"name": "Orange Juice", "description": "Fresh orange juice", "price": 500, "category": "Beverages", "stock_quantity": 60},
            {"name": "Bottled Water", "description": "Pure drinking water", "price": 200, "category": "Beverages", "stock_quantity": 100},
            {"name": "Corn Flakes", "description": "Crispy corn flakes", "price": 2200, "category": "Cereals", "stock_quantity": 25},
        ],
        "Food": [
            {"name": "Jollof Rice", "description": "Nigerian jollof rice with chicken", "price": 1500, "category": "Meals", "stock_quantity": 12},
            {"name": "Fried Rice", "description": "Vegetable fried rice", "price": 1200, "category": "Meals", "stock_quantity": 15},
            {"name": "Chicken Shawarma", "description": "Middle Eastern chicken wrap", "price": 1800, "category": "Fast Food", "stock_quantity": 20},
            {"name": "Coca Cola", "description": "Cold soft drink", "price": 300, "category": "Beverages", "stock_quantity": 80},
        ],
        "Fashion & Skincare": [
            {"name": "Face Cream", "description": "Moisturizing face cream", "price": 2500, "category": "Skincare", "stock_quantity": 20},
            {"name": "Leather Handbag", "description": "Elegant leather handbag", "price": 12000, "category": "Bags", "stock_quantity": 8},
            {"name": "Lipstick", "description": "Long-lasting lipstick", "price": 1500, "category": "Cosmetics", "stock_quantity": 35},
            {"name": "Body Lotion", "description": "Hydrating body lotion", "price": 1800, "category": "Skincare", "stock_quantity": 25},
        ],
        "Health & Beauty": [
            {"name": "Organic Honey", "description": "Pure organic honey", "price": 3500, "category": "Natural Foods", "stock_quantity": 15},
            {"name": "Green Tea", "description": "Organic green tea leaves", "price": 1200, "category": "Beverages", "stock_quantity": 30},
            {"name": "Almonds", "description": "Raw almonds", "price": 4000, "category": "Nuts", "stock_quantity": 20},
            {"name": "Herbal Soap", "description": "Natural herbal soap", "price": 800, "category": "Personal Care", "stock_quantity": 40},
        ],
        "Food & Snacks": [
            {"name": "Belgian Waffles", "description": "Fresh Belgian waffles", "price": 800, "category": "Desserts", "stock_quantity": 18},
            {"name": "Chicken Shawarma", "description": "Grilled chicken shawarma", "price": 1500, "category": "Fast Food", "stock_quantity": 22},
            {"name": "Kunu Drink", "description": "Traditional millet drink", "price": 300, "category": "Beverages", "stock_quantity": 35},
            {"name": "Stir Fry Noodles", "description": "Vegetable stir fry noodles", "price": 1000, "category": "Meals", "stock_quantity": 16},
        ],
        "Snacks & Drinks": [
            {"name": "Birthday Cake", "description": "Custom birthday cake", "price": 8000, "category": "Bakery", "stock_quantity": 5},
            {"name": "Caramel Popcorn", "description": "Sweet caramel popcorn", "price": 600, "category": "Snacks", "stock_quantity": 40},
            {"name": "Sausage Rolls", "description": "Baked sausage rolls", "price": 400, "category": "Snacks", "stock_quantity": 30},
            {"name": "Fresh Orange Juice", "description": "Freshly squeezed juice", "price": 600, "category": "Beverages", "stock_quantity": 25},
        ],
        "Fresh Produce": [
            {"name": "Fresh Apples", "description": "Red delicious apples", "price": 500, "category": "Fruits", "stock_quantity": 50},
            {"name": "Ripe Mangoes", "description": "Sweet mangoes", "price": 300, "category": "Fruits", "stock_quantity": 40},
            {"name": "Coconut", "description": "Fresh coconut", "price": 400, "category": "Fruits", "stock_quantity": 30},
            {"name": "Red Palm Oil", "description": "Pure red palm oil", "price": 1500, "category": "Oils", "stock_quantity": 20},
        ],
        "Books & Stationery": [
            {"name": "Mathematics Textbook", "description": "University level math textbook", "price": 5000, "category": "Textbooks", "stock_quantity": 8},
            {"name": "Notebooks", "description": "Pack of 5 notebooks", "price": 1200, "category": "Stationery", "stock_quantity": 25},
            {"name": "Pens", "description": "Pack of blue ballpoint pens", "price": 300, "category": "Stationery", "stock_quantity": 60},
            {"name": "Dictionary", "description": "English dictionary", "price": 2500, "category": "Reference", "stock_quantity": 12},
        ],
        "Services": [
            {"name": "Airtime Recharge", "description": "Mobile phone airtime", "price": 100, "category": "Telecom", "stock_quantity": 1000},
            {"name": "Data Bundle", "description": "Mobile data bundle", "price": 500, "category": "Telecom", "stock_quantity": 500},
            {"name": "Bill Payment", "description": "Utility bill payment service", "price": 0, "category": "Services", "stock_quantity": 999},
            {"name": "Form Printing", "description": "Document printing service", "price": 200, "category": "Services", "stock_quantity": 999},
        ],
    }
    
    products_created = 0
    
    for vendor in vendors:
        templates = product_templates.get(vendor.category, [
            {"name": f"Sample Product 1", "description": "Sample product", "price": 1000, "category": "General", "stock_quantity": 10},
            {"name": f"Sample Product 2", "description": "Sample product", "price": 2000, "category": "General", "stock_quantity": 5},
        ])
        
        for template in templates:
            product = Product(
                vendor_id=vendor.id,
                name=template["name"],
                description=template["description"],
                price=template["price"],
                category=template["category"],
                stock_quantity=template["stock_quantity"],
                is_available=True
            )
            session.add(product)
            products_created += 1
    
    session.commit()
    
    return f"Successfully created {products_created} products for {len(vendors)} vendors"


@router.post("/seed-products")
def seed_products(
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    """Seed sample products for all existing vendors"""
    
    # Check if products already exist
    existing_products = session.exec(select(Product)).all()
    if existing_products:
        return {"message": f"Products already exist ({len(existing_products)} products found)"}
    
    result = seed_products_logic(session)
    return {"message": result}