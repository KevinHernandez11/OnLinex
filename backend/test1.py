# 🔹 Opción 3: httpx + pytest-asyncio (para pruebas asíncronas)

# Muy útil si quieres probar WebSockets y endpoints async.

# Ejemplo rápido:

# import pytest
# from httpx import AsyncClient
# from app.main import app

# @pytest.mark.asyncio
# async def test_async_home():
#     async with AsyncClient(app=app, base_url="http://test") as client:
#         response = await client.get("/")
#     assert response.status_code == 200


import time
import sys

def escribir(texto, delay=0.03):
    for letra in texto:
        sys.stdout.write(letra)
        sys.stdout.flush()
        time.sleep(delay)
    print()

escribir("Hola Kevin, estoy pensando paso a paso...")


# <!DOCTYPE html>
# <html lang="es">
# <head>
#   <meta charset="UTF-8" />
#   <title>Chat Rooms - Demo</title>
#   <style>
#     body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
#     #chat { border: 1px solid #ccc; background: white; padding: 10px; height: 300px; overflow-y: auto; margin-top: 10px; }
#     #message { width: 80%; }
#     button { margin-left: 5px; }
#     .system { color: gray; }
#     .user { color: blue; }
#   </style>
# </head>
# <body>
#   <h1>Chat Rooms Demo</h1>

#   <h2>Crear sala</h2>
#   <input type="text" id="roomName" placeholder="Nombre de la sala" />
#   <button onclick="createRoom()">Crear</button>
#   <p id="createdRoom"></p>

#   <h2>Entrar a sala</h2>
#   <input type="text" id="roomCode" placeholder="Código de la sala" />
#   <button onclick="joinRoom()">Entrar</button>

#   <div id="chat"></div>

#   <h2>Enviar mensaje</h2>
#   <input type="text" id="message" placeholder="Escribe tu mensaje..." />
#   <button onclick="sendMessage()">Enviar</button>

#   <script>
#     let ws = null;

#     async function createRoom() {
#       const name = document.getElementById("roomName").value;
#       const res = await fetch("http://localhost:8000/api/v1/rooms", {
#         method: "POST",
#         headers: { "Content-Type": "application/json" },
#         body: JSON.stringify({ name, is_public: true, capacity: 10, language: "es" })
#       });
#       const data = await res.json();
#       document.getElementById("createdRoom").innerText = "Código creado: " + data.code;
#       document.getElementById("roomCode").value = data.code;
#     }

#     function joinRoom() {
#       const roomCode = document.getElementById("roomCode").value;
#       if (!roomCode) return alert("Pon un código de sala");
#       ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomCode}`);
#       ws.onopen = () => addMessage("system", "Conectado a sala " + roomCode);
#       ws.onmessage = (event) => addMessage("user", event.data);
#       ws.onclose = () => addMessage("system", "Conexión cerrada");
#     }

#     function sendMessage() {
#       const msg = document.getElementById("message").value;
#       if (ws && ws.readyState === WebSocket.OPEN) {
#         ws.send(msg);
#         addMessage("me", "Yo: " + msg);
#         document.getElementById("message").value = "";
#       }
#     }

#     function addMessage(sender, text) {
#       const chat = document.getElementById("chat");
#       const p = document.createElement("p");
#       p.className = sender;
#       p.innerText = text;
#       chat.appendChild(p);
#       chat.scrollTop = chat.scrollHeight;
#     }
#   </script>
# </body>
# </html>
