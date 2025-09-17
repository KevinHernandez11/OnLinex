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
