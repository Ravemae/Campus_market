from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.vendor import Vendor
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/vendors", tags=["Vendors"])

class VendorCreate(BaseModel):
    owner_id: int
    shop_name: str
    description: str
    location: str
    category: str
    image_url: Optional[str] = None

@router.post("/register")
def register_vendor(data: VendorCreate, session: Session = Depends(get_session)):
    vendor = Vendor(**data.dict())
    session.add(vendor)
    session.commit()
    session.refresh(vendor)
    return vendor

@router.get("/")
def get_all_vendors(session: Session = Depends(get_session)):
    vendors = session.exec(select(Vendor).where(Vendor.is_approved == True)).all()
    return vendors

@router.get("/{vendor_id}")
def get_vendor(vendor_id: int, session: Session = Depends(get_session)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.patch("/{vendor_id}/approve")
def approve_vendor(vendor_id: int, session: Session = Depends(get_session)):
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = True
    session.commit()
    return {"message": f"{vendor.shop_name} approved successfully"}