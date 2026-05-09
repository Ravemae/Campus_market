from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
import uuid

def generate_uuid():
    return str(uuid.uuid4())

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
    id: Optional[str] = Field(
        default_factory=generate_uuid,
        primary_key=True
    )
    user_id: str = Field(foreign_key="user.id")
    vendor_id: str = Field(foreign_key="vendor.id")
    total_amount: float
    delivery_type: DeliveryType
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None
    status: OrderStatus = OrderStatus.pending
    payment_reference: Optional[str] = None
    is_paid: bool = False
    created_at: str = Field(default="")