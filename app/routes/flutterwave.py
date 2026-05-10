from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.order import Order
from app.models.user import User
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

router = APIRouter(prefix="/flutterwave", tags=["Flutterwave Payment"])

FLW_SECRET = os.getenv("FLUTTERWAVE_SECRET_KEY")
FLW_BASE = "https://api.flutterwave.com/v3"

@router.post("/initialize/{order_id}")
async def initialize_flutterwave_payment(
    order_id: str,
    session: Session = Depends(get_session)
):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    user = session.get(User, order.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    headers = {
        "Authorization": f"Bearer {FLW_SECRET}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "tx_ref": f"quickmart_{order_id[:8]}",
        "amount": str(order.total_amount),
        "currency": "NGN",
        "redirect_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/checkout/verify",
        "customer": {
            "email": user.email,
            "phone_number": user.phone,
            "name": user.full_name
        },
        "customizations": {
            "title": "QuickMart Payment",
            "description": "Payment for your QuickMart order",
        }
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{FLW_BASE}/payments",
            json=payload,
            headers=headers
        )
    
    data = res.json()
    print(f"Flutterwave response: {data}")
    
    if data.get("status") == "success":
        order.payment_reference = payload["tx_ref"]
        session.commit()
        return {
            "payment_url": data["data"]["link"],
            "reference": payload["tx_ref"]
        }
    raise HTTPException(status_code=400, detail=f"Payment failed: {data.get('message')}")

@router.get("/verify/{tx_ref}")
async def verify_flutterwave_payment(
    tx_ref: str,
    session: Session = Depends(get_session)
):
    headers = {
        "Authorization": f"Bearer {FLW_SECRET}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{FLW_BASE}/transactions/verify_by_reference?tx_ref={tx_ref}",
            headers=headers
        )
    
    data = res.json()
    print(f"Flutterwave verify response: {data}")
    
    if data.get("status") == "success" and data["data"]["status"] == "successful":
        order = session.exec(
            select(Order).where(Order.payment_reference == tx_ref)
        ).first()
        if order:
            order.is_paid = True
            order.status = "confirmed"
            session.commit()
        return {
            "message": "Payment successful",
            "amount": data["data"]["amount"],
            "currency": data["data"]["currency"],
            "customer": data["data"]["customer"]
        }
    raise HTTPException(status_code=400, detail="Payment verification failed")