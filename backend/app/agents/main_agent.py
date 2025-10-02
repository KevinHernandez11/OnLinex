from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.prebuilt import create_react_agent
# from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.rooms import RoomMessage
from app.prompts.default import DEFAULT_PROMPT
from dotenv import load_dotenv
import os

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4.1-2025-04-14", temperature=0.7)

prompt = ChatPromptTemplate.from_messages([
    ("system", DEFAULT_PROMPT),
    MessagesPlaceholder("messages"),
    ("human", "{input}")
])

agent = create_react_agent(
model=llm,
tools=[], 
prompt=prompt)


# Función para resumir conversación
def summarize_history(messages):
    text = "\n".join([f"{m.type.upper()}: {m.content}" for m in messages])
    summary_prompt = f"""
    Resume de forma breve y clara la siguiente conversación.
    Enfócate en los temas tratados y las intenciones del usuario.

    Conversación:
    {text}
    """

    return llm.invoke(summary_prompt).content


# --- Main agent con Redis + Supabase ---
def main_agent(user_input: str, session_id: str, user_id: str, db: Session) -> str:
    """Agente con memoria corta (Redis) y persistencia de resumen en Supabase."""

    redis_history = RedisChatMessageHistory(
        session_id=f"user_{user_id}_session_{session_id}",
        url=REDIS_URL,
        ttl=3600 * 12
    )

    # 2️⃣ Crear agente con memoria temporal
    agent_with_history = RunnableWithMessageHistory(
        agent,
        lambda _: redis_history,
        input_messages_key="input",
        history_messages_key="messages"
    )

    response = agent_with_history.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}},
    )


    if len(redis_history.messages) >= 10:
        db = next(get_db())
        summary = summarize_history(redis_history.messages[:-5])

        conversation = RoomMessage(
            user_id=user_id,
            session_id=session_id,
            summary=summary
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        redis_history.clear()
        redis_history.add_ai_message(f"Resumen guardado: {summary[:100]}...")

    return response
