from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemResponse
from typing import List

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.post("/", response_model=CartItemResponse)
def add_to_cart(
    data: CartItemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Add an item to the cart. If product already in cart, increase quantity."""
    product = session.get(Product, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product.is_available:
        raise HTTPException(status_code=400, detail="Product is not available")

    # Check if item already in cart
    existing = session.exec(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == data.product_id
        )
    ).first()

    if existing:
        existing.quantity += data.quantity
        session.commit()
        session.refresh(existing)
        return CartItemResponse(
            id=existing.id,
            user_id=existing.user_id,
            product_id=existing.product_id,
            quantity=existing.quantity,
            added_at=existing.added_at,
            product_name=product.name,
            product_price=product.price,
            product_image_url=product.image_url or "",
            vendor_id=product.vendor_id
        )

    cart_item = CartItem(
        user_id=current_user.id,
        product_id=data.product_id,
        quantity=data.quantity
    )
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)

    return CartItemResponse(
        id=cart_item.id,
        user_id=cart_item.user_id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        added_at=cart_item.added_at,
        product_name=product.name,
        product_price=product.price,
        product_image_url=product.image_url or "",
        vendor_id=product.vendor_id
    )


@router.get("/", response_model=List[CartItemResponse])
def get_cart(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all items in the current user's cart with product details."""
    cart_items = session.exec(
        select(CartItem).where(CartItem.user_id == current_user.id)
    ).all()

    result = []
    for item in cart_items:
        product = session.get(Product, item.product_id)
        if product:
            result.append(CartItemResponse(
                id=item.id,
                user_id=item.user_id,
                product_id=item.product_id,
                quantity=item.quantity,
                added_at=item.added_at,
                product_name=product.name,
                product_price=product.price,
                product_image_url=product.image_url or "",
                vendor_id=product.vendor_id
            ))
    return result


@router.patch("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update the quantity of a cart item."""
    cart_item = session.get(CartItem, item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if cart_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your cart item")
    if data.quantity <= 0:
        session.delete(cart_item)
        session.commit()
        return {"message": "Item removed from cart"}

    cart_item.quantity = data.quantity
    session.commit()
    session.refresh(cart_item)

    product = session.get(Product, cart_item.product_id)
    return CartItemResponse(
        id=cart_item.id,
        user_id=cart_item.user_id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        added_at=cart_item.added_at,
        product_name=product.name if product else "",
        product_price=product.price if product else 0.0,
        product_image_url=product.image_url or "" if product else "",
        vendor_id=product.vendor_id if product else 0
    )


@router.delete("/{item_id}")
def remove_cart_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Remove a single item from the cart."""
    cart_item = session.get(CartItem, item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if cart_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your cart item")
    session.delete(cart_item)
    session.commit()
    return {"message": "Item removed from cart"}


@router.delete("/clear/all")
def clear_cart(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from the current user's cart."""
    cart_items = session.exec(
        select(CartItem).where(CartItem.user_id == current_user.id)
    ).all()
    for item in cart_items:
        session.delete(item)
    session.commit()
    return {"message": "Cart cleared"}
