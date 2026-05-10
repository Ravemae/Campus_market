from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int
    unit_price: float


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True
