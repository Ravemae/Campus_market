from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.order import Order
from app.models.user import User
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/payment", tags=["Payment"])

PAYSTACK_SECRET = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_BASE = "https://api.paystack.co"

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
<<<<<<< HEAD
        "reference": f"order_{order_id}",
        "callback_url": "http://localhost:5173/checkout/verify"
=======
        "reference": f"order_{order_id[:8]}",
        "callback_url": "http://localhost:8000/payment/verify"
>>>>>>> 64fb116 (payment working, UUID IDs, OTP email, full backend complete)
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