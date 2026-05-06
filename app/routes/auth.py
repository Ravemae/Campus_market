from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User, UserRole
from app.core.security import hash_password, verify_password, create_access_token
from pydantic import BaseModel
from typing import Optional
import re

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

class VendorSignupRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    shop_name: str
    shop_description: str
    shop_location: str
    shop_category: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/signup/user", summary="Register as a Customer")
def signup_user(data: UserSignupRequest, session: Session = Depends(get_session)):
    validate_password(data.password)
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
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
def signup_vendor(data: VendorSignupRequest, session: Session = Depends(get_session)):
    try:
        validate_password(data.password)
        existing = session.exec(select(User).where(User.email == data.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role=UserRole.vendor,
            created_at=str(__import__('datetime').datetime.utcnow())
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        from app.models.vendor import Vendor
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
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e
@router.post("/login", summary="Login")
def login(data: LoginRequest, session: Session = Depends(get_session)):
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
def forgot_password(email: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    reset_token = create_access_token({"sub": str(user.id), "purpose": "reset"})
    return {"reset_token": reset_token, "message": "Use this token to reset your password"}

@router.post("/reset-password", summary="Reset Password")
def reset_password(data: ResetPasswordRequest, session: Session = Depends(get_session)):
    from app.core.security import decode_token
    try:
        payload = decode_token(data.token)
        if payload.get("purpose") != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        user_id = int(payload.get("sub"))
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.password_hash = hash_password(data.new_password)
        session.commit()
        return {"message": "Password reset successful"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

@router.patch("/profile/{user_id}", summary="Update Profile")
def update_profile(user_id: int, data: UpdateProfileRequest, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.full_name:
        user.full_name = data.full_name
    if data.phone:
        user.phone = data.phone
    if data.email:
        existing = session.exec(select(User).where(User.email == data.email)).first()
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    session.commit()
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }