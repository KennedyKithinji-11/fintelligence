# app/services/rag_service.py
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
import os

# Lazy loaded — not initialized at import time
_embeddings = None
_vector_store = None
FAISS_PATH = "./faiss_index"

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    return _embeddings

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        if os.path.exists(FAISS_PATH):
            _vector_store = FAISS.load_local(
                FAISS_PATH, get_embeddings(),
                allow_dangerous_deserialization=True
            )
        else:
            _vector_store = FAISS.from_texts(
                ["FinTelligence initialised."], get_embeddings()
            )
    return _vector_store

async def ingest_document(text: str, source_name: str) -> int:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " "]
    )
    chunks = splitter.split_text(text)
    metadatas = [{"source": source_name, "chunk": i} for i in range(len(chunks))]
    store = get_vector_store()
    store.add_texts(chunks, metadatas=metadatas)
    store.save_local(FAISS_PATH)
    return len(chunks)

_rag_prompt = ChatPromptTemplate.from_template("""
You are FinTelligence, an expert financial analyst AI.
Answer the user's question using ONLY the context below.
If the answer is not in the context, say "I don't have enough information
in the uploaded documents to answer this."
Always cite the source document name when referencing information.
NEVER fabricate financial data, prices, or statistics.

Context from financial documents:
{context}

User question: {question}

Provide a structured, professional response with clear reasoning.
""")

async def research_query(question: str) -> dict:
    store = get_vector_store()
    docs = store.similarity_search(question, k=4)
    context = "\n\n---\n\n".join([
        f"[Source: {d.metadata.get('source', 'Unknown')}]\n{d.page_content}"
        for d in docs
    ])
    sources = list({d.metadata.get("source") for d in docs})

    llm = ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
    )
    chain = _rag_prompt | llm
    response = chain.invoke({"context": context, "question": question})
    return {
        "answer": response.content,
        "sources": sources,
        "chunks_used": len(docs),
    }