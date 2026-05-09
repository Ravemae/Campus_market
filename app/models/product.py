from sqlmodel import SQLModel, Field
from typing import Optional
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Product(SQLModel, table=True):
    id: Optional[str] = Field(
        default_factory=generate_uuid,
        primary_key=True
    )
    vendor_id: str = Field(foreign_key="vendor.id")
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: str
    is_available: bool = True
    stock_quantity: int = 0
    updated_at: Optional[str] = None