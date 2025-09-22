# #With celery delete all rooms that are older than 1 day and clean up the databasefrom datetime import datetime, timedelta
# from sqlalchemy.orm import Session
# from app.db import get_db, SessionLocal
# from app.models.rooms import Room
# from app.celery_app import celery


# @celery.task
# def cleanup_expired_rooms():
#     expiration_time = datetime.utcnow() - timedelta(hours=24)

#     with SessionLocal() as db:
#         expired_rooms = db.query(Room).filter(Room.last_activity < expiration_time).all()

#         for room in expired_rooms:
#             db.delete(room)
#         db.commit()
