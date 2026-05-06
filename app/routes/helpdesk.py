from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/helpdesk", tags=["Helpdesk"])

# Initialize OpenAI client with a fallback to prevent server crash if env var is missing
api_key = os.getenv("OPENAI_API_KEY", "your-openai-key-here")
client = OpenAI(api_key=api_key)

SYSTEM_PROMPT = """
You are a helpful customer support assistant for Campus Market.
Campus Market is a platform that connects students with vendors on campus.

You can help users with:
- Finding food and items
- Vendor registration questions
- Order tracking process
- Payment questions (we use Paystack)
- Choosing pickup or delivery to hostel
- General app navigation

How the app works:
- Users browse different shops and vendors
- Add items to cart and checkout
- Choose pickup (come collect yourself) or delivery to your hostel
- Pay securely via Paystack
- Vendors manage their own shop pages and menus
- Delivery fee is 200 Naira

Available hostels for delivery:
Female: FAD, Queen Esther, Platinum, Ameyo Adadevoh, Sapphire, Diamond, 
Havilah Gold, Crystal, White, Nyberg, Ogden
Male: Gideon Troopers, Winslow, Bethel Splendor, Samuel Akande, 
Neal Wilson, Nelson Mandela, Welch, Emerald, Topaz

Keep responses short, friendly and helpful.
If you cannot answer something, say: 
"Please contact our support team directly for further assistance."
"""

class ChatMessage(BaseModel):
    message: str
    conversation_history: list = []

@router.post("/chat")
async def chat(data: ChatMessage):
    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add conversation history for context
    for msg in data.conversation_history[-6:]:  # Keep last 6 messages for context
        messages.append(msg)
    
    # Add current message
    messages.append({"role": "user", "content": data.message})
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )
        reply = response.choices[0].message.content
        return {
            "reply": reply,
            "updated_history": messages[1:] + [{"role": "assistant", "content": reply}]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
