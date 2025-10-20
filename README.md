# OnLinex
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/KevinHernandez11/Onlinex)

OnLinex is a real-time, full-stack chat application that enables users to create and join temporary chat rooms for collaborative discussions. It features both anonymous temporary access and persistent registered user accounts. A standout feature is its integrated conversational AI, powered by LangChain and OpenAI, which offers interactions with distinct AI personalities.

## Key Features

- **Real-Time Chat Rooms**: Create public or private chat rooms with unique, shareable codes. Rooms are automatically cleaned up after 24 hours.
- **Dual User Modes**:
    - **Registered Users**: Full account persistence with a username and password.
    - **Temporary Users**: Quick, anonymous access with a temporary username, valid for 6 hours.
- **Conversational AI Agents**: Engage in real-time conversations with AI agents.
- **Distinct AI Personalities**: Choose from different AI agent profiles, each with a unique persona based on characters like Dante, Lady, and Vergil from Devil May Cry.
- **Persistent AI Conversations**: AI chat history is summarized and stored, allowing you to pick up conversations where you left off.
- **Modern Tech Stack**: Built with a FastAPI backend and a React/TypeScript frontend.
- **Containerized**: Fully containerized with Docker for easy setup and deployment.

## AI Agent Personalities

OnLinex features several AI agents with unique personalities, each powered by custom system prompts to guide their behavior and tone.

- **Dante**: Charismatic, sarcastic, and supremely confident. He brings a rebellious and witty humor to every conversation, often using combat metaphors.
- **Lady**: Strong, realistic, and direct. Her humor is dry and ironic, and she gives practical, no-nonsense advice.
- **Vergil**: Calm, calculated, and philosophical. He speaks with authority and precision, often reflecting on power, discipline, and inner strength.
- **Default**: A professional and empathetic assistant focused on providing helpful and accurate information.

## Tech Stack

### Backend
- **Framework**: FastAPI
- **AI & LLMs**: LangChain, OpenAI
- **Real-Time**: WebSockets
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Caching & History**: Redis (for AI conversation memory)
- **Background Tasks**: Celery (for room cleanup)

### Frontend
- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod for validation

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Git](https://git-scm.com/)
- An [OpenAI API Key](https://platform.openai.com/api-keys)

### Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/KevinHernandez11/Onlinex.git
    cd Onlinex
    ```

2.  **Configure Environment Variables**

    The project uses Docker Compose to manage services and environment variables. Create a `.env` file in the root directory of the project by copying the example:

    ```bash
    cp backend/.env.example.yml .env
    ```

    Now, open the `.env` file and fill in the required values. A typical configuration for local development will look like this:

    ```yml
    # Database Configuration (PostgreSQL)
    # This URL should point to your database instance. For local Docker, you can set up a PostgreSQL service.
    DATABASE_URL="postgresql://user:password@db:5432/onlinex_db"

    # OpenAI API Key
    OPENAI_API_KEY="Your-OpenAI-API-Key"

    # JWT Configuration
    SECRET_KEY="your-super-secret-key-for-jwt" # Change this to a random, strong string
    ALGHORITHM="HS256"
    EXPEDTION_TIME="24"
    TEMP_USER_EXPEDITION_TIME="6"

    # Redis Configuration (points to the Redis service in docker-compose.yml)
    REDIS_URL="redis://redis:6379"

    # Frontend Configuration
    VITE_API_URL=http://localhost:8000
    VITE_WS_URL=ws://localhost:8000
    ```

3.  **Build and Run with Docker**

    From the root directory, run the following command to build the images and start the services:

    ```bash
    docker-compose up --build
    ```

    This will start the following services:
    - `frontend`: The React application, accessible at `http://localhost:5173`.
    - `backend`: The FastAPI server, accessible at `http://localhost:8000`.
    - `redis`: The Redis server for caching.
    - `celery-worker`: The Celery worker for background tasks.
    - `celery-beat`: The Celery scheduler for periodic tasks.

4.  **Access the Application**

    -   Open your browser and navigate to `http://localhost:5173` to use the OnLinex web application.
    -   The backend API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## Project Structure

The repository is organized into a monorepo structure with distinct directories for the backend, frontend, and Docker configuration.

```
.
├── backend/            # FastAPI application source code
│   ├── app/
│   │   ├── agents/     # AI agent logic (LangChain, OpenAI)
│   │   ├── core/       # Core components (Celery)
│   │   ├── db/         # Database setup
│   │   ├── models/     # SQLAlchemy ORM models
│   │   ├── prompts/    # System prompts for AI personalities
│   │   ├── routes/     # API endpoints
│   │   ├── schemas/    # Pydantic data schemas
│   │   ├── services/   # Business logic (Auth, Rooms)
│   │   ├── sockets/    # WebSocket connection managers
│   │   └── tasks/      # Celery background tasks
│   ├── main.py         # FastAPI app entry point
│   └── requirements.txt
│
├── frontend/           # React application source code
│   ├── public/
│   └── src/
│       ├── components/ # UI components (Auth, Rooms, AI Chat)
│       ├── context/    # React context for session management
│       ├── hooks/      # Custom React hooks
│       ├── lib/        # Utility functions
│       └── pages/      # Application pages/views
│
├── docker/             # Docker configuration files
│   ├── backend.dockerfile
│   ├── frontend.dockerfile
│   └── docker-compose.yml
│
└── README.md
```

## API Endpoints & WebSockets

### Authentication
- `POST /api/v1/register`: Create a new persistent user account.
- `POST /api/v1/login`: Log in a registered user.
- `POST /api/v1/login/temporal/`: Create a temporary, anonymous user session.

### Rooms
- `POST /api/v1/rooms`: Create a new chat room.
- `GET /api/v1/rooms/join`: Join an existing chat room using its code.
- `GET /api/v1/room/search`: Find a public room to join based on language.
- `POST /api/v1/rooms/{room_code}/leave`: Leave a chat room.

### AI Chat
- `POST /api/v1/conversations`: Create a new conversation session with an AI agent.

### WebSockets
- `ws /ws/chat/{room_code}`: Real-time messaging endpoint for chat rooms.
- `ws /ai/ws/chat/{conversation_id}`: Real-time messaging endpoint for interacting with an AI agent.
