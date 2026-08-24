import json
from pathlib import Path

_RULEBOOK = json.loads(Path(__file__).with_name("rulebook.json").read_text(encoding="utf-8"))
SERVICES = _RULEBOOK["services"]

OPS = {
    ">=": lambda a, b: a >= b,
    "<=": lambda a, b: a <= b,
    ">":  lambda a, b: a > b,
    "<":  lambda a, b: a < b,
    "==": lambda a, b: a == b,
}


def get_service(service_code: str):
    return next((s for s in SERVICES if s["service_code"] == service_code), None)


def match(need: str, limit: int = 3):
    """Keyword scoring. Swapped for TF-IDF later - same signature."""
    words = set(need.lower().split())
    scored = []
    for s in SERVICES:
        hits = sum(1 for k in s["keywords"] if k in words)
        if hits:
            scored.append({**s, "score": hits})
    return sorted(scored, key=lambda s: s["score"], reverse=True)[:limit]


def check_eligibility(service_code: str, answers: dict):
    """Returns pass / fail / needs_proof plus the rules that decided it."""
    service = get_service(service_code)
    if not service:
        return {"status": "fail", "failed": [], "missing": [],
                "message": "Unknown service"}

    failed, missing = [], []
    for rule in service["rules"]:
        value = answers.get(rule["field"])
        if value is None:
            missing.append(rule)
        elif not OPS[rule["op"]](value, rule["value"]):
            failed.append(rule)

    if failed:
        status = "fail"
    elif missing:
        status = "needs_proof"
    else:
        status = "pass"

    return {"status": status, "failed": failed, "missing": missing}