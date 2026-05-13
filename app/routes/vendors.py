from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.vendor import Vendor
from app.models.user import User
from app.core.dependencies import get_current_user, get_admin_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/vendors", tags=["Vendors"])


class VendorUpdate(BaseModel):
    shop_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


@router.get("/")
def get_all_vendors(session: Session = Depends(get_session)):
    """Get all approved vendors (public)."""
    vendors = session.exec(select(Vendor).where(Vendor.is_approved == True)).all()
    return vendors


@router.get("/admin/all")
def get_all_vendors_admin(
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    """Get all vendors for admin management."""
    vendors = session.exec(select(Vendor)).all()
    return vendors


@router.get("/me")
def get_my_vendor(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get the vendor profile for the currently logged-in user."""
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor

@router.get("/{vendor_id}")
def get_vendor(vendor_id: str, session: Session = Depends(get_session)):
    """Get a single vendor by ID (public)."""
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.patch("/{vendor_id}")
def update_vendor(
    vendor_id: str,
    data: VendorUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update vendor details. Only the vendor owner can update."""
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if vendor.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your vendor shop")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vendor, key, value)
    session.commit()
    session.refresh(vendor)
    return vendor


@router.patch("/{vendor_id}/approve")
def approve_vendor(
    vendor_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_admin_user)
):
    """Approve a vendor. Admin only."""
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = True
    session.commit()
    return {"message": f"{vendor.shop_name} approved successfully"}

@router.post("/subscribe/featured")
async def subscribe_featured(
    tier: str,  # "basic" = ₦5,000/month, "premium" = ₦10,000/month
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    prices = {"basic": 5000, "premium": 10000}
    if tier not in prices:
        raise HTTPException(status_code=400, detail="Invalid tier. Choose 'basic' or 'premium'")
    
    # Initialize Paystack payment for subscription
    import httpx, os
    from dotenv import load_dotenv
    load_dotenv()
    
    headers = {"Authorization": f"Bearer {os.getenv('PAYSTACK_SECRET_KEY')}"}
    payload = {
        "amount": prices[tier] * 100,
        "email": current_user.email,
        "reference": f"featured_{vendor.id[:8]}_{tier}",
        "callback_url": "https://quickmartapp.com.ng/vendor/featured/success",
        "metadata": {
            "vendor_id": vendor.id,
            "tier": tier
        }
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.paystack.co/transaction/initialize",
            json=payload,
            headers=headers
        )
    data = res.json()
    if data["status"]:
        return {
            "payment_url": data["data"]["authorization_url"],
            "reference": data["data"]["reference"],
            "tier": tier,
            "amount": prices[tier],
            "message": f"Complete payment to get featured as {tier} vendor for 30 days"
        }
    raise HTTPException(status_code=400, detail="Subscription initialization failed")

@router.post("/subscribe/featured/verify/{reference}")
async def verify_featured_subscription(
    reference: str,
    session: Session = Depends(get_session)
):
    import httpx, os
    from datetime import datetime, timedelta
    
    headers = {"Authorization": f"Bearer {os.getenv('PAYSTACK_SECRET_KEY')}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.paystack.co/transaction/verify/{reference}",
            headers=headers
        )
    data = res.json()
    
    if data["status"] and data["data"]["status"] == "success":
        metadata = data["data"]["metadata"]
        vendor_id = metadata.get("vendor_id")
        tier = metadata.get("tier")
        
        vendor = session.get(Vendor, vendor_id)
        if vendor:
            vendor.is_featured = True
            vendor.featured_tier = tier
            vendor.featured_until = str(datetime.utcnow() + timedelta(days=30))
            session.commit()
        return {"message": f"Congratulations! Your shop is now featured as {tier} for 30 days"}
    raise HTTPException(status_code=400, detail="Subscription verification failed")

@router.get("/featured")
def get_featured_vendors(session: Session = Depends(get_session)):
    from datetime import datetime
    vendors = session.exec(
        select(Vendor).where(
            Vendor.is_featured == True,
            Vendor.is_approved == True
        )
    ).all()
    # Filter out expired featured subscriptions
    active = []
    for v in vendors:
        if v.featured_until:
            if datetime.fromisoformat(v.featured_until) > datetime.utcnow():
                active.append(v)
            else:
                # Auto-expire
                v.is_featured = False
                session.commit()
    return active