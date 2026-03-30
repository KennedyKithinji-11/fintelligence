# FinTelligence — AI Financial Intelligence Platform

A full-stack, enterprise-grade financial dashboard with real-time market data, 
AI-powered research, and risk alert management.

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, WebSockets
- **Backend:** Python, FastAPI, SQLAlchemy, JWT Auth, RBAC
- **AI:** LangChain RAG pipeline, FAISS vector store, HuggingFace Embeddings, Groq/Llama3
- **Infrastructure:** PostgreSQL, Redis, Docker Compose

## Features
- 🔴 Live market ticker with real-time WebSocket price feed
- 🤖 AI Research Assistant — upload PDFs, ask questions, get cited answers
- ⚡ Real-time risk alerts with AI-generated commentary
- 🔐 Full JWT authentication with role-based access control (viewer/analyst/admin)
- 📋 Compliance audit logging

## Running Locally
```bash
# Start databases
docker compose up postgres redis -d

# Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install && npm run dev
```

## Live Demo
[Link coming soon]