from sqlmodel import SQLModel, Field
from typing import Optional


class OrderItem(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    order_id: str = Field(foreign_key="order.id")
    product_id: str = Field(foreign_key="product.id")
    quantity: int
    unit_price: float
    subtotal: float
