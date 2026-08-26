"""Email + password auth with roles. Users stored in users.json."""

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SECRET = os.getenv("JWT_SECRET", "dev-secret-change-before-submission")
ALGORITHM = "HS256"
TOKEN_HOURS = 12

USERS_FILE = Path(__file__).with_name("users.json")
bearer = HTTPBearer()


def _load():
    if not USERS_FILE.exists():
        return {}
    return json.loads(USERS_FILE.read_text(encoding="utf-8"))


def _save(users):
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def verify_password(password: str, stored: str) -> bool:
    salt_b64, dk_b64 = stored.split("$")
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(),
                             base64.b64decode(salt_b64), 200_000)
    return hmac.compare_digest(base64.b64encode(dk).decode(), dk_b64)


def create_user(name: str, email: str, password: str, role: str):
    users = _load()
    email = email.lower().strip()
    if email in users:
        raise HTTPException(400, "An account with this email already exists")
    if role not in ("applicant", "officer"):
        raise HTTPException(400, "Role must be 'applicant' or 'officer'")
    if len(password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    users[email] = {
        "name": name,
        "email": email,
        "role": role,
        "password": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _save(users)
    return {"name": name, "email": email, "role": role}


def authenticate(email: str, password: str):
    user = _load().get(email.lower().strip())
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(401, "Wrong email or password")
    return {"name": user["name"], "email": user["email"], "role": user["role"]}


def make_token(user: dict) -> str:
    payload = {
        "sub": user["email"],
        "name": user["name"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = jwt.decode(creds.credentials, SECRET, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    return {"email": payload["sub"], "name": payload["name"], "role": payload["role"]}


def officer_only(user: dict = Depends(current_user)):
    if user["role"] != "officer":
        raise HTTPException(403, "This page is for department officers only")
    return user
