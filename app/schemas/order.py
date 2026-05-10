from pydantic import BaseModel
from typing import Optional, List
from app.models.order import DeliveryType, OrderStatus
from app.schemas.order_item import OrderItemCreate, OrderItemResponse


class OrderCreate(BaseModel):
    vendor_id: str
    total_amount: float
    delivery_type: DeliveryType
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None
    delivery_address: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    vendor_id: str
    total_amount: float
    delivery_type: DeliveryType
    status: OrderStatus
    is_paid: bool
    customer_name: str = ""
    created_at: str = ""
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True