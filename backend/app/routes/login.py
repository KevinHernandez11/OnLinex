from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.models.user import User
from app.services.dependencies import HashService, TokenService

login = APIRouter() 

@login.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    pass
