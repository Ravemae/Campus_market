from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreate(BaseModel):
    vendor_id: str
    order_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    vendor_id: str
    order_id: str
    rating: int
    comment: Optional[str] = None
    created_at: str
    reviewer_name: str = ""

    class Config:
        from_attributes = True
