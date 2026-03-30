# app/routers/research.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth_middleware import get_current_user, require_role
from app.models.user import User, UserRole
from app.services.rag_service import ingest_document, research_query, FAISS_PATH
import io
import os

router = APIRouter(prefix="/research", tags=["research"])


class QueryRequest(BaseModel):
    question: str


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.ANALYST, UserRole.ADMIN)),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")
    try:
        from pypdf import PdfReader          # ← pypdf not PyPDF2
        content = await file.read()
        reader = PdfReader(io.BytesIO(content))
        text = " ".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(422, f"Could not parse PDF: {e}")

    if not text.strip():
        raise HTTPException(422, "PDF appears to be empty or image-only")

    chunk_count = await ingest_document(text, file.filename)
    return {"message": "Document ingested", "chunks": chunk_count, "source": file.filename}


@router.post("/query")
async def query_research(
    body: QueryRequest,
    current_user: User = Depends(require_role(UserRole.ANALYST, UserRole.ADMIN)),
):
    if not body.question.strip():
        raise HTTPException(400, "Question cannot be empty")
    result = await research_query(body.question)
    return result


@router.get("/status")
async def rag_status(current_user: User = Depends(get_current_user)):
    return {
        "index_exists": os.path.exists(FAISS_PATH),
        "ready": True,
    }