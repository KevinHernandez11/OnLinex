from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
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
    ALGHORITHM = os.getenv("ALGHORITHM")
    EXPEDTION_TIME = int(os.getenv("EXPEDTION_TIME", 24))

    @staticmethod
    def create_access_token(data: dict, secret_key: str, algorithm: str, expires_delta: int) -> str:
        to_encode = data.copy()
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWTService.EXPEDTION_TIME)
        to_encode.update({"exp": expire}) #Crear el payload con ID, Rol y Expiración
        encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
        return encoded_jwt