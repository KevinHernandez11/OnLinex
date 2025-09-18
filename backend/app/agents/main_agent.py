from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import create_react_agent
from langchain.memory import ConversationBufferMemory
from ..prompts.default import DEFAULT_PROMPT 
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langgraph import stateGraph
# from  import MessageState
from dotenv import load_dotenv
import os

load_dotenv()


# stateGraph(MessageState)

#Modelo
llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"), model_name="gpt-4.1-2025-04-14", temperature=0)

#Memoria
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

#Prompt
prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(DEFAULT_PROMPT),
    HumanMessagePromptTemplate.from_template("{input}")
])


agent = create_react_agent(
model=llm,
tools=[],
prompt=prompt)


def main_agent(user_input: str) -> str:
    print(f"\n\n\nUser input:\n\n", user_input)
    response = agent.invoke(input=user_input)
    return response
