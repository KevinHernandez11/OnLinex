from passlib.context import CryptContext
from jose import JWTError, jwt

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
    @staticmethod
    def create_access_token(data: dict, secret_key: str, algorithm: str, expires_delta: int) -> str:
        to_encode = data.copy()
        import datetime
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
        return encoded_jwt