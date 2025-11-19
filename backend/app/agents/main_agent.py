from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import RedisChatMessageHistory
from sqlalchemy.orm import Session
from app.models.conversations import AgentMemorySummary, Conversation
from dotenv import load_dotenv
from app.prompts.profiles import PROFILES
from app.services.dependencies import DependencyResolver
import uuid
import os

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_POOL = {}
AGENT_POOL = {}


def get_llm(model, temperature):
    key = f"{model}:{temperature}"
    if key not in LLM_POOL:
        LLM_POOL[key] = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model=model,
            temperature=temperature,
        )
    return LLM_POOL[key]


def summarize_history(messages, llm):
    text = "\n".join([f"{m.type.upper()}: {m.content}" for m in messages])
    
    summary_prompt = f"""
    Resume de forma breve y clara la siguiente conversacion.
    Enfocate en los temas tratados y las intenciones del usuario.
    No te extiendas: mantente en los puntos mas importantes.
    Si hay varios temas, resume cada uno de manera corta y clara y menos de 500 carateres en total.

    Conversacion:
    {text}
    """

    return llm.invoke(summary_prompt).content


def build_agent(profile_id: str):
    profile = PROFILES.get(profile_id, PROFILES["default"])
    cache_key = f"{profile_id}:{profile['model']}:{profile['temperature']}"

    if cache_key not in AGENT_POOL:
        llm = get_llm(profile["model"], profile["temperature"])
        prompt = ChatPromptTemplate.from_messages([
            ("system", profile["prompt"]),
            MessagesPlaceholder("messages"),
        ])
        AGENT_POOL[cache_key] = (prompt | llm, llm)

    return AGENT_POOL[cache_key]

def clear_redis_session(user_id: str, session_id: str, profile_id: str):
    """Clear Redis history for a specific session to ensure clean start."""
    redis_session_key = f"user_{user_id}_session_{session_id}_prof_{profile_id}"
    redis_history = RedisChatMessageHistory(
        session_id=redis_session_key,
        url=REDIS_URL,
        ttl=3600 * 12
    )
    redis_history.clear()
    print(f"Cleared Redis history for session: {redis_session_key}")


def main_agent(user_input: str, session_id: str, user_id: str, db: Session) -> str:
    """Agente con memoria corta (Redis) y persistencia de resumen en Supabase."""

    profile_id = DependencyResolver._resolve_profile_id(db, session_id)

    agent, llm = build_agent(profile_id)

    redis_session_key = f"user_{user_id}_session_{session_id}_prof_{profile_id}"
    
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
        summary = summarize_history(redis_history.messages[:10], llm) 

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
