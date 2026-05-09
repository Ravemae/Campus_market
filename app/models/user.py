from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, Enum):
    user = "user"
    vendor = "vendor"
    admin = "admin"

class User(SQLModel, table=True):
    id: Optional[str] = Field(
        default_factory=generate_uuid,
        primary_key=True
    )
    full_name: str
    email: str = Field(unique=True, index=True)
    phone: str = Field(unique=True, index=True)
    password_hash: str
    role: UserRole = UserRole.user
    is_active: bool = True
    avatar_url: Optional[str] = None
    created_at: str = Field(default="")
    updated_at: Optional[str] = None