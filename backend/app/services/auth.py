import jwt
from fastapi import HTTPException
from app.db.database import SessionLocal
from app.models.user import User
from sqlalchemy.orm import Session
from app.services.Hash import HashService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from app.services.jwt import JWTService
from datetime import datetime, timezone
from app.db.database import get_db
from app.schemas.user import CurrentUser

security = HTTPBearer()

class AuthService():
    @staticmethod
    def auth_user(username: str, password: str, db:Session) -> User:
            user = db.query(User).filter(User.username == username).first()
            if not user or not HashService.verify_password(password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid username or password")
            return user
    

    @staticmethod
    def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db=Depends(get_db)) -> CurrentUser:
        token = credentials.credentials
        payload = JWTService.decode_token(token)

        user_id = payload.get("id")
        user_type = payload.get("type_user")

        if user_type == "temporary":
            temp_user = db.query(User).filter(User.id == user_id).first()
            if not temp_user or temp_user.temp_expiration_date < datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="Temporary user expired")
            return CurrentUser(id=str(temp_user.id), username=temp_user.username, type="temporary")
        
        if user_type == "register":
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return CurrentUser(id=str(user.id), username=user.username, type="register")
        
        raise HTTPException(status_code=401, detail="Invalid user type")