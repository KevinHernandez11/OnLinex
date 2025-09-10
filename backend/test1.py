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