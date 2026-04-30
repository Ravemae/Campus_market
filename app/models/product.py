from sqlmodel import SQLModel, Field
from typing import Optional

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vendor_id: int = Field(foreign_key="vendor.id")
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: str
    is_available: bool = True