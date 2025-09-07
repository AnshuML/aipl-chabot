#!/usr/bin/env python3
"""
Re-index documents with proper PDF parsing
"""
import os
import sys
import asyncio

# Add the api directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.vector_db import get_vector_db
from app.services.index import index_documents

async def reindex_documents():
    print("🔄 Re-indexing documents with proper PDF parsing...")
    
    # Clear existing FAISS database
    vector_db = get_vector_db()
    if os.path.exists("faiss_index.bin"):
        os.remove("faiss_index.bin")
        print("✅ Cleared existing FAISS index")
    
    if os.path.exists("documents.json"):
        os.remove("documents.json")
        print("✅ Cleared existing documents.json")
    
    # Re-initialize the vector database
    vector_db = get_vector_db()
    print("✅ Initialized fresh vector database")
    
    print("\n📋 To re-index your documents:")
    print("1. Go to the Admin Panel: http://localhost:5173")
    print("2. Navigate to the Docs section")
    print("3. Click 'CREATE' and upload your PDF files again")
    print("4. The PDFs will now be properly parsed and indexed")
    
    print("\n🎯 The chatbot should now be able to answer questions about your uploaded documents!")

if __name__ == "__main__":
    asyncio.run(reindex_documents())
