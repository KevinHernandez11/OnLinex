from jose import JWTError, jwt, ExpiredSignatureError
from dotenv import load_dotenv
from fastapi import HTTPException
from app.models.user import User
import os
import datetime

load_dotenv()

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
            "type": str(user.type_user)
        }

        return JWTService.create_access_token(data)


    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWTService.EXPEDITION_TIME)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, JWTService.SECRET_KEY, algorithm=JWTService.ALGORITHM)
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