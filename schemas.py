"""The shape of a Digital Twin. Every module codes against this file."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Applicant(BaseModel):
    name: str
    email: str
    unit_type: str                      # e.g. "food_processing"
    district: str
    workers: int


class RequiredDoc(BaseModel):
    doc_type: str                       # e.g. "income_certificate"
    label: str                          # what the applicant sees
    uploaded: bool = False


class ExtractedDoc(BaseModel):
    doc_type: str
    file_path: str
    extracted: dict = {}                # field name -> value read by OCR
    confidence: float = 0.0


class Issue(BaseModel):
    level: Literal["blocking", "warning"]
    code: str                           # e.g. "VALUE_MISMATCH"
    message: str                        # what went wrong, in plain words
    fix: str                            # what the applicant should do


class Readiness(BaseModel):
    percent: int = 0
    blocking: int = 0
    warnings: int = 0


class Stage(BaseModel):
    dept: str                           # e.g. "pollution_board"
    status: Literal["pending", "in_review", "approved", "rejected"] = "pending"
    sla_days: int
    days_used: int = 0
    officer_id: Optional[str] = None


class Risk(BaseModel):
    delay_probability: float = 0.0
    rejection_probability: float = 0.0
    top_reason: str = ""


class TimelineEvent(BaseModel):
    at: datetime
    event: str                          # e.g. "submitted"
    by: str                             # "applicant" | "officer" | "system"


class Decision(BaseModel):
    status: Literal["pending", "approved", "rejected"] = "pending"
    reason: Optional[str] = None
    by: Optional[str] = None


class Twin(BaseModel):
    twin_id: str
    applicant: Applicant
    service_code: str                   # e.g. "FACTORY_REG"
    required_docs: list[RequiredDoc] = []
    eligibility_status: Literal["pass", "fail", "needs_proof"] = "needs_proof"
    documents: list[ExtractedDoc] = []
    issues: list[Issue] = []
    readiness: Readiness = Field(default_factory=Readiness)
    stages: list[Stage] = []
    risk: Risk = Field(default_factory=Risk)
    timeline: list[TimelineEvent] = []
    decision: Decision = Field(default_factory=Decision)
    