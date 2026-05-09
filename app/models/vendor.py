from sqlmodel import SQLModel, Field
from typing import Optional
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Vendor(SQLModel, table=True):
    id: Optional[str] = Field(
        default_factory=generate_uuid,
        primary_key=True
    )
    owner_id: int = Field(foreign_key="user.id")
    shop_name: str
    description: str
    location: str
    category: str
    image_url: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False