from fastapi import FastAPI
from app.sockets.chat_ws import ws_chat
from fastapi.middleware.cors import CORSMiddleware
from app.routes.register import register
from app.routes.login import login
from app.routes.rooms import rooms
from app.routes.complementary_routes import services
from app.sockets.chatbot_ws import chatbot_ws


app = FastAPI(title="OnLinex", description="Beta OnLinex", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_chat, tags=["chat"])
app.include_router(chatbot_ws, prefix="/ai", tags=["chatbot"])
app.include_router(register, prefix="/api/v1", tags=["register"])
app.include_router(login ,prefix="/api/v1", tags=["login"])
app.include_router(rooms, prefix="/api/v1", tags=["rooms"])
app.include_router(services, prefix="/api/v1", tags=["services"])