from fastapi import APIRouter
from app.schemas.user import UserCreate, UserResponse
from app.db.database import get_db
from app.models.user import User
from app.services.Hash import HashService
from fastapi import HTTPException

from fastapi import Depends

register = APIRouter()

@register.post("/register", response_model=UserResponse, status_code=201)
async def create_user(form_data: UserCreate, db = Depends(get_db)):

    if not all([form_data.username, form_data.confirm_password]):
        raise HTTPException(status_code=400, detail="all fields are required")
    
    if form_data.password != form_data.confirm_password:
        raise HTTPException(status_code=400, detail="passwords do not match")
    
    get_user = db.query(User).filter(User.username == form_data.username).first()
    if get_user:
        raise HTTPException(status_code=400, detail="the username already exists")
    
    
    hashed_password = HashService.get_password_hash(form_data.password)

    data_user = User(  
        username=form_data.username,
        hashed_password=hashed_password,
        type_user="register",
    )

    db.add(data_user)
    db.commit()
    db.refresh(data_user)

    return UserResponse(
        id=data_user.id,
        username=data_user.username,
    )
    
