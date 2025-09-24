from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_db
from app.schemas.rooms import RoomCreate, RoomResponse
from app.services.rooms import RoomService
from app.models.rooms import Room

rooms = APIRouter()

@rooms.post("/rooms" ,response_model=RoomResponse, status_code=201)
async def create_rooms(form_data: RoomCreate, db = Depends(get_db)):

    Code = RoomService.generate_room_code()
    existing_room = db.query(Room).filter(Room.code == Code).first()

    while existing_room:
            Code = RoomService.generate_room_code()
            existing_room = db.query(Room).filter(Room.code == Code).first()

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=24)

    new_room = Room(
        code=Code,
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

    return RoomResponse(
        code=new_room.code,
        name=form_data.name,
    )



@rooms.get("/room/search/{room_code}")
async def get_room(room_code: str, db = Depends(get_db)):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room.code


@rooms.get("/rooms/chat/{room_code}")
async def get_room_chat(room_code: str, db = Depends(get_db)):
     pass

    
