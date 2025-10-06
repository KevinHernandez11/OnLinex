from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.auth import AuthService
from app.db.database import get_db
from app.models.conversations import Conversation

services = APIRouter()


@services.post("/conversations")
def create_conversation(
    agent_name: str,
    user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    
    existing_conversation = db.query(Conversation).filter(Conversation.user_id == user.id, Conversation.agent_name == agent_name).first()
    if existing_conversation:
        return {"conversation_id": str(existing_conversation.id)}
    
    else:
        conversation = Conversation(user_id=user.id, agent_name=agent_name)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return {"conversation_id": str(conversation.id)}
