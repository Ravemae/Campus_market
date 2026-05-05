from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import create_db
from app.routes import auth, vendors, products, orders, payment, delivery, admin
import traceback

app = FastAPI(
    title="Campus Market API",
    description="A multi-vendor food and items booking platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],

)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = traceback.format_exc()
    print(f"\nERROR: {error_detail}\n")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": error_detail}
    )

@app.on_event("startup")
def on_startup():
    create_db()

app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payment.router)
app.include_router(delivery.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Campus Market API is running 🚀"}