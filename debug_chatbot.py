#!/usr/bin/env python3
"""
Debug chatbot functionality
"""
import requests
import json

API_BASE = "http://localhost:8000"

def test_chatbot():
    print("🔍 Debugging Chatbot Issue")
    print("=" * 40)
    
    # Test 1: Check if API is responding
    print("\n1. Testing API Health...")
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"✅ API Health: {response.status_code}")
    except Exception as e:
        print(f"❌ API Health Error: {e}")
        return
    
    # Test 2: Check departments
    print("\n2. Testing Departments...")
    try:
        response = requests.get(f"{API_BASE}/departments")
        if response.status_code == 200:
            depts = response.json()
            print(f"✅ Available Departments: {depts}")
        else:
            print(f"❌ Departments Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Departments Error: {e}")
    
    # Test 3: Check documents in HR department
    print("\n3. Testing HR Documents...")
    try:
        response = requests.get(f"{API_BASE}/admin/docs")
        if response.status_code == 200:
            docs = response.json()
            hr_docs = [d for d in docs if d.get('department') == 'HR']
            print(f"✅ HR Documents: {len(hr_docs)}")
            for doc in hr_docs:
                print(f"   - {doc.get('title', 'Unknown')}: {doc.get('chunk', '')[:100]}...")
        else:
            print(f"❌ Documents Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Documents Error: {e}")
    
    # Test 4: Test chat with detailed error info
    print("\n4. Testing Chat with HR Department...")
    try:
        response = requests.post(f"{API_BASE}/chat", json={
            "user": "test_user",
            "department": "HR",
            "query": "What is the attendance policy?",
            "language": "en"
        })
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat Response: {result}")
        else:
            print(f"❌ Chat Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Chat Exception: {e}")
    
    # Test 5: Test with a simple query
    print("\n5. Testing Simple Query...")
    try:
        response = requests.post(f"{API_BASE}/chat", json={
            "user": "test_user",
            "department": "HR",
            "query": "attendance",
            "language": "en"
        })
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Simple Query Response: {result}")
        else:
            print(f"❌ Simple Query Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Simple Query Exception: {e}")

if __name__ == "__main__":
    test_chatbot()
