# AIPL Chatbot Deployment Guide

## 🚀 GitHub Deployment Checklist

### ✅ Pre-Deployment Security Check

1. **API Keys & Secrets**
   - ✅ OpenAI API key is in `api/env.local` (excluded from git)
   - ✅ No hardcoded secrets in code
   - ✅ Environment variables properly configured

2. **Data Files**
   - ✅ `vector_db.json` - Contains document embeddings (excluded from git)
   - ✅ `users.json` - Contains user data (excluded from git)
   - ✅ `faiss_index.bin` - FAISS vector index (excluded from git)
   - ✅ All sensitive data files are in `.gitignore`

3. **Configuration Files**
   - ✅ `docker-compose.yml` - Production-ready
   - ✅ All Dockerfiles are optimized
   - ✅ Frontend builds are configured
   - ✅ API endpoints are properly configured

### 🔧 Environment Setup

1. **Create `.env` file** (copy from `.env.example`):
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-large
CHAT_MODEL=gpt-4o-mini

# Company Configuration
ALLOWED_DEPARTMENTS=IT,HR,Accounts,Factory,Marketing

# Frontend Configuration
VITE_API_URL=http://localhost:8000
VITE_ADMIN_API_URL=http://localhost:8000
```

2. **Install Dependencies**:
```bash
# Backend
cd api
pip install -r requirements.txt

# Admin Frontend
cd admin-frontend
npm install

# Chat Frontend
cd chat-frontend
npm install
```

### 🐳 Docker Deployment

1. **Build and Run**:
```bash
docker-compose up --build
```

2. **Services**:
   - API: http://localhost:8000
   - Chat Frontend: http://localhost:5173
   - Admin Frontend: http://localhost:5174

### 🌐 Production Deployment

1. **Environment Variables**:
   - Set `OPENAI_API_KEY` in your hosting platform
   - Update `VITE_API_URL` to your production API URL
   - Update `VITE_ADMIN_API_URL` to your production API URL

2. **Database Setup** (Future):
   - PostgreSQL for user management
   - Qdrant for vector storage
   - Elasticsearch for BM25 search

3. **Security**:
   - Enable HTTPS
   - Set up proper CORS
   - Implement JWT authentication
   - Use environment variables for all secrets

### 📋 Features Implemented

- ✅ **Hybrid RAG System**: BM25 + Vector search with RRF
- ✅ **Cross-Encoder Reranking**: Advanced relevance scoring
- ✅ **Multi-Department Support**: IT, HR, Accounts, Factory, Marketing
- ✅ **Document Upload**: PDF parsing with OCR fallback
- ✅ **Admin Panel**: Document management, analytics, user management
- ✅ **Login System**: Company email validation
- ✅ **Dark Theme**: Complete dark mode implementation
- ✅ **Analytics**: Real-time usage statistics
- ✅ **Logging**: Comprehensive interaction logging

### 🔒 Security Notes

- All API keys are in environment variables
- No sensitive data in git repository
- Proper CORS configuration
- Input validation on all endpoints
- Error handling without exposing internals

### 📊 Performance

- **Chunking**: 1000 words with 150 overlap
- **Retrieval**: Top 10 BM25 + Top 10 Vector results
- **Reranking**: Cross-encoder on top 20 results
- **Context**: Top 6 chunks to LLM
- **Model**: GPT-4o-mini for cost efficiency

## 🎯 Ready for GitHub Deployment!

All credentials are secure, configurations are production-ready, and the application is fully functional.
