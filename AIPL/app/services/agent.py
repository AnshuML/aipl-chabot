from __future__ import annotations
import threading
from typing import Any, Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer

# In-memory document store per department
# Each doc: {id, chunk, department, source, path, embedding: List[float]}
DOCUMENTS: dict[str, list[Dict[str, Any]]] = {}

# TF-IDF state per department
_TFIDF: dict[str, Tuple[TfidfVectorizer, Any]] = {}
_LOCK = threading.Lock()

async def init_backends() -> None:
    global DOCUMENTS, _TFIDF
    with _LOCK:
        DOCUMENTS = {}
        _TFIDF = {}


def get_department_docs(dept: str) -> list[Dict[str, Any]]:
    return DOCUMENTS.setdefault(dept, [])


def set_tfidf(dept: str, vec: TfidfVectorizer, matrix: Any) -> None:
    with _LOCK:
        _TFIDF[dept] = (vec, matrix)


def get_tfidf(dept: str) -> Tuple[TfidfVectorizer | None, Any | None]:
    return _TFIDF.get(dept, (None, None))


async def retrieve_docs(department: str, query: str) -> List[Dict[str, Any]]:
    raise NotImplementedError


async def summarize_docs(docs: List[Dict[str, Any]]) -> str:
    return "\n\n".join(d.get("chunk", "") for d in docs)[:4000]


async def query_sql(sql: str) -> List[Dict[str, Any]]:
    return []
