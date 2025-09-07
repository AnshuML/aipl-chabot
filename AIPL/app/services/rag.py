import os
import asyncio
from typing import Any, Dict, List
from .agent import get_department_docs, get_tfidf
from langchain_openai import ChatOpenAI
from openai import OpenAI
import numpy as np
from numpy.linalg import norm
from datetime import datetime

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
ALLOWED_DEPARTMENTS = [d.strip() for d in os.getenv("ALLOWED_DEPARTMENTS", "IT,HR,Accounts,Factory,Marketing").split(",")]

_client: OpenAI | None = None

def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI()
    return _client


def _embed_texts_sync(texts: List[str]) -> List[List[float]]:
    client = _get_client()
    resp = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [list(d.embedding) for d in resp.data]


async def _embed_texts(texts: List[str]) -> List[List[float]]:
    return await asyncio.to_thread(_embed_texts_sync, texts)


def _cos(a: np.ndarray, b: np.ndarray) -> float:
    na = norm(a)
    nb = norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(a.dot(b) / (na * nb))


def get_welcome_message() -> Dict[str, Any]:
    """Generate welcome message with time-based greeting"""
    now = datetime.now()
    hour = now.hour
    
    if 5 <= hour < 12:
        greeting = "Good morning!"
    elif 12 <= hour < 17:
        greeting = "Good afternoon!"
    elif 17 <= hour < 21:
        greeting = "Good evening!"
    else:
        greeting = "Good night!"
    
    welcome_data = {
        "title": "Welcome To AIPL AI ChatBot",
        "subtitle": "AIPL Group",
        "greeting": greeting,
        "is_welcome": True
    }
    
    return welcome_data


async def _tfidf_search(department: str, query: str, k: int = 20) -> List[Dict[str, Any]]:
    vec, matrix = get_tfidf(department)
    docs = get_department_docs(department)
    if vec is None or matrix is None or not len(docs):
        return []
    qv = vec.transform([query])
    sims = (matrix @ qv.T).toarray().ravel()
    top_idx = np.argsort(-sims)[:k]
    out: List[Dict[str, Any]] = []
    for i in top_idx:
        d = docs[int(i)]
        out.append({"id": d["id"], "score": float(sims[int(i)]), **d})
    return out


async def _vector_search(department: str, query: str, k: int = 20) -> List[Dict[str, Any]]:
    docs = get_department_docs(department)
    if not docs:
        return []
    [qvec] = await _embed_texts([query])
    q = np.array(qvec)
    sims = []
    for d in docs:
        emb = np.array(d.get("embedding") or [])
        sims.append(_cos(q, emb))
    sims_np = np.array(sims)
    top_idx = np.argsort(-sims_np)[:k]
    out: List[Dict[str, Any]] = []
    for i in top_idx:
        d = docs[int(i)]
        out.append({"id": d["id"], "score": float(sims_np[int(i)]), **d})
    return out


def _rrf(f1: List[Dict[str, Any]], f2: List[Dict[str, Any]], k: int = 60) -> List[Dict[str, Any]]:
    id_to_score: dict[str, float] = {}
    id_to_doc: dict[str, Dict[str, Any]] = {}
    for ranked in (f1, f2):
        for rank, doc in enumerate(ranked, start=1):
            doc_id = str(doc.get("id"))
            id_to_doc[doc_id] = doc
            id_to_score[doc_id] = id_to_score.get(doc_id, 0.0) + 1.0 / (k + rank)
    fused = sorted(id_to_doc.values(), key=lambda d: id_to_score[str(d.get("id"))], reverse=True)
    return fused


def _mmr(query_vec: List[float], candidates: List[Dict[str, Any]], lambda_mult: float = 0.7, top_k: int = 8) -> List[Dict[str, Any]]:
    if not candidates:
        return []
    q = np.array(query_vec)
    selected: list[int] = []
    cand_embs = [np.array(c.get("embedding") or []) for c in candidates]
    remaining = list(range(len(candidates)))
    while len(selected) < min(top_k, len(candidates)) and remaining:
        mmr_scores: list[tuple[int, float]] = []
        for idx in remaining:
            sim_to_query = _cos(q, cand_embs[idx])
            if not selected:
                div = 0.0
            else:
                div = max(_cos(cand_embs[idx], cand_embs[j]) for j in selected)
            score = lambda_mult * sim_to_query - (1 - lambda_mult) * div
            mmr_scores.append((idx, score))
        mmr_scores.sort(key=lambda t: t[1], reverse=True)
        best_idx = mmr_scores[0][0]
        selected.append(best_idx)
        remaining.remove(best_idx)
    return [candidates[i] for i in selected]


async def _rerank(query: str, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not docs:
        return []
    tokens = set(query.lower().split())
    def score(d: Dict[str, Any]) -> float:
        text = (d.get("chunk") or "").lower()
        overlap = sum(1 for t in tokens if t in text)
        return overlap + min(len(text) / 5000.0, 1.0)
    return sorted(docs, key=score, reverse=True)


def _guardrails_filter(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [d for d in docs if d.get("source") == "company"]


async def answer_query(user: str, department: str, query: str, language: str | None) -> Dict[str, Any]:
    if department not in ALLOWED_DEPARTMENTS:
        raise ValueError("Invalid department")

    bm25_like, vect = await asyncio.gather(
        _tfidf_search(department, query, k=20),
        _vector_search(department, query, k=20),
    )
    fused = _rrf(bm25_like, vect)
    [qvec] = await _embed_texts([query])
    diverse = _mmr(qvec, fused, lambda_mult=0.7, top_k=8)
    filtered = _guardrails_filter(diverse)
    reranked = await _rerank(query, filtered)

    context = "\n\n".join(d.get("chunk", "") for d in reranked[:6])

    system = (
        "You are AIPL's internal chatbot. Answer ONLY from the provided company docs. "
        "If information is missing, say you don't know and suggest uploading more docs."
    )
    prompt = f"System: {system}\n\nContext:\n{context}\n\nUser ({department}): {query}\nAnswer:"

    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    completion = await llm.ainvoke(prompt)
    answer_text = completion.content or ""

    payload = {
        "user": user,
        "department": department,
        "query": query,
        "docs_used": reranked[:6],
        "answer": answer_text,
    }
    return payload
