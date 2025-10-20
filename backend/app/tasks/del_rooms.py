from datetime import datetime, timezone
from app.core.celery_app import celery_app
from app.db.database import SessionLocal
from app.models import Room, RoomMember

@celery_app.task(name="tasks.clean_expired_rooms")
def clean_expired_rooms():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired_rooms = db.query(Room).filter(Room.expires_at <= now).all()

        deleted_count = 0
        for room in expired_rooms:
            # Primero eliminar los miembros si hay relación
            db.query(RoomMember).filter(RoomMember.room_id == room.id).delete()
            db.delete(room)
            deleted_count += 1

        db.commit()

        print(f"[CLEANER] {deleted_count} expired rooms deleted at {now}")
        return deleted_count

    except Exception as e:
        db.rollback()
        print(f"[CLEANER ERROR] {str(e)}")
    finally:
        db.close()
