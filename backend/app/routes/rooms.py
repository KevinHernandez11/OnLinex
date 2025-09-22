from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_db
from app.schemas.rooms import RoomCreate
from app.services.rooms import RoomService

rooms = APIRouter()

@rooms.post("/rooms")
async def create_rooms(form_data: RoomCreate, db = Depends(get_db)):
    Code = RoomService.generate_room_code()
    
    pass



@rooms.get("/rooms/{room_id}")
async def get_room(room_id: int, db = Depends(get_db)):
    pass