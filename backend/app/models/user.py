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
    username = Column(String, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    type_user = Column(String, default="temporary")
    temp_expiration_date = Column(DateTime(timezone=True), nullable=True)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    room_members = relationship("RoomMember", back_populates="user", cascade="all, delete-orphan")