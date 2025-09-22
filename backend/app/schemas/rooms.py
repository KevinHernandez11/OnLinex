from pydantic import BaseModel
from typing import List, Optional

class RoomBase(BaseModel):
    name: str 
    capacity: int = 2
    is_public: bool = True
    language: str = "en"


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    is_public: Optional[bool] = None
    language: Optional[str] = None

