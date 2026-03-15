import logging
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.core.socket_manager import socket_manager
from app.schemas.notification_schema import NotificationResponse

logger = logging.getLogger("app.notifications")

class NotificationService:
    @staticmethod
    async def create_notification(
        db: Session,
        user_id: str,
        title: str,
        message: str,
        type: str = "info"
    ) -> Notification:
        # 1. Save to DB
        db_notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            is_read=False
        )
        db.add(db_notif)
        db.commit()
        db.refresh(db_notif)
        
        # 2. Push via WebSocket
        try:
            # We convert to schema for clean JSON
            payload = {
                "id": str(db_notif.id),
                "title": db_notif.title,
                "message": db_notif.message,
                "type": db_notif.type,
                "is_read": db_notif.is_read,
                "created_at": db_notif.created_at.isoformat()
            }
            await socket_manager.send_personal_message(payload, user_id)
        except Exception as e:
            logger.error(f"Failed to push WS notification for user {user_id}: {e}")
            
        return db_notif

notification_service = NotificationService()
