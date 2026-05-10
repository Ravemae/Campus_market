from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.notification import Notification
from app.models.user import User
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[Notification])
def get_my_notifications(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for the current user."""
    notifications = session.exec(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    ).all()
    return notifications


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your notification")
    
    notification.is_read = True
    session.commit()
    return {"message": "Notification marked as read"}


@router.patch("/read-all")
def mark_all_as_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications for the current user as read."""
    notifications = session.exec(
        select(Notification).where(Notification.user_id == current_user.id, Notification.is_read == False)
    ).all()
    for n in notifications:
        n.is_read = True
    session.commit()
    return {"message": "All notifications marked as read"}
