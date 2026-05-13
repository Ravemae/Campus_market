from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.order import Order
from app.models.user import User
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import uuid as uuid_lib
import os

load_dotenv()

router = APIRouter(prefix="/payment", tags=["Paystack Payment"])

PAYSTACK_SECRET = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_BASE = "https://api.paystack.co"

class TipRequest(BaseModel):
    amount: float
    email: str
    name: str = "QuickMart Supporter"

@router.post("/initialize/{order_id}")
async def initialize_payment(order_id: str, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    user = session.get(User, order.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    headers = {"Authorization": f"Bearer {PAYSTACK_SECRET}"}
    payload = {
        "amount": int(order.total_amount * 100),
        "email": user.email,
        "reference": f"order_{order_id}",
        "callback_url": f"{os.getenv('FRONTEND_URL', 'https://quickmartapp.com.ng')}/checkout/verify"
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{PAYSTACK_BASE}/transaction/initialize",
            json=payload,
            headers=headers
        )
    data = res.json()
    print(f"Paystack response: {data}")
    if data["status"]:
        order.payment_reference = data["data"]["reference"]
        session.commit()
        return {
            "payment_url": data["data"]["authorization_url"],
            "reference": data["data"]["reference"]
        }
    raise HTTPException(status_code=400, detail="Payment initialization failed")

@router.get("/verify/{reference}")
async def verify_payment(reference: str, session: Session = Depends(get_session)):
    headers = {"Authorization": f"Bearer {PAYSTACK_SECRET}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{PAYSTACK_BASE}/transaction/verify/{reference}",
            headers=headers
        )
    data = res.json()
    if data["status"] and data["data"]["status"] == "success":
        order = session.exec(
            select(Order).where(Order.payment_reference == reference)
        ).first()
        if order:
            order.is_paid = True
            order.status = "confirmed"
            session.commit()
        return {"message": "Payment successful", "data": data["data"]}
    raise HTTPException(status_code=400, detail="Payment verification failed")

@router.post("/tip/paystack")
async def tip_paystack(data: TipRequest):
    if data.amount < 100:
        raise HTTPException(status_code=400, detail="Minimum tip amount is \u20A6100")
    headers = {"Authorization": f"Bearer {PAYSTACK_SECRET}"}
    payload = {
        "amount": int(data.amount * 100),
        "email": data.email,
        "reference": f"tip_{str(uuid_lib.uuid4())[:8]}",
        "callback_url": "https://quickmartapp.com.ng/tip/success",
        "metadata": {
            "custom_fields": [
                {"display_name": "Payment Type", "variable_name": "payment_type", "value": "tip"},
                {"display_name": "Supporter Name", "variable_name": "name", "value": data.name}
            ]
        }
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{PAYSTACK_BASE}/transaction/initialize",
            json=payload,
            headers=headers
        )
    response = res.json()
    print(f"Tip Paystack response: {response}")
    if response["status"]:
        return {
            "payment_url": response["data"]["authorization_url"],
            "reference": response["data"]["reference"]
        }
    raise HTTPException(status_code=400, detail="Tip payment initialization failed")

@router.get("/tip/paystack/verify/{reference}")
async def verify_tip_paystack(reference: str):
    headers = {"Authorization": f"Bearer {PAYSTACK_SECRET}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{PAYSTACK_BASE}/transaction/verify/{reference}",
            headers=headers
        )
    data = res.json()
    if data["status"] and data["data"]["status"] == "success":
        return {
            "message": "Thank you for supporting QuickMart!",
            "amount": data["data"]["amount"] / 100,
            "reference": reference
        }
    raise HTTPException(status_code=400, detail="Tip verification failed")