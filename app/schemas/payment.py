from pydantic import BaseModel

class PaymentInitialize(BaseModel):
    order_id: int
    email: str

class PaymentVerify(BaseModel):
    reference: str