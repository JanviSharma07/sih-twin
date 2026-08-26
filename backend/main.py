from fastapi import FastAPI
import auth
from fastapi import Depends
import config
import rulebook
from sample_data import (SAMPLE_TWIN, SAMPLE_SERVICES, SAMPLE_QUEUE,
                         SAMPLE_BOTTLENECKS, SAMPLE_NOTIFICATIONS)

from fastapi import FastAPI, HTTPException
app = FastAPI(
    title=f"{config.APP_NAME} API",
    description=config.APP_DESCRIPTION,
    version=config.API_VERSION,
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "app": config.APP_NAME,
        "tagline": config.APP_TAGLINE,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {"status": "ok", "app": config.APP_NAME}

from pydantic import BaseModel

from schemas import Twin
from sample_data import (SAMPLE_TWIN, SAMPLE_SERVICES,
                         SAMPLE_QUEUE, SAMPLE_BOTTLENECKS)


# ---------- request bodies ----------

class MatchRequest(BaseModel):
    need: str                    # the applicant's sentence


class ApplicationRequest(BaseModel):
    applicant_email: str
    service_code: str


class DecisionRequest(BaseModel):
    action: str                  # "approve" | "reject" | "query"
    reason: str


# ---------- applicant side ----------

class EligibilityRequest(BaseModel):
    service_code: str
    answers: dict


@app.post("/api/match-service")
def match_service(body: MatchRequest):
    return {"need": body.need, "matches": rulebook.match(body.need)}


@app.get("/api/services")
def list_services(category: str | None = None, audience: str | None = None):
    valid_categories = {s["category"] for s in rulebook.SERVICES}
    valid_audiences = {s["audience"] for s in rulebook.SERVICES}

    if category and category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown category '{category}'. Valid: {sorted(valid_categories)}",
        )
    if audience and audience not in valid_audiences:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown audience '{audience}'. Valid: {sorted(valid_audiences)}",
        )

    result = rulebook.SERVICES
    if category:
        result = [s for s in result if s["category"] == category]
    if audience:
        result = [s for s in result if s["audience"] == audience]
    return result


@app.post("/api/eligibility")
def eligibility(body: EligibilityRequest):
    return rulebook.check_eligibility(body.service_code, body.answers)


@app.post("/api/applications")
def create_application(body: ApplicationRequest):
    return {"twin_id": "APP-2026-000417", "status": "created"}


@app.get("/api/twin/{twin_id}", response_model=Twin)
def get_twin(twin_id: str):
    return SAMPLE_TWIN


# ---------- officer side ----------

@app.get("/api/queue")
def officer_queue(user: dict = Depends(auth.officer_only)):
    return sorted(SAMPLE_QUEUE, key=lambda f: f["delay_probability"], reverse=True)


@app.post("/api/applications/{twin_id}/decision")
def record_decision(twin_id: str, body: DecisionRequest,
                    user: dict = Depends(auth.officer_only)):
    return {"twin_id": twin_id, "decision": body.action,
            "reason": body.reason, "by": user["email"]}


@app.get("/api/analytics/bottlenecks")
def bottlenecks(user: dict = Depends(auth.officer_only)):
    return SAMPLE_BOTTLENECKS

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "applicant"


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/auth/register")
def register(body: RegisterRequest):
    user = auth.create_user(body.name, body.email, body.password, body.role)
    return {"user": user, "token": auth.make_token(user)}


@app.post("/api/auth/login")
def login(body: LoginRequest):
    user = auth.authenticate(body.email, body.password)
    return {"user": user, "token": auth.make_token(user)}


@app.get("/api/auth/me")
def me(user: dict = Depends(auth.current_user)):
    return user
@app.get("/api/notifications")
def notifications(user: dict = Depends(auth.current_user)):
    items = sorted(SAMPLE_NOTIFICATIONS, key=lambda n: n["at"], reverse=True)
    return {"unread": sum(1 for n in items if not n["read"]), "items": items}
