##
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from app.models.base import Base
from sqlalchemy.dialects.postgresql import UUID
from app.models.conversations import Conversation

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    room_members = relationship("RoomMember", back_populates="user", cascade="all, delete-orphan")


class TempUser(Base):
    __tablename__ = "temp_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    temp_username = Column(String,index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user_rooms = relationship("RoomMember", back_populates="temp_users", cascade="all, delete-orphan")
