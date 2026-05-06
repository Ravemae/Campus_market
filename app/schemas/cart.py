from pydantic import BaseModel


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    added_at: str
    # Joined fields from product
    product_name: str = ""
    product_price: float = 0.0
    product_image_url: str = ""
    vendor_id: int = 0

    class Config:
        from_attributes = True
