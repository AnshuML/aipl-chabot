# AIPL Chatbot Monorepo

Production-ready enterprise chatbot with hybrid RAG, agentic tools, and React UI.

## Services

- `api`: FastAPI (Python 3.11) backend with hybrid retrieval (OpenSearch BM25 + Qdrant vectors), RRF + MMR, reranker (bge-reranker-large), agentic tools, and JSONL logging.
- `chat-frontend`: React + Vite + Tailwind + shadcn/ui front-end with mock SSO, department and language selection, and chat interface.
- `deploy/helm/aipl-chatbot`: Helm chart for minikube/Kubernetes deploy.

## Quickstart (Local)

1. Prerequisites
   - Docker Desktop
   - Node.js 18+
   - Python 3.11+

2. Environment
   - Copy `.env.example` to `.env` and set secrets.
   - Required variables:
     - `OPENAI_API_KEY` (for GPT-4o)
     - Optional fallback: `TOGETHER_API_KEY` or `OPENROUTER_API_KEY`
     - `BGE_RERANKER_MODEL` (default: `BAAI/bge-reranker-large` – use `BAAI/bge-reranker-base` on low-memory dev machines)

3. Start stack

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000
- Qdrant: http://localhost:6333
- OpenSearch: http://localhost:9200 (user: admin, pass: admin)

4. Mock SSO

- Open frontend, enter any username to log in
- Username displays top-right

5. Upload sample docs

- Use the frontend upload dialog or POST `/upload` with `.txt`/`.md` files
- Indexing populates OpenSearch (BM25) and Qdrant (vectors)

6. Chat

- Ask questions confined to uploaded company documents
- Cross-department questions will trigger agentic multi-step retrieval

## Development

- Frontend
```bash
cd chat-frontend
npm install
npm run dev
```

- Backend
```bash
cd api
python -m venv .venv && . .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Tests & Lint

- GitHub Actions runs lint, tests, docker build, and deploy-to-staging workflow
- Local (optional):
```bash
cd api && ruff check . && pytest
cd chat-frontend && npm run lint && npm run build
```

## Kubernetes (minikube)

```bash
minikube start
helm upgrade --install aipl deploy/helm/aipl-chatbot \
  --set image.api.tag=local --set image.frontend.tag=local
kubectl get pods
```

## Environment Variables (.env)

- `OPENAI_API_KEY`
- `TOGETHER_API_KEY` (optional fallback for Llama-3.1-70B)
- `OPENROUTER_API_KEY` (optional fallback)
- `BGE_RERANKER_MODEL` (default `BAAI/bge-reranker-large`)
- `EMBEDDING_MODEL` (default `BAAI/bge-m3`)
- `ALLOWED_DEPARTMENTS` (default: `IT,HR,Accounts,Factory,Marketing`)

## Notes

- Reranker `bge-reranker-large` requires significant RAM; use `BAAI/bge-reranker-base` locally if needed.
- PDF support is not enabled by default; convert PDFs to `.txt` for indexing, or add `pypdf` and extraction.

#cd admin-frontend && npm run dev
#cd chat-frontend && npm run dev
#cd api && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

#cd api && python test_accuracy_improvements.py
#https://github.com/AnshuML/aipl-chabot.git
