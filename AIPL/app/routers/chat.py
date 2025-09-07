from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.rag import answer_query, get_welcome_message
from ..services.logging_utils import log_interaction, log_login
from datetime import datetime
import re

router = APIRouter(prefix="", tags=["chat"])

class ChatRequest(BaseModel):
    user: str
    department: str
    query: str
    language: str | None = None

class ChatResponse(BaseModel):
    answer: str

class WelcomeResponse(BaseModel):
    title: str
    subtitle: str
    greeting: str
    is_welcome: bool

class LoginRequest(BaseModel):
    name: str
    email: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: str | None = None

@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    """Login with name and company email validation"""
    try:
        # Validate email domain
        allowed_domains = ["@aiplabro.com", "@ajitindustries.com"]
        email_domain = None
        for domain in allowed_domains:
            if req.email.lower().endswith(domain):
                email_domain = domain
                break
        
        if not email_domain:
            return LoginResponse(
                success=False,
                message=f"Only company emails are allowed. Please use @aiplabro.com or @ajitindustries.com"
            )
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, req.email):
            return LoginResponse(
                success=False,
                message="Please enter a valid email address"
            )
        
        # Validate name
        if not req.name.strip() or len(req.name.strip()) < 2:
            return LoginResponse(
                success=False,
                message="Please enter a valid name (at least 2 characters)"
            )
        
        # Generate user ID
        user_id = f"{req.name.strip().replace(' ', '_').lower()}_{req.email.split('@')[0]}"
        
        # Log the login
        await log_login(req.name.strip(), req.email, user_id)
        
        return LoginResponse(
            success=True,
            message="Login successful! Welcome to AIPL AI ChatBot",
            user_id=user_id
        )
        
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/welcome", response_model=WelcomeResponse)
async def get_welcome():
    """Get welcome message for the chatbot"""
    try:
        welcome_data = get_welcome_message()
        return WelcomeResponse(**welcome_data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        result = await answer_query(req.user, req.department, req.query, req.language)
        await log_interaction(result)
        return ChatResponse(answer=result["answer"]) 
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
