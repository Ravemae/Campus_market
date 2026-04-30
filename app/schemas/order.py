from pydantic import BaseModel
from typing import Optional
from app.models.order import DeliveryType, OrderStatus

class OrderCreate(BaseModel):
    user_id: int
    vendor_id: int
    total_amount: float
    delivery_type: DeliveryType
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    vendor_id: int
    total_amount: float
    delivery_type: DeliveryType
    status: OrderStatus
    is_paid: bool

    class Config:
        from_attributes = True