from fastapi import FastAPI

from app.sockets.chat_ws import ws_chat
from fastapi.middleware.cors import CORSMiddleware
from app.routes.register import register
app = FastAPI(title="OnLinex", description="Beta OnLinex", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_chat, prefix="/API")
app.include_router(register)

