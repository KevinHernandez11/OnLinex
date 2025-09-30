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
    def create_access_token(data: dict, expires_in: int = None) -> str:
        to_encode = data.copy()

        hours = expires_in if expires_in is not None else JWTService.EXPEDITION_TIME
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours)
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
        

    @staticmethod
    def decode_token_ws(token: str) -> dict:
        try:
            return jwt.decode(
                token,
                JWTService.SECRET_KEY,
                algorithms=[JWTService.ALGORITHM],
            )
        except ExpiredSignatureError:
            raise JWTError("Token expired")
        except JWTError:
            raise JWTError("Could not validate credentials")

