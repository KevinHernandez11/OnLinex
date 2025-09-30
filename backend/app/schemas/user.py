from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


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


#--------------------------------------------------------------
#Temporal User
class TempUserBase(BaseModel):
    temp_username: str

class TempUserCreate(TempUserBase):
    pass


class TempUserResponse(BaseModel):
    temp_username: str
    expires_at: datetime
    token: str
    token_type: str


    class Config:
        from_attributes = True


#--------------
class CurrentUser(BaseModel):
    id: UUID
    username: str
    type: str