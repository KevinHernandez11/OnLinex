from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.prebuilt import create_react_agent
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.conversations import AgentMemorySummary
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
])


agent = create_react_agent(
model=llm,
tools=[], 
prompt=prompt)


def summarize_history(messages):
    text = "\n".join([f"{m.type.upper()}: {m.content}" for m in messages])
    
    summary_prompt = f"""
    Resume de forma breve y clara la siguiente conversación.
    Enfócate en los temas tratados y las intenciones del usuario.
    Y porfa no te extiendas en el resumen simplemente los puntos más importantes.
    Y la idea central de todos los mensajes y si son variados temas trata de resumirlos todos de manera corta y clara.

    Por ejemplo
    # El usuario quiere aprender sobre inteligencia artificial y pide recomendaciones de libros y cursos.
        O
    # El usuario está interesado en viajar a Japón y busca consejos sobre lugares para visitar y alojamientos.
        O
    # El usuario está planeando una fiesta de cumpleaños y necesita ideas para la decoración, comida y actividades.

    

    Conversación:
    {text}
    """

    return llm.invoke(summary_prompt).content


def main_agent(user_input: str, session_id: str, user_id: str, db: Session) -> str:
    """Agente con memoria corta (Redis) y persistencia de resumen en Supabase."""

    redis_history = RedisChatMessageHistory(
        session_id=f"user_{user_id}_session_{session_id}",
        url=REDIS_URL,
        ttl=3600 * 12
    )

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


    if len(redis_history.messages) >= 10: #
        summary = summarize_history(redis_history.messages[:-5]) 

        conversation = AgentMemorySummary(
            conversation_id=session_id,
            summary=summary
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)


        redis_history.add_ai_message(f"Resumen guardado: {summary[:100]}...")
        redis_history.clear()

    return response
