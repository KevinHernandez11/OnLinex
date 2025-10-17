import uuid
from sqlalchemy.orm import Session
from app.models.conversations import Conversation

class DependencyResolver:
    
    @staticmethod
    def _resolve_profile_id(db: Session, session_id: str) -> str:
        try:
            conversation_uuid = uuid.UUID(session_id)
        except (ValueError, TypeError):
            return "default"

        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_uuid)
            .first()
        )
        if conversation and conversation.agent_name:
            return conversation.agent_name.lower()

        return "default"
