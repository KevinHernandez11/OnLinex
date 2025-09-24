from pydantic import BaseModel
from typing import Optional
from uuid import UUID


#------------------------------------------------------------
#Register
class UserBase(BaseModel):
    username: str
    password: str

class UserCreate(UserBase):
    confirm_password: str

class UserResponse(BaseModel):
    id: UUID
    username: str

    class Config:
        from_attributes = True
#--------------------------------------------------------------
#Login
#No se pone LoginCreate ya que se hace el Oauth2 De fastApi

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str

#--------------------------------------------------------------
#Update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None