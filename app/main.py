from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import create_db
from app.routes import auth, vendors, products, orders, payment, flutterwave, delivery, admin, helpdesk, cart, reviews, upload, notifications
from app.core.otp import OTPStore
from fastapi.security import HTTPBearer
import traceback
import os

security = HTTPBearer()

app = FastAPI(
    title="QuickMart API",
    description="A multi-vendor food and items booking platform for campus communities",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://quickmartcampus.netlify.app",
        "https://quickmartapp.com.ng",
        "https://www.quickmartapp.com.ng",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = traceback.format_exc()
    print(f"ERROR: {error_detail}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.on_event("startup")
def on_startup():
    create_db()
    # seeding disabled to prevent duplicate entries in supabase during development
    # if not os.path.exists("seeded.txt"):
    #     from seed import seed
    #     seed()
    #     with open("seeded.txt", "w") as f:
    #         f.write("seeded")


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
app.include_router(flutterwave.router)  
app.include_router(delivery.router)
app.include_router(admin.router)
app.include_router(cart.router)
app.include_router(reviews.router)
app.include_router(upload.router)
app.include_router(helpdesk.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"message": "QuickMart API is running 🚀"}
