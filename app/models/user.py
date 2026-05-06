from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    user = "user"
    vendor = "vendor"
    admin = "admin"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    phone: str
    password_hash: str
    role: UserRole = UserRole.user
    is_active: bool = True
    avatar_url: Optional[str] = None
    created_at: str = Field(default="")
    updated_at: Optional[str] = None