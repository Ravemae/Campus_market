from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    message: str
    type: str = "general"  # general, order, payment, review
    is_read: bool = False
    created_at: str = Field(default_factory=lambda: str(datetime.utcnow()))
