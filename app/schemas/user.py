from pydantic import BaseModel
from app.models.user import UserRole

class UserCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    role: UserRole = UserRole.user

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    role: UserRole

    class Config:
        from_attributes = True