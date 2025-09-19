import jwt
from fastapi import HTTPException
from app.db.database import SessionLocal
from app.models.user import User
from sqlalchemy.orm import Session
from app.services.Hash import HashService

class AuthService():
    @staticmethod
    def auth_user(email: str, password: str) -> User:
        try:
            db: Session = SessionLocal()
            user = db.query(User).filter(User.email == email).first()
            if not user or not HashService.verify_password(password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            return user
        finally:
            db.close()