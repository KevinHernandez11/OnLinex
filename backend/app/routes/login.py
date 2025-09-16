from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.models.user import User
from app.services.dependencies import JWTService, AuthService
from app.schemas.token import TokenResponse


login = APIRouter() 

@login.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = AuthService.auth_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = JWTService.create_token(user)
    
    return TokenResponse(access_token=token, token_type="bearer")
