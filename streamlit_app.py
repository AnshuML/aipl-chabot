import streamlit as st
import requests
import json
from datetime import datetime
import os

# Page config
st.set_page_config(
    page_title="AIPL Chatbot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark theme
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
        color: white;
    }
    .stTextInput > div > div > input {
        background-color: #262730;
        color: white;
    }
    .stSelectbox > div > div > select {
        background-color: #262730;
        color: white;
    }
    .stButton > button {
        background-color: #ff4b4b;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
    }
    .stButton > button:hover {
        background-color: #ff6b6b;
    }
    .chat-message {
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 10px;
        border-left: 4px solid #ff4b4b;
    }
    .user-message {
        background-color: #262730;
        margin-left: 2rem;
    }
    .bot-message {
        background-color: #1e1e1e;
        margin-right: 2rem;
    }
</style>
""", unsafe_allow_html=True)

# API Configuration
API_BASE = os.getenv("API_BASE", "http://localhost:8000")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user_info" not in st.session_state:
    st.session_state.user_info = None

# Sidebar for user info
with st.sidebar:
    st.title("🤖 AIPL Chatbot")
    st.markdown("---")
    
    # User login form
    if not st.session_state.user_info:
        st.subheader("Login")
        name = st.text_input("Name", placeholder="Enter your name")
        email = st.text_input("Email", placeholder="your.email@aiplabro.com")
        department = st.selectbox(
            "Department",
            ["IT", "HR", "Accounts", "Factory", "Marketing"]
        )
        
        if st.button("Login"):
            if name and email and department:
                # Validate email domain
                if "@aiplabro.com" in email or "@ajitindustries.com" in email:
                    st.session_state.user_info = {
                        "name": name,
                        "email": email,
                        "department": department
                    }
                    st.success(f"Welcome {name}!")
                    st.rerun()
                else:
                    st.error("Please use company email (@aiplabro.com or @ajitindustries.com)")
            else:
                st.error("Please fill all fields")
    else:
        st.subheader(f"Welcome, {st.session_state.user_info['name']}!")
        st.write(f"**Department:** {st.session_state.user_info['department']}")
        st.write(f"**Email:** {st.session_state.user_info['email']}")
        
        if st.button("Logout"):
            st.session_state.user_info = None
            st.session_state.messages = []
            st.rerun()
    
    st.markdown("---")
    st.markdown("### 📊 Quick Stats")
    st.metric("Total Messages", len(st.session_state.messages))
    st.metric("Department", st.session_state.user_info['department'] if st.session_state.user_info else "N/A")

# Main chat interface
if st.session_state.user_info:
    st.title("💬 AIPL Chatbot")
    st.markdown("Ask me anything about your company documents!")
    
    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("Type your message here..."):
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get bot response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                try:
                    # Call your API
                    response = requests.post(f"{API_BASE}/chat", json={
                        "user": st.session_state.user_info['name'],
                        "department": st.session_state.user_info['department'],
                        "query": prompt,
                        "language": "English"
                    }, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        answer = data.get("answer", "Sorry, I couldn't process your request.")
                        
                        # Display bot response
                        st.markdown(answer)
                        
                        # Add bot message to chat history
                        st.session_state.messages.append({"role": "assistant", "content": answer})
                    else:
                        error_msg = f"API Error: {response.status_code}"
                        st.error(error_msg)
                        st.session_state.messages.append({"role": "assistant", "content": error_msg})
                        
                except requests.exceptions.RequestException as e:
                    error_msg = f"Connection Error: {str(e)}"
                    st.error(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})
    
    # Clear chat button
    if st.button("🗑️ Clear Chat"):
        st.session_state.messages = []
        st.rerun()

else:
    st.title("🤖 AIPL Chatbot")
    st.markdown("""
    ## Welcome to AIPL Chatbot!
    
    This is an AI-powered chatbot that can answer questions about your company documents.
    
    ### Features:
    - 📚 Document-based answers
    - 🏢 Multi-department support
    - 🔍 Advanced search capabilities
    - 📊 Analytics and insights
    
    ### How to use:
    1. **Login** using your company email
    2. **Select your department**
    3. **Start chatting** with the bot
    4. **Ask questions** about company policies, procedures, or any uploaded documents
    
    ### Supported Departments:
    - IT
    - HR
    - Accounts
    - Factory
    - Marketing
    
    **Please login using the sidebar to start chatting!**
    """)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>© 2024 AIPL Group - AI-Powered Chatbot</p>
</div>
""", unsafe_allow_html=True)
