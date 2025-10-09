from pydantic import BaseModel
from typing import List, Optional

class RoomBase(BaseModel):
    name: str 
    capacity: int = 2
    is_public: bool = True
    language: str = "en"


class RoomCreate(RoomBase):
    pass

class RoomResponse(BaseModel):
    code: str
    name: str

    class Config:
        orm_mode = True


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    is_public: Optional[bool] = None
    language: Optional[str] = None

class RoomJoin(BaseModel):
    code: str

class RoomMemberResponse(BaseModel):
    user_id: str
    is_host: bool

    class Config:
        orm_mode = True
