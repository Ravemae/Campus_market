import random
import string
from datetime import datetime, timedelta
from sqlmodel import SQLModel, Field, Session, select
from typing import Optional

class OTPStore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    otp_code: str
    expires_at: str
    is_used: bool = False

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def save_otp(email: str, session: Session) -> str:
    # Delete any existing OTP for this email
    existing = session.exec(
        select(OTPStore).where(OTPStore.email == email)
    ).all()
    for old in existing:
        session.delete(old)
    session.commit()

    # Generate new OTP
    otp = generate_otp()
    expires_at = str(datetime.utcnow() + timedelta(minutes=10))
    otp_record = OTPStore(
        email=email,
        otp_code=otp,
        expires_at=expires_at,
        is_used=False
    )
    session.add(otp_record)
    session.commit()
    return otp

def verify_otp(email: str, otp_code: str, session: Session) -> bool:
    record = session.exec(
        select(OTPStore).where(
            OTPStore.email == email,
            OTPStore.otp_code == otp_code,
            OTPStore.is_used == False
        )
    ).first()
    if not record:
        return False
    # Check expiry
    expires_at = datetime.fromisoformat(record.expires_at)
    if datetime.utcnow() > expires_at:
        return False
    # Mark as used
    record.is_used = True
    session.commit()
    return True