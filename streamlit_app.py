import streamlit as st
import os
import json
from datetime import datetime
import requests
from typing import List, Dict, Any

# Page config
st.set_page_config(
    page_title="AIPL AI ChatBot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark theme
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
        color: #fafafa;
    }
    .stApp {
        background-color: #0e1117;
    }
    .stTextInput > div > div > input {
        background-color: #262730;
        color: #fafafa;
    }
    .stSelectbox > div > div > select {
        background-color: #262730;
        color: #fafafa;
    }
    .stTextArea > div > div > textarea {
        background-color: #262730;
        color: #fafafa;
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
        background-color: #1e1e2e;
        margin-right: 2rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'user_name' not in st.session_state:
    st.session_state.user_name = ""
if 'user_email' not in st.session_state:
    st.session_state.user_email = ""
if 'department' not in st.session_state:
    st.session_state.department = ""
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False

# Login function
def validate_email(email: str) -> bool:
    """Validate company email"""
    allowed_domains = ['@aiplabro.com', '@ajitindustries.com']
    return any(email.endswith(domain) for domain in allowed_domains)

def login_user(name: str, email: str, department: str) -> bool:
    """Login user with validation"""
    if not name or not email or not department:
        return False
    if not validate_email(email):
        return False
    
    st.session_state.user_name = name
    st.session_state.user_email = email
    st.session_state.department = department
    st.session_state.logged_in = True
    
    # Log login
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": "login",
        "user": name,
        "email": email,
        "department": department
    }
    
    # Store in session state (in real app, save to file/database)
    if 'login_logs' not in st.session_state:
        st.session_state.login_logs = []
    st.session_state.login_logs.append(log_entry)
    
    return True

# Chat function (simplified for demo)
def get_chat_response(query: str, department: str) -> str:
    """Get response from AI (simplified version)"""
    # This is a simplified version - in real app, connect to your RAG system
    responses = {
        "hr": "This is an HR-related response. Please contact HR department for more details.",
        "it": "This is an IT-related response. Please contact IT department for more details.",
        "accounts": "This is an Accounts-related response. Please contact Accounts department for more details.",
        "factory": "This is a Factory-related response. Please contact Factory department for more details.",
        "marketing": "This is a Marketing-related response. Please contact Marketing department for more details."
    }
    
    return responses.get(department.lower(), "Thank you for your query. Our team will get back to you soon.")

# Main app
def main():
    # Header
    st.title("🤖 Welcome To AIPL AI ChatBot")
    
    # Time-based greeting
    current_hour = datetime.now().hour
    if 5 <= current_hour < 12:
        greeting = "Good Morning"
    elif 12 <= current_hour < 17:
        greeting = "Good Afternoon"
    else:
        greeting = "Good Evening"
    
    st.markdown(f"**{greeting}!** How can I help you today?")
    
    # Login section
    if not st.session_state.logged_in:
        st.markdown("---")
        st.subheader("🔐 Login Required")
        
        with st.form("login_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                name = st.text_input("Full Name", placeholder="Enter your full name")
                email = st.text_input("Company Email", placeholder="your.email@aiplabro.com")
            
            with col2:
                department = st.selectbox(
                    "Department",
                    ["IT", "HR", "Accounts", "Factory", "Marketing"]
                )
            
            submitted = st.form_submit_button("Login", type="primary")
            
            if submitted:
                if login_user(name, email, department):
                    st.success(f"Welcome {name}! You are now logged in.")
                    st.rerun()
                else:
                    st.error("Please fill all fields and use a valid company email (@aiplabro.com or @ajitindustries.com)")
    
    else:
        # Logged in - show chat interface
        st.markdown("---")
        
        # User info sidebar
        with st.sidebar:
            st.markdown("### 👤 User Info")
            st.write(f"**Name:** {st.session_state.user_name}")
            st.write(f"**Email:** {st.session_state.user_email}")
            st.write(f"**Department:** {st.session_state.department}")
            
            if st.button("Logout"):
                st.session_state.logged_in = False
                st.session_state.messages = []
                st.rerun()
            
            st.markdown("---")
            st.markdown("### 📊 Quick Stats")
            st.write(f"**Messages:** {len(st.session_state.messages)}")
            st.write(f"**Session:** {datetime.now().strftime('%H:%M:%S')}")
        
        # Chat interface
        st.subheader("💬 Chat with AI")
        
        # Display chat messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])
        
        # Chat input
        if prompt := st.chat_input("Ask me anything..."):
            # Add user message
            st.session_state.messages.append({"role": "user", "content": prompt})
            
            # Display user message
            with st.chat_message("user"):
                st.write(prompt)
            
            # Get AI response
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    response = get_chat_response(prompt, st.session_state.department)
                    st.write(response)
            
            # Add AI response
            st.session_state.messages.append({"role": "assistant", "content": response})
            
            # Log the interaction
            if 'chat_logs' not in st.session_state:
                st.session_state.chat_logs = []
            
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "user": st.session_state.user_name,
                "department": st.session_state.department,
                "query": prompt,
                "response": response
            }
            st.session_state.chat_logs.append(log_entry)

if __name__ == "__main__":
    main()
