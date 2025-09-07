import os
import json
from datetime import datetime, timezone
from typing import Any, Dict

LOG_DIR = os.getenv("LOG_DIR", "/app/logs")
LOG_FILE = os.path.join(LOG_DIR, "interactions.jsonl")


def ensure_log_dir() -> None:
    os.makedirs(LOG_DIR, exist_ok=True)


async def log_interaction(payload: Dict[str, Any]) -> None:
    ensure_log_dir()
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **payload,
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


async def log_login(name: str, email: str, user_id: str) -> None:
    """Log user login events"""
    ensure_log_dir()
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": "login",
        "user_name": name,
        "user_email": email,
        "user_id": user_id,
        "login_time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")