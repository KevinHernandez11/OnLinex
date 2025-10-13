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


# Create a simple agent without ReAct for better prompt control
agent = prompt | llm


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


def clear_redis_session(user_id: str, session_id: str):
    """Clear Redis history for a specific session to ensure clean start."""
    redis_session_key = f"user_{user_id}_session_{session_id}"
    redis_history = RedisChatMessageHistory(
        session_id=redis_session_key,
        url=REDIS_URL,
        ttl=3600 * 12
    )
    redis_history.clear()
    print(f"Cleared Redis history for session: {redis_session_key}")


def main_agent(user_input: str, session_id: str, user_id: str, db: Session) -> str:
    """Agente con memoria corta (Redis) y persistencia de resumen en Supabase."""

    # Create a unique session key to ensure proper isolation
    redis_session_key = f"user_{user_id}_session_{session_id}"
    
    redis_history = RedisChatMessageHistory(
        session_id=redis_session_key,
        url=REDIS_URL,
        ttl=3600 * 12
    )
    
    # Check if there are any messages that don't belong to this conversation
    # If we detect contamination, clear the history
    if len(redis_history.messages) > 0:
        # for i, msg in enumerate(redis_history.messages):
        #     print(f"Message {i}: {msg.type} - {msg.content[:100]}...")
        
        # If the first message is not from the current user input, clear history
        if len(redis_history.messages) > 0 and redis_history.messages[0].type == "ai":
            print("\nDetected contamination in Redis history. Clearing...")
            redis_history.clear()

    # Add user message to history
    redis_history.add_user_message(user_input)
    
    # Get all messages from history
    messages = redis_history.messages
    
    # Invoke agent with messages
    response = agent.invoke({"messages": messages})
    
    # Extract content from response
    if hasattr(response, 'content'):
        response_content = response.content
    else:
        response_content = str(response)
    
    # Add AI response to history
    redis_history.add_ai_message(response_content)

    if len(redis_history.messages) >= 10:
        summary = summarize_history(redis_history.messages[:10]) 

        # Save summary to database
        conversation = AgentMemorySummary(
            conversation_id=session_id,
            summary=summary
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        # Clear old messages but keep recent ones for context
        messages_to_keep = redis_history.messages[10:]
        redis_history.clear()
        
        # Add back the recent messages to maintain some context
        for msg in messages_to_keep:
            if msg.type == "human":
                redis_history.add_user_message(msg.content)
            elif msg.type == "ai":
                redis_history.add_ai_message(msg.content)

    return response_content
