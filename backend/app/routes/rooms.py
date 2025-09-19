from fastapi import APIRouter, HTTPException, Depends
from app.db.database import get_db

rooms = APIRouter()

@rooms.post("/rooms")
async def create_rooms(db = Depends(get_db)):
    pass

@rooms.get("/rooms/{room_id}")
async def get_room(room_id: int, db = Depends(get_db)):
    pass