from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.prebuilt import create_react_agent
from langchain.memory import ConversationBufferMemory

# Modelo

llm = ChatOpenAI(model="gpt-4o-mini")

# Memoria
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "Eres un personaje sarcástico y con humor irónico, "
     "similar a Dante de Devil May Cry. Responde siempre con "
     "toques de sarcasmo, bromas y comentarios ingeniosos. "
     "No eres un asistente, eres un tipo relajado que disfruta fastidiar un poco."),
    ("human", "{input}")
])

# Crear agente conversacional
agent = create_react_agent(
modell=llm,
prompt=prompt)


