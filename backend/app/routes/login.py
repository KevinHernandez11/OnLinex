from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.models.user import User
from app.services.jwt import JWTService
from app.services.auth import AuthService
from app.schemas.token import TokenResponse
from app.schemas.user import TempUserCreate, TempUserResponse
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

login = APIRouter() 

@login.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    user = AuthService.auth_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_data = {"id": str(user.id) , "username": str(user.username), "type_user": str(user.type_user)}
    token = JWTService.create_access_token(user_data)
    
    return TokenResponse(access_token=token, token_type="bearer")


@login.post("/login/temporal/", response_model=TempUserResponse, status_code=201)
async def login_temporal(temp_user: TempUserCreate, db=Depends(get_db)):

    if not temp_user.temp_username:
        raise HTTPException(status_code=400, detail="Username is required")

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=6)

    temp_user = User(
        username=temp_user.temp_username,
        created_at=now,
        temp_expiration_date=expires_at,
    )

    db.add(temp_user)
    db.commit()
    db.refresh(temp_user)

    user_temp = {
        "id": str(temp_user.id),
        "temp_username": str(temp_user.username),
        "type_user": str("temporary")
    }

    token = JWTService.create_access_token(user_temp, expires_in = os.getenv("TEMP_USER_EXPIRATION_HOURS", 6))

    return TempUserResponse(
        temp_username=temp_user.username,
        expires_at=expires_at.isoformat(),
        token=token,
        token_type="bearer"
    )

