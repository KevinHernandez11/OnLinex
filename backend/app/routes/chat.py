from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession


chat = APIRouter()

# @chat.get("/chats/", response_model=List[Chat])