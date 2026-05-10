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