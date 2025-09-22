import string
import secrets

class RoomService():

    @staticmethod
    def generate_room_code(length: int = 8) -> str:
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    @staticmethod
    def create_room():
        pass

    @staticmethod
    def join_room():
        pass

