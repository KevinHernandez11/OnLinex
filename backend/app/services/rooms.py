import string
import secrets
from app.models.rooms import RoomMember

class RoomService():


    @staticmethod
    def is_room_full(db, room_id: int, max_users: int) -> bool:
        current_members_count = db.query(RoomMember).filter(RoomMember.room_id == room_id).count()
        return current_members_count >= max_users

    @staticmethod
    def generate_room_code(length: int = 8) -> str:
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))


    @staticmethod
    def add_member_to_room(db, room_id: int, user_id: str, is_host: bool = False):
        
        new_member = RoomMember(
            room_id=room_id,
            user_id=user_id,
            is_host=is_host
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)

