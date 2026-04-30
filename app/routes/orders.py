from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.order import Order, OrderStatus, DeliveryType
from app.models.delivery import Delivery, HOSTELS
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderCreate(BaseModel):
    user_id: int
    vendor_id: int
    total_amount: float
    delivery_type: DeliveryType
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None

@router.post("/")
def create_order(data: OrderCreate, session: Session = Depends(get_session)):
    if data.delivery_type == DeliveryType.delivery:
        if not data.hostel_name or not data.room_number:
            raise HTTPException(status_code=400, detail="Hostel name and room number required for delivery")
        if data.hostel_name not in HOSTELS:
            raise HTTPException(status_code=400, detail="Invalid hostel name")
        data.total_amount += 200.0
    order = Order(**data.dict())
    session.add(order)
    session.commit()
    session.refresh(order)
    if data.delivery_type == DeliveryType.delivery:
        delivery = Delivery(
            order_id=order.id,
            hostel_name=data.hostel_name,
            room_number=data.room_number,
            delivery_fee=200.0
        )
        session.add(delivery)
        session.commit()
    return order

@router.get("/hostels")
def get_hostels():
    return {"hostels": HOSTELS}

@router.get("/user/{user_id}")
def get_user_orders(user_id: int, session: Session = Depends(get_session)):
    orders = session.exec(select(Order).where(Order.user_id == user_id)).all()
    return orders

@router.get("/vendor/{vendor_id}")
def get_vendor_orders(vendor_id: int, session: Session = Depends(get_session)):
    orders = session.exec(select(Order).where(Order.vendor_id == vendor_id)).all()
    return orders

@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status: OrderStatus, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    session.commit()
    return {"message": f"Order status updated to {status}"}