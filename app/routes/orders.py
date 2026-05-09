from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.order import Order, OrderStatus, DeliveryType
from app.models.delivery import Delivery, HOSTELS
from app.models.user import User
from app.models.vendor import Vendor
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderCreate(BaseModel):
    vendor_id: str
    total_amount: float
    delivery_type: DeliveryType
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None
    delivery_address: Optional[str] = None  # for non-hostel delivery

@router.post("/")
def create_order(
    data: OrderCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Add service fee for all orders
    service_fee = 100.0
    data.total_amount += service_fee

    # Add delivery fee if delivery
    if data.delivery_type == DeliveryType.delivery:
        if not data.hostel_name and not data.delivery_address:
            raise HTTPException(
                status_code=400,
                detail="Please provide hostel name or delivery address"
            )
        if data.hostel_name and data.hostel_name not in HOSTELS:
            raise HTTPException(status_code=400, detail="Invalid hostel name")
        data.total_amount += 200.0

    order = Order(
        user_id=current_user.id,
        vendor_id=data.vendor_id,
        total_amount=data.total_amount,
        delivery_type=data.delivery_type,
        hostel_name=data.hostel_name,
        room_number=data.room_number,
        created_at=str(datetime.utcnow())
    )
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

    return {
        "id": order.id,
        "vendor_id": order.vendor_id,
        "total_amount": order.total_amount,
        "delivery_type": order.delivery_type,
        "hostel_name": order.hostel_name,
        "room_number": order.room_number,
        "status": order.status,
        "is_paid": order.is_paid,
        "customer_phone": current_user.phone,
        "service_fee": 100,
        "delivery_fee": 200 if order.delivery_type == DeliveryType.delivery else 0,
        "created_at": order.created_at
    }

@router.get("/hostels")
def get_hostels():
    return {"hostels": HOSTELS}

@router.get("/my-orders")
def get_my_orders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    orders = session.exec(
        select(Order).where(Order.user_id == current_user.id)
    ).all()
    return orders

@router.get("/vendor-orders")
def get_vendor_orders(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    orders = session.exec(
        select(Order).where(Order.vendor_id == vendor.id)
    ).all()
    return orders

@router.patch("/{order_id}/status")
def update_order_status(
    order_id: str,
    status: OrderStatus,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    session.commit()
    return {"message": f"Order status updated to {status}"}