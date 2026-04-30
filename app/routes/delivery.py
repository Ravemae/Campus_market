from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.delivery import Delivery, HOSTELS

router = APIRouter(prefix="/delivery", tags=["Delivery"])

@router.get("/hostels")
def get_all_hostels():
    return {"hostels": HOSTELS}

@router.get("/{order_id}")
def get_delivery_by_order(order_id: int, session: Session = Depends(get_session)):
    delivery = session.exec(
        select(Delivery).where(Delivery.order_id == order_id)
    ).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery

@router.patch("/{delivery_id}/delivered")
def mark_as_delivered(delivery_id: int, session: Session = Depends(get_session)):
    delivery = session.get(Delivery, delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    delivery.is_delivered = True
    session.commit()
    return {"message": "Delivery marked as completed"}