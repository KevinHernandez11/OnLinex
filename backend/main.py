from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.sockets.chat_ws import ws_chat
from app.routes.register import register
from app.routes.login import login
from app.routes.rooms import rooms
from app.routes.complementary_routes import services
from app.sockets.chatbot_ws import chatbot_ws

app = FastAPI(
    title="OnLinex",
    description="Beta OnLinex",
    version="0.1.0",
)

# CORS CONFIG
origins = [
    "http://localhost:5173",              # frontend local
    "https://onlinex.vercel.app",         # frontend producción (Vercel)
    "https://onlinex.onrender.com",       # backend producción (Render)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],     # GET, POST, OPTIONS, DELETE, WS...
    allow_headers=["*"],     # Authorization, Content-Type, etc.
)

# ROUTERS
app.include_router(ws_chat, tags=["chat"])
app.include_router(chatbot_ws, prefix="/ai", tags=["chatbot"])
app.include_router(register, prefix="/api/v1", tags=["register"])
app.include_router(login, prefix="/api/v1", tags=["login"])
app.include_router(rooms, prefix="/api/v1", tags=["rooms"])
app.include_router(services, prefix="/api/v1", tags=["services"])
