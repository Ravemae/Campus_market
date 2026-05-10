from pydantic import BaseModel


class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int
    added_at: str
    # Joined fields from product
    product_name: str = ""
    product_price: float = 0.0
    product_image_url: str = ""
    vendor_id: str = ""

    class Config:
        from_attributes = True
