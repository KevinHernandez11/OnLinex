from passlib.context import CryptContext
from jose import JWTError, jwt, ExpiredSignatureError
from dotenv import load_dotenv
from fastapi import HTTPException
from app.db.database import SessionLocal
from app.models.user import User
from sqlalchemy.orm import Session
import os
import datetime

load_dotenv()

# Configuración del contexto de hash
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class HashService():
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

class JWTService():
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGHORITHM")
    EXPEDITION_TIME = int(os.getenv("EXPEDTION_TIME", 24))

    @staticmethod
    def create_token(user: User):
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        data = {
            "id":str(user.id),
            "username": str(user.username),
        }

        return JWTService.create_access_token(data)


    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWTService.EXPEDITION_TIME)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, JWTService.SECRET_KEY, algorithms=[JWTService.ALGORITHM])
        return encoded_jwt
    

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                JWTService.SECRET_KEY,
                algorithms=[JWTService.ALGORITHM]
            )
            return payload
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except JWTError:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        
    

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
