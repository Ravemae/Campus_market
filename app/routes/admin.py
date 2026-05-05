from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User, UserRole
from app.models.vendor import Vendor
from app.models.order import Order

router = APIRouter(prefix="/admin", tags=["Admin"])

# Get all users
@router.get("/users")
def get_all_users(session: Session = Depends(get_session)):
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

# Get all vendors (including unapproved)
@router.get("/vendors")
def get_all_vendors(session: Session = Depends(get_session)):
    vendors = session.exec(select(Vendor)).all()
    return vendors

# Approve a vendor
@router.patch("/vendors/{vendor_id}/approve")
def approve_vendor(vendor_id: int, session: Session = Depends(get_session)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = True
    session.commit()
    return {"message": f"{vendor.shop_name} has been approved"}

# Reject/deactivate a vendor
@router.patch("/vendors/{vendor_id}/reject")
def reject_vendor(vendor_id: int, session: Session = Depends(get_session)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = False
    vendor.is_active = False
    session.commit()
    return {"message": f"{vendor.shop_name} has been rejected"}

# Deactivate a user
@router.patch("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    session.commit()
    return {"message": f"{user.full_name} has been deactivated"}

# Reactivate a user
@router.patch("/users/{user_id}/activate")
def activate_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    session.commit()
    return {"message": f"{user.full_name} has been activated"}

# Get all orders
@router.get("/orders")
def get_all_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(Order)).all()
    return orders

# Get dashboard summary
@router.get("/dashboard")
def get_dashboard(session: Session = Depends(get_session)):
    total_users = len(session.exec(select(User).where(User.role == UserRole.user)).all())
    total_vendors = len(session.exec(select(Vendor)).all())
    pending_vendors = len(session.exec(select(Vendor).where(Vendor.is_approved == False)).all())
    total_orders = len(session.exec(select(Order)).all())
    paid_orders = len(session.exec(select(Order).where(Order.is_paid == True)).all())
    return {
        "total_users": total_users,
        "total_vendors": total_vendors,
        "pending_vendor_approvals": pending_vendors,
        "total_orders": total_orders,
        "paid_orders": paid_orders
    }