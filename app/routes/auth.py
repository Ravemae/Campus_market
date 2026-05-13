from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User, UserRole
from app.models.vendor import Vendor
from app.core.security import hash_password, verify_password, create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel
from typing import Optional
from app.core.captcha import verify_hcaptcha
import re
import os

router = APIRouter(prefix="/auth", tags=["Auth"])

def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")

class UserSignupRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    captcha_token: str

class VendorSignupRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    shop_name: str
    shop_description: str
    shop_location: str
    shop_category: str
    captcha_token: str

class LoginRequest(BaseModel):
    email: str
    password: str
    captcha_token: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    
class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend

@router.post("/google", summary="Sign in with Google")
async def google_signin(data: GoogleAuthRequest, session: Session = Depends(get_session)):
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            data.token,
            google_requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
        
        email = idinfo["email"]
        full_name = idinfo.get("name", "")
        profile_image = idinfo.get("picture", "")
        
        # Check if user exists
        user = session.exec(select(User).where(User.email == email)).first()
        
        if not user:
            # Create new user
            import random
            user = User(
                full_name=full_name,
                email=email,
                phone=f"google_{random.randint(10000000, 99999999)}",  # placeholder
                password_hash=hash_password(os.urandom(32).hex()),  # random password
                role=UserRole.user,
                profile_image=profile_image,
                created_at=str(__import__('datetime').datetime.utcnow())
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "profile_image": user.profile_image
            },
            "is_new_user": True if not user else False
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

@router.post("/signup/user", summary="Register as a Customer")
async def signup_user(data: UserSignupRequest, session: Session = Depends(get_session)):
    await verify_hcaptcha(data.captcha_token)
    validate_password(data.password)
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_phone = session.exec(select(User).where(User.phone == data.phone)).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=UserRole.user,
        created_at=str(__import__('datetime').datetime.utcnow())
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at
        }
    }

@router.post("/signup/vendor", summary="Register as a Shop Owner")
async def signup_vendor(data: VendorSignupRequest, session: Session = Depends(get_session)):
    await verify_hcaptcha(data.captcha_token)
    validate_password(data.password)
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_phone = session.exec(select(User).where(User.phone == data.phone)).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    existing_shop = session.exec(
        select(Vendor).where(Vendor.shop_name == data.shop_name)
    ).first()
    if existing_shop:
        raise HTTPException(status_code=400, detail="Shop name already exists")
    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=UserRole.vendor,
        created_at=str(__import__('datetime').datetime.utcnow())
    )
    session.add(user)
    session.flush()
    vendor = Vendor(
        owner_id=user.id,
        shop_name=data.shop_name,
        description=data.shop_description,
        location=data.shop_location,
        category=data.shop_category,
        is_approved=False
    )
    session.add(vendor)
    session.commit()
    session.refresh(vendor)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at
        },
        "vendor": {
            "id": vendor.id,
            "shop_name": vendor.shop_name,
            "location": vendor.location,
            "category": vendor.category,
            "is_approved": vendor.is_approved
        },
        "message": "Shop registered successfully. Awaiting admin approval."
    }

@router.post("/login", summary="Login")
async def login(data: LoginRequest, session: Session = Depends(get_session)):
    await verify_hcaptcha(data.captcha_token)
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at
        }
    }

@router.post("/forgot-password", summary="Forgot Password")
async def forgot_password(email: str, session: Session = Depends(get_session)):
    from app.core.otp import save_otp
    from app.core.email import send_otp_email
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    otp = save_otp(email, session)
    sent = await send_otp_email(email, otp, user.full_name)
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")
    return {"message": "OTP sent to your email. Valid for 10 minutes."}

@router.post("/verify-otp", summary="Verify OTP")
def verify_otp_endpoint(otp_code: str, session: Session = Depends(get_session)):
    from app.core.otp import OTPStore
    from datetime import datetime
    record = session.exec(
        select(OTPStore).where(
            OTPStore.otp_code == otp_code,
            OTPStore.is_used == False
        )
    ).first()
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    expires_at = datetime.fromisoformat(record.expires_at)
    if datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")
    record.is_used = True
    session.commit()
    return {
        "message": "OTP verified. You can now reset your password.",
        "email": record.email
    }

@router.post("/reset-password", summary="Reset Password")
def reset_password(data: ResetPasswordRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    validate_password(data.new_password)
    user.password_hash = hash_password(data.new_password)
    session.commit()
    return {"message": "Password reset successful. You can now login with your new password."}

@router.patch("/profile/{user_id}", summary="Update Profile")
def update_profile(user_id: str, data: UpdateProfileRequest, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.full_name:
        user.full_name = data.full_name
    if data.phone:
        existing = session.exec(select(User).where(User.phone == data.phone)).first()
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Phone already in use")
        user.phone = data.phone
    if data.email:
        existing = session.exec(select(User).where(User.email == data.email)).first()
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    if data.avatar_url:
        user.avatar_url = data.avatar_url
    session.commit()
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    }