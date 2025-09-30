from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agents.main_agent import main_agent
from app.db.database import get_db
from app.models.rooms import Room
from fastapi import Depends, status
from app.services.auth import AuthService
from app.models.rooms import RoomMessage
from app.models.user import User
from sqlalchemy.orm import Session


ws_chat = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}  # room_code -> conexiones

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)

    def disconnect(self, websocket: WebSocket, room_code: str):
        self.active_connections[room_code].remove(websocket)
        if not self.active_connections[room_code]:
            del self.active_connections[room_code]

    async def broadcast(self, message: str, room_code: str):
        if room_code in self.active_connections:
            for connection in self.active_connections[room_code]:
                await connection.send_text(message)


manager = ConnectionManager()


@ws_chat.get("/")
async def get():
    return {"message": "WebSocket Chat is running"}



@ws_chat.websocket("/ws/chat/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    user: User = Depends(AuthService.get_ws_current_user),
    db: Session = Depends(get_db),
):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, room_code)

    try:
        while True:
            text = await websocket.receive_text()

            message = RoomMessage(room_id=room.id, sender_name=user.id, content=text)
            db.add(message)
            db.commit()
            db.refresh(message)

            await manager.broadcast(f"{user.username}: {text}", room_code)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code)