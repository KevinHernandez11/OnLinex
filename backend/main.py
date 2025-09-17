from fastapi import FastAPI
from app.sockets.chat_ws import ws_chat
from fastapi.middleware.cors import CORSMiddleware
from app.routes.register import register
from app.routes.login import login
app = FastAPI(title="OnLinex", description="Beta OnLinex", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_chat, prefix="/ws", tags=["chat"])
app.include_router(register, prefix="/api/v1", tags=["register"])
app.include_router(login ,prefix="/api/v1", tags=["login"])
