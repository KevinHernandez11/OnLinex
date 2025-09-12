from fastapi import APIRouter
from app.schemas.log_user import UserCreate, UserResponse
from app.db.database import get_db
from fastapi import Depends

register = APIRouter()

@register.post("/register", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db = Depends(get_db)):
    pass

