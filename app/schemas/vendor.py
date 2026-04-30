from pydantic import BaseModel
from typing import Optional

class VendorCreate(BaseModel):
    owner_id: int
    shop_name: str
    description: str
    location: str
    category: str
    image_url: Optional[str] = None

class VendorResponse(BaseModel):
    id: int
    shop_name: str
    description: str
    location: str
    category: str
    image_url: Optional[str] = None
    is_approved: bool

    class Config:
        from_attributes = True