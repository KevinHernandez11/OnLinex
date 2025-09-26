from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_db
from app.schemas.rooms import RoomCreate, RoomResponse
from app.services.rooms import RoomService
from app.services.auth import AuthService
from app.models.rooms import Room
from app.models.user import User

rooms = APIRouter()

@rooms.post("/rooms" ,response_model=RoomResponse, status_code=201)
async def create_rooms(form_data: RoomCreate, db = Depends(get_db), user: User  = Depends(AuthService.get_current_user)):

    code = RoomService.generate_room_code()
    existing_room = db.query(Room).filter(Room.code == code).first()

    while existing_room:
            code = RoomService.generate_room_code()
            existing_room = db.query(Room).filter(Room.code == code).first()

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=24)

    new_room = Room(
        code=code,
        name=form_data.name,
        is_public=form_data.is_public,
        max_users=form_data.capacity,
        language=form_data.language,
        created_at=now,
        expires_at=expires_at,
        is_active=True
    )    

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    RoomService.add_member_to_room(db, new_room.id, user.id, is_host = True)

    return RoomResponse(
        code=new_room.code,
        name=form_data.name,
    )


@rooms.get("/rooms/join")
async def join_room(user = Depends(AuthService.get_current_user), db = Depends(get_db), room_code: str = None):
    
    if not room_code:
        raise HTTPException(status_code=400, detail="Room code is required")
    
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_active or room.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail="Room is inactive or expired")
    
    current_members_count = db.query(RoomService).filter(RoomService.room_id == room.id).count()
    if current_members_count >= room.max_users:
        raise HTTPException(status_code=403, detail="Room is full")
    
    existing_member = db.query(RoomService).filter(RoomService.room_id == room.id, RoomService.user_id == user.id).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User already in the room")
    
    RoomService.add_member_to_room(db, room.id, user.id)

    return {"message": f"User {user.username} joined room {room.code}"}




@rooms.get("/room/search/{room_code}")
async def get_room(room_code: str, db = Depends(get_db)):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room.code


@rooms.get("/rooms/chat/{room_code}")
async def get_room_chat(room_code: str, db = Depends(get_db)):
     pass

    
