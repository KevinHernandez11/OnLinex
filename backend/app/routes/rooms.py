from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_db
from app.schemas.rooms import RoomCreate, RoomResponse
from app.services.rooms import RoomService
from app.services.auth import AuthService
from app.models.rooms import Room
from app.models.rooms import RoomMember

rooms = APIRouter()

@rooms.post("/rooms" ,response_model=RoomResponse, status_code=201)
async def create_rooms(form_data: RoomCreate, db = Depends(get_db,), User = Depends(AuthService.get_current_user)):

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
        is_public=True,
        max_users=form_data.capacity,
        language=form_data.language,
        created_at=now,
        expires_at=expires_at,
        is_active=True
    )    

    db.add(new_room)
    db.commit()
    db.refresh(new_room)


    RoomService.add_member_to_room(db, new_room.id, user_id=User.id, is_host = True)

    return RoomResponse(
        code=new_room.code,
        name=form_data.name,
    )


@rooms.get("/rooms/join")
async def join_room(room_code: str, user = Depends(AuthService.get_current_user), db = Depends(get_db)):
    
    if not room_code:
        raise HTTPException(status_code=400, detail="Room code is required")
    
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_active or room.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail="Room is inactive or expired")
    
    current_users = db.query(RoomMember).filter(RoomMember.room_id == room.id, RoomMember.is_active == True).count()
    if current_users >= room.max_users:
        raise HTTPException(status_code=403, detail="Room is full")

    existing_member = db.query(RoomMember).filter_by(room_id=room.id, user_id=user.id, is_active=True).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User already in the room")
    
    active_membership = db.query(RoomMember).filter_by(user_id=user.id, is_active=True).first()
    if active_membership:
        raise HTTPException(status_code=400, detail="User already in another room")

    RoomService.add_member_to_room(db, room.id, user.id)

    return {"message": f"User {user.username} joined room {room.code}"}

#Ruta para buscar una sala por idioma, capacidad y si está activa para unirse a ella si es pública.
@rooms.get("/room/search/")
async def get_room(language: str, db = Depends(get_db), user = Depends(AuthService.get_current_user)):

    user_active_membership = db.query(RoomMember).filter_by(user_id=user.id, is_active=True).first()
    if user_active_membership:
        raise HTTPException(status_code=400, detail="User already in another room")

    room = db.query(Room).filter(
        Room.language == language,
        Room.is_public == True,
        Room.is_active == True,
        Room.expires_at > datetime.now(timezone.utc)
    ).first()

    current_members = db.query(RoomMember).filter(RoomMember.room_id == room.id, RoomMember.is_active == True).count()
    if current_members >= room.max_users:
        raise HTTPException(status_code=403, detail="Room is full")

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if (room.expires_at - datetime.now(timezone.utc)).total_seconds() < 60:
        raise HTTPException(status_code=410, detail="Room about to expire")
    
    return RoomResponse(
        code=room.code,
        name=room.name
    )
    

@rooms.post("/rooms/{room_code}/leave")
async def leave_room(room_code: str, user = Depends(AuthService.get_current_user), db = Depends(get_db)):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    member = db.query(RoomMember).filter_by(room_id=room.id, user_id=user.id).first()
    if not member:
        raise HTTPException(status_code=404, detail="User not in the room")
    
    member.is_active = False
    db.commit()

    if member.is_host:
        new_host = db.query(RoomMember).filter(RoomMember.room_id == room.id).first()
        if new_host:
            new_host.is_host = True
            db.commit()
        else:
            room.is_active = False
            db.commit()

    return {"message": f"User {user.username} left room {room.code}"}
    
    

    

    

    


