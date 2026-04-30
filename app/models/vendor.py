from sqlmodel import SQLModel, Field
from typing import Optional

class Vendor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    shop_name: str
    description: str
    location: str
    category: str
    image_url: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False