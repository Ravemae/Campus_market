from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.order import Order, OrderStatus, DeliveryType
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.delivery import Delivery, HOSTELS
from app.models.notification import Notification
from app.models.vendor import Vendor
from app.models.user import User
from app.core.dependencies import get_current_user, get_vendor_user
from app.schemas.order import OrderCreate, OrderResponse
from app.schemas.order_item import OrderItemResponse
from datetime import datetime
from typing import List

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create an order with line items. Total is computed from items."""
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Validate delivery info
    if data.delivery_type == DeliveryType.delivery:
        if not data.hostel_name or not data.room_number:
            raise HTTPException(status_code=400, detail="Hostel name and room number required for delivery")
        if data.hostel_name not in HOSTELS:
            raise HTTPException(status_code=400, detail="Invalid hostel name")

    # Calculate total from items
    total_amount = 0.0
    order_items_data = []
    for item in data.items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if not product.is_available:
            raise HTTPException(status_code=400, detail=f"Product '{product.name}' is not available")
        subtotal = item.unit_price * item.quantity
        total_amount += subtotal
        order_items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": subtotal
        })

    # Add delivery fee
    if data.delivery_type == DeliveryType.delivery:
        total_amount += 200.0

    # Create order
    order = Order(
        user_id=current_user.id,
        vendor_id=data.vendor_id,
        total_amount=total_amount,
        delivery_type=data.delivery_type,
        hostel_name=data.hostel_name,
        room_number=data.room_number,
        customer_name=current_user.full_name,
        created_at=str(datetime.utcnow())
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    # Create order items
    created_items = []
    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        session.add(order_item)
        created_items.append(order_item)
    session.commit()

    # Create delivery record if needed
    if data.delivery_type == DeliveryType.delivery:
        delivery = Delivery(
            order_id=order.id,
            hostel_name=data.hostel_name,
            room_number=data.room_number,
            delivery_fee=200.0
        )
        session.add(delivery)
        session.commit()

    # Notify vendor
    vendor = session.get(Vendor, data.vendor_id)
    if vendor:
        notification = Notification(
            user_id=vendor.owner_id,
            message=f"New order #{order.id} from {current_user.full_name}",
            type="order"
        )
        session.add(notification)
        session.commit()

    # Build response
    for item in created_items:
        session.refresh(item)
    items_response = [
        OrderItemResponse(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal
        )
        for item in created_items
    ]

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        vendor_id=order.vendor_id,
        total_amount=order.total_amount,
        delivery_type=order.delivery_type,
        status=order.status,
        is_paid=order.is_paid,
        customer_name=order.customer_name,
        created_at=order.created_at,
        hostel_name=order.hostel_name,
        room_number=order.room_number,
        items=items_response
    )


@router.get("/hostels")
def get_hostels():
    """Get the list of available hostels for delivery."""
    return {"hostels": HOSTELS}


@router.get("/user/{user_id}")
def get_user_orders(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get orders for a specific user. Users can only see their own orders."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only view your own orders")
    orders = session.exec(select(Order).where(Order.user_id == user_id)).all()
    result = []
    for order in orders:
        items = session.exec(
            select(OrderItem).where(OrderItem.order_id == order.id)
        ).all()
        result.append(OrderResponse(
            id=order.id,
            user_id=order.user_id,
            vendor_id=order.vendor_id,
            total_amount=order.total_amount,
            delivery_type=order.delivery_type,
            status=order.status,
            is_paid=order.is_paid,
            customer_name=order.customer_name,
            created_at=order.created_at,
            hostel_name=order.hostel_name,
            room_number=order.room_number,
            items=[OrderItemResponse(
                id=i.id, order_id=i.order_id, product_id=i.product_id,
                quantity=i.quantity, unit_price=i.unit_price, subtotal=i.subtotal
            ) for i in items]
        ))
    return result


@router.get("/vendor/{vendor_id}")
def get_vendor_orders(
    vendor_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get orders for a specific vendor. Only the vendor owner or admin can view."""
    vendor = session.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if vendor.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your vendor")
    orders = session.exec(select(Order).where(Order.vendor_id == vendor_id)).all()
    result = []
    for order in orders:
        items = session.exec(
            select(OrderItem).where(OrderItem.order_id == order.id)
        ).all()
        result.append(OrderResponse(
            id=order.id,
            user_id=order.user_id,
            vendor_id=order.vendor_id,
            total_amount=order.total_amount,
            delivery_type=order.delivery_type,
            status=order.status,
            is_paid=order.is_paid,
            customer_name=order.customer_name,
            created_at=order.created_at,
            hostel_name=order.hostel_name,
            room_number=order.room_number,
            items=[OrderItemResponse(
                id=i.id, order_id=i.order_id, product_id=i.product_id,
                quantity=i.quantity, unit_price=i.unit_price, subtotal=i.subtotal
            ) for i in items]
        ))
    return result


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int,
    status: OrderStatus,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update order status. Only the vendor who owns the order or admin can update."""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Verify vendor ownership
    vendor = session.get(Vendor, order.vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if vendor.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your order to update")

    order.status = status
    session.commit()

    # Notify customer
    notification = Notification(
        user_id=order.user_id,
        message=f"Your order #{order.id} is now {status.value}",
        type="order"
    )
    session.add(notification)
    session.commit()

    return {"message": f"Order status updated to {status}"}