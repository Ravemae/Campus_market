from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta

from app.database import get_session
from app.models.user import User, UserRole
from app.models.vendor import Vendor
from app.models.order import Order
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