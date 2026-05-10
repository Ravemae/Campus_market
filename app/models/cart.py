from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class CartItem(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    product_id: str = Field(foreign_key="product.id")
    quantity: int = 1
    added_at: str = Field(default_factory=lambda: str(datetime.utcnow()))
