from sqlmodel import SQLModel, Field
from typing import Optional
import uuid

def generate_uuid():
    return str(uuid.uuid4())

HOSTELS = [
    # Female
    "Felicia Adebisi Dada Hall (FAD)",
    "Queen Esther Hall",
    "Platinum Hall",
    "Ameyo Adadevoh Hall",
    "Sapphire Hall",
    "Diamond Hall",
    "Havilah Gold Hall",
    "Crystal Hall",
    "White Hall",
    "Nyberg Hall",
    "Ogden Hall",
    # Male
    "Gideon Troopers",
    "Winslow",
    "Bethel Splendor",
    "Samuel Akande",
    "Neal Wilson",
    "Nelson Mandela",
    "Welch Hall",
    "Emerald Hall",
    "Topaz",
]

class Delivery(SQLModel, table=True):
    id: Optional[str] = Field(
        default_factory=generate_uuid,
        primary_key=True
    )
    order_id: str = Field(foreign_key="order.id")
    hostel_name: str
    room_number: str
    delivery_fee: float = 200.0
    is_delivered: bool = False