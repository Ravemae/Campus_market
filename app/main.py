from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import create_db
from app.routes import auth, vendors, products, orders, payment, delivery, admin, cart, reviews, upload, helpdesk, notifications
import traceback
import os

app = FastAPI(
    title="Campus Market API",
    description="A multi-vendor food and items booking platform for campus communities",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.on_event("startup")
def on_startup():
    create_db()


# Mount static files for uploaded images
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Register all routers
app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payment.router)
app.include_router(delivery.router)
app.include_router(admin.router)
app.include_router(cart.router)
app.include_router(reviews.router)
app.include_router(upload.router)
app.include_router(helpdesk.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"message": "Campus Market API is running 🚀"}