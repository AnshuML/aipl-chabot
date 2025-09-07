from __future__ import annotations
from typing import List, Tuple
from .agent import get_department_docs, set_tfidf
from sklearn.feature_extraction.text import TfidfVectorizer
from .rag import _embed_texts


async def index_documents(department: str, files: List[Tuple[str, bytes]]) -> int:
    docs = get_department_docs(department)
    to_index = []
    for filename, data in files:
        text = data.decode("utf-8", errors="ignore")
        max_len = 1200
        for i in range(0, len(text), max_len):
            chunk = text[i:i+max_len]
            to_index.append({
                "chunk": chunk,
                "department": department,
                "source": "company",
                "path": filename,
            })
    if not to_index:
        return 0

    embeddings = await _embed_texts([d["chunk"] for d in to_index])

    start_id = len(docs)
    for offset, (doc, emb) in enumerate(zip(to_index, embeddings)):
        doc_id = start_id + offset
        docs.append({"id": doc_id, **doc, "embedding": emb})

    vec = TfidfVectorizer(max_features=20000, ngram_range=(1,2))
    matrix = vec.fit_transform([d["chunk"] for d in docs])
    set_tfidf(department, vec, matrix)

    return len(to_index)
