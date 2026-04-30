from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    ready = "ready"
    delivered = "delivered"
    cancelled = "cancelled"

class DeliveryType(str, Enum):
    pickup = "pickup"
    delivery = "delivery"

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    vendor_id: int = Field(foreign_key="vendor.id")
    total_amount: float
    delivery_type: DeliveryType
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None
    status: OrderStatus = OrderStatus.pending
    payment_reference: Optional[str] = None
    is_paid: bool = False
    customer_name: str = Field(default="")
    created_at: str = Field(default="")