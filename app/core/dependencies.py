from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.core.security import decode_token
from typing import Optional

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def get_vendor_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["vendor", "admin"]:
        raise HTTPException(status_code=403, detail="Vendor access required")
    return current_user
def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    session: Session = Depends(get_session)
) -> Optional[User]:
    """Returns the logged-in user if a valid token is present, otherwise None.
    Used for endpoints that work both logged-in and anonymously (e.g. tip payment)."""
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = session.get(User, user_id)
        return user
    except Exception:
        return None