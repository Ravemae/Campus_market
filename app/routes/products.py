from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.product import Product
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/products", tags=["Products"])

class ProductCreate(BaseModel):
    vendor_id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: str

@router.post("/")
def create_product(data: ProductCreate, session: Session = Depends(get_session)):
    product = Product(**data.dict())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.get("/vendor/{vendor_id}")
def get_vendor_products(vendor_id: int, session: Session = Depends(get_session)):
    products = session.exec(
        select(Product).where(
            Product.vendor_id == vendor_id,
            Product.is_available == True
        )
    ).all()
    return products

@router.patch("/{product_id}")
def update_product(product_id: int, data: ProductCreate, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(product, key, value)
    session.commit()
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted"}