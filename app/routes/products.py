from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.user import User
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional

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

def get_vendor_from_user(current_user: User, session: Session) -> Vendor:
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if not vendor.is_approved:
        raise HTTPException(status_code=403, detail="Your shop is not approved yet")
    return vendor

@router.get("/")
def get_all_products(
    q: Optional[str] = Query(None, description="Search keyword"),
    category: Optional[str] = Query(None, description="Filter by category"),
    session: Session = Depends(get_session)
):
    query = select(Product).where(Product.is_available == True)
    if q:
        query = query.where(Product.name.contains(q))
    if category:
        query = query.where(Product.category == category)
    products = session.exec(query).all()
    return products

@router.get("/my-products", summary="Get My Products")
def get_my_products(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vendor = get_vendor_from_user(current_user, session)
    products = session.exec(
        select(Product).where(Product.vendor_id == vendor.id)
    ).all()
    return products

@router.get("/vendor/{vendor_id}", summary="Get Vendor Products")
def get_vendor_products(vendor_id: str, session: Session = Depends(get_session)):
    products = session.exec(
        select(Product).where(
            Product.vendor_id == vendor_id,
            Product.is_available == True
        )
    ).all()
    return products

@router.get("/{product_id}")
def get_product(product_id: str, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", summary="Add Product")
def create_product(
    data: ProductCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vendor = get_vendor_from_user(current_user, session)
    product = Product(
        vendor_id=vendor.id,
        name=data.name,
        description=data.description,
        price=data.price,
        image_url=data.image_url,
        category=data.category
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.patch("/{product_id}", summary="Update Product")
def update_product(
    product_id: str,
    data: ProductUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vendor = get_vendor_from_user(current_user, session)
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.vendor_id != vendor.id:
        raise HTTPException(status_code=403, detail="You can only edit your own products")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(product, key, value)
    session.commit()
    session.refresh(product)
    return product

@router.delete("/{product_id}", summary="Delete Product")
def delete_product(
    product_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    vendor = get_vendor_from_user(current_user, session)
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.vendor_id != vendor.id:
        raise HTTPException(status_code=403, detail="You can only delete your own products")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted successfully"}