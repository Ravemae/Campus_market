from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.user import User
from app.core.dependencies import get_current_user, get_vendor_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/products", tags=["Products"])


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: str
    stock_quantity: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_available: Optional[bool] = None
    stock_quantity: Optional[int] = None


@router.get("/")
def get_all_products(
    q: Optional[str] = Query(None, description="Search keyword"),
    category: Optional[str] = Query(None, description="Filter by category"),
    session: Session = Depends(get_session)
):
    """Get all available products, optionally filtered by search query or category."""
    query = select(Product).where(Product.is_available == True)
    if q:
        query = query.where(Product.name.contains(q))
    if category:
        query = query.where(Product.category == category)
    products = session.exec(query).all()
    return products


@router.get("/{product_id}")
def get_product(product_id: int, session: Session = Depends(get_session)):
    """Get a single product by ID."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/vendor/{vendor_id}")
def get_vendor_products(
    vendor_id: int, 
    include_unavailable: bool = False,
    session: Session = Depends(get_session)
):
    """Get products for a specific vendor."""
    query = select(Product).where(Product.vendor_id == vendor_id)
    if not include_unavailable:
        query = query.where(Product.is_available == True)
    products = session.exec(query).all()
    return products


@router.post("/")
def create_product(
    data: ProductCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_vendor_user)
):
    """Create a new product. Only the vendor who owns the shop can create products."""
    # Find vendor owned by current user
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=403, detail="You do not have a vendor shop")
    product = Product(
        vendor_id=vendor.id,
        name=data.name,
        description=data.description,
        price=data.price,
        image_url=data.image_url,
        category=data.category,
        stock_quantity=data.stock_quantity
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.patch("/{product_id}")
def update_product(
    product_id: int,
    data: ProductUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_vendor_user)
):
    """Update a product. Only the vendor who owns it can update."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Verify ownership
    vendor = session.get(Vendor, product.vendor_id)
    if not vendor or vendor.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    product.updated_at = str(datetime.utcnow())
    session.commit()
    session.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_vendor_user)
):
    """Delete a product. Only the vendor who owns it can delete."""
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Verify ownership
    vendor = session.get(Vendor, product.vendor_id)
    if not vendor or vendor.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your product")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted"}