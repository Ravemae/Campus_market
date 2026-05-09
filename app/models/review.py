from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Review(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    vendor_id: str = Field(foreign_key="vendor.id")
    order_id: str = Field(foreign_key="order.id")
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: str = Field(default_factory=lambda: str(datetime.utcnow()))
