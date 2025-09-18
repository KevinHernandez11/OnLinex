from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agents.main_agent import main_agent

ws_chat = APIRouter()

# Gestor simple de conexiones
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@ws_chat.get("/")
async def get():
    return {"message": "WebSocket Chat is running"}


@ws_chat.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            response = main_agent(data)
            await manager.broadcast(f"BOT: {response}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
