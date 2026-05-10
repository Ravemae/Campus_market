from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.review import Review
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.review import ReviewCreate, ReviewResponse
from typing import List

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a review for a delivered order. Only the customer who placed the order can review."""
    # Verify the order exists and belongs to the user
    order = session.get(Order, data.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    if order.status != OrderStatus.delivered:
        raise HTTPException(status_code=400, detail="Can only review delivered orders")

    # Check if already reviewed
    existing = session.exec(
        select(Review).where(
            Review.order_id == data.order_id,
            Review.user_id == current_user.id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this order")

    review = Review(
        user_id=current_user.id,
        vendor_id=data.vendor_id,
        order_id=data.order_id,
        rating=data.rating,
        comment=data.comment
    )
    session.add(review)
    session.commit()
    session.refresh(review)

    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        vendor_id=review.vendor_id,
        order_id=review.order_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        reviewer_name=current_user.full_name
    )


@router.get("/vendor/{vendor_id}")
def get_vendor_reviews(
    vendor_id: str,
    session: Session = Depends(get_session)
):
    """Get all reviews for a vendor with average rating (public)."""
    reviews = session.exec(
        select(Review).where(Review.vendor_id == vendor_id)
    ).all()

    review_list = []
    for r in reviews:
        user = session.get(User, r.user_id)
        review_list.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            vendor_id=r.vendor_id,
            order_id=r.order_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            reviewer_name=user.full_name if user else "Anonymous"
        ))

    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0.0

    return {
        "vendor_id": vendor_id,
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "reviews": review_list
    }
