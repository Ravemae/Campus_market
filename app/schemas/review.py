from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreate(BaseModel):
    vendor_id: int
    order_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    vendor_id: int
    order_id: int
    rating: int
    comment: Optional[str] = None
    created_at: str
    reviewer_name: str = ""

    class Config:
        from_attributes = True
