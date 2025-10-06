from fastapi import APIRouter, WebSocket
from app.agents.main_agent import main_agent
from app.db.database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, WebSocket, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.agents.main_agent import main_agent
from app.models.user import User
from app.services.auth import AuthService

chatbot_ws = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}  # conversation_id -> socket

    async def connect(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        self.active_connections[conversation_id] = websocket

    def disconnect(self, conversation_id: str):
        self.active_connections.pop(conversation_id, None)

    async def send_messages(self, message: str, conversation_id: str):
        websocket = self.active_connections.get(conversation_id)
        if websocket:
            await websocket.send_text(message)

manager = ConnectionManager()


@chatbot_ws.websocket("/ws/chat/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: str,
    user = Depends(AuthService.get_ws_current_user),
    db: Session = Depends(get_db)
):
    await manager.connect(websocket, conversation_id)
    try:
        while True:
            user_input = await websocket.receive_text()

            response = main_agent(
                user_input=user_input,
                session_id=conversation_id,
                user_id=str(user.id),
                db=db
            )

            await manager.send_messages(response["messages"][-1].content, conversation_id)
    except Exception as e:
        manager.disconnect(conversation_id)
        print(f"WebSocket cerrado ({conversation_id}): {e}")
