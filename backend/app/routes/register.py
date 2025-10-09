from fastapi import APIRouter
from app.schemas.user import UserCreate
from app.db.database import get_db
from app.models.user import User
from app.services.Hash import HashService
from fastapi import HTTPException
from app.services.jwt import JWTService
from app.schemas.token import TokenResponse

from fastapi import Depends

register = APIRouter()

@register.post("/register", response_model=TokenResponse, status_code=201)
async def create_user(form_data: UserCreate, db = Depends(get_db)):

    if not all([form_data.username, form_data.confirm_password]):
        raise HTTPException(status_code=400, detail="all fields are required")
    
    if form_data.password != form_data.confirm_password:
        raise HTTPException(status_code=400, detail="passwords do not match")
    
    hashed_password = HashService.get_password_hash(form_data.password)

    data_user = User(  
        username=form_data.username,
        hashed_password=hashed_password,
        type_user="register",
    )

    db.add(data_user)
    db.commit()
    db.refresh(data_user)

    user_data = {
        "id": str(data_user.id),
        "username": str(data_user.username),
        "type_user": str(data_user.type_user),
    }
    token = JWTService.create_access_token(user_data)

    return TokenResponse(access_token=token, token_type="bearer")


