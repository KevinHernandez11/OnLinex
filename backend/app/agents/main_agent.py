from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import create_react_agent
from langchain.memory import ConversationBufferMemory
from ..prompts.default import DEFAULT_PROMPT as prompt
from dotenv import load_dotenv
import os

load_dotenv()

# Modelo

llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"), model_name="gpt-4.1-2025-04-14", temperature=0)

# Memoria
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

agent = create_react_agent(
model=llm,
prompt=prompt)


def main_agent(user_input: str) -> str:
    response = agent.invoke(input=user_input, memory=memory)
    return response


print(main_agent("¿Cuál es tu nombre?"))