from fastapi import FastAPI
from app.routes.chat import chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OnLinex", description="Beta OnLinex", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat, prefix="/api")

