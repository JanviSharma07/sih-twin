from datetime import datetime

SAMPLE_TWIN = {
    "twin_id": "APP-2026-000417",
    "applicant": {
        "name": "Ravi Deshmukh",
        "email": "ravi@example.com",
        "unit_type": "food_processing",
        "district": "Pune",
        "workers": 12,
    },
    "service_code": "FACTORY_REG",
    "required_docs": [
        {"doc_type": "pan", "label": "PAN card", "uploaded": True},
        {"doc_type": "udyam", "label": "Udyam registration", "uploaded": True},
        {"doc_type": "site_plan", "label": "Site plan", "uploaded": True},
        {"doc_type": "ca_certificate", "label": "CA investment certificate", "uploaded": True},
        {"doc_type": "fire_noc", "label": "Fire NOC", "uploaded": False},
    ],
    "eligibility_status": "needs_proof",
    "documents": [
        {
            "doc_type": "ca_certificate",
            "file_path": "uploads/417_ca.pdf",
            "extracted": {"investment": 3200000},
            "confidence": 0.91,
        }
    ],
    "issues": [
        {
            "level": "blocking",
            "code": "VALUE_MISMATCH",
            "message": "Investment in your form is 24,00,000 but the CA certificate says 32,00,000",
            "fix": "Correct the form or upload a revised certificate",
        },
        {
            "level": "blocking",
            "code": "MISSING_DOC",
            "message": "Fire NOC has not been uploaded",
            "fix": "Upload the Fire NOC issued by the local fire office",
        },
    ],
    "readiness": {"percent": 79, "blocking": 2, "warnings": 0},
    "stages": [
        {"dept": "labour_dept", "status": "approved", "sla_days": 10, "days_used": 6},
        {"dept": "pollution_board", "status": "in_review", "sla_days": 15,
         "days_used": 4, "officer_id": "OFF-22"},
    ],
    "risk": {
        "delay_probability": 0.78,
        "rejection_probability": 0.21,
        "top_reason": "Pollution Board queue is longer than usual this month",
    },
    "timeline": [
        {"at": datetime(2026, 8, 14, 10, 22), "event": "submitted", "by": "applicant"},
        {"at": datetime(2026, 8, 16, 9, 5), "event": "labour_dept approved", "by": "officer"},
    ],
    "decision": {"status": "pending", "reason": None, "by": None},
}
SAMPLE_SERVICES = [
    {
        "service_code": "FACTORY_REG",
        "label": "Factory Registration",
        "dept": "Directorate of Industrial Safety and Health",
        "sla_days": 15,
        "required_docs": [
            {"doc_type": "pan", "label": "PAN card", "uploaded": False},
            {"doc_type": "udyam", "label": "Udyam registration", "uploaded": False},
            {"doc_type": "site_plan", "label": "Site plan", "uploaded": False},
            {"doc_type": "ca_certificate", "label": "CA investment certificate", "uploaded": False},
            {"doc_type": "fire_noc", "label": "Fire NOC", "uploaded": False},
        ],
    },
    {
        "service_code": "POLLUTION_CTE",
        "label": "Consent to Establish (Pollution Board)",
        "dept": "Maharashtra Pollution Control Board",
        "sla_days": 15,
        "required_docs": [
            {"doc_type": "site_plan", "label": "Site plan", "uploaded": False},
            {"doc_type": "effluent_plan", "label": "Effluent treatment plan", "uploaded": False},
        ],
    },
]

SAMPLE_QUEUE = [
    {"twin_id": "APP-2026-000417", "applicant_name": "Ravi Deshmukh",
     "service_code": "FACTORY_REG", "stage": "pollution_board",
     "days_used": 4, "sla_days": 15, "delay_probability": 0.78, "blocking_issues": 2},
    {"twin_id": "APP-2026-000392", "applicant_name": "Sunita Kale",
     "service_code": "POLLUTION_CTE", "stage": "officer_review",
     "days_used": 13, "sla_days": 15, "delay_probability": 0.91, "blocking_issues": 0},
    {"twin_id": "APP-2026-000455", "applicant_name": "Imran Shaikh",
     "service_code": "FACTORY_REG", "stage": "document_check",
     "days_used": 2, "sla_days": 15, "delay_probability": 0.18, "blocking_issues": 0},
]

SAMPLE_BOTTLENECKS = {
    "average_days": 4.2,
    "sla_breaches": 7,
    "by_stage": [
        {"stage": "pollution_board", "average_days": 8.4, "files": 34},
        {"stage": "officer_review", "average_days": 5.1, "files": 51},
        {"stage": "document_check", "average_days": 1.9, "files": 62},
    ],
    "by_document": [
        {"doc_type": "fire_noc", "rejection_rate": 0.31},
        {"doc_type": "ca_certificate", "rejection_rate": 0.22},
    ],
}
SAMPLE_NOTIFICATIONS = [
    {
        "id": "N1",
        "level": "action",
        "title": "Fire NOC missing",
        "message": "Upload the Fire NOC to reach 100% readiness",
        "twin_id": "APP-2026-000417",
        "read": False,
        "at": "2026-08-26T09:15:00",
    },
    {
        "id": "N2",
        "level": "warning",
        "title": "Delay risk is high",
        "message": "Pollution Board is clearing files slower than usual this month",
        "twin_id": "APP-2026-000417",
        "read": False,
        "at": "2026-08-25T16:40:00",
    },
    {
        "id": "N3",
        "level": "info",
        "title": "Labour Department approved",
        "message": "Stage 1 cleared in 6 of 10 allowed days",
        "twin_id": "APP-2026-000417",
        "read": True,
        "at": "2026-08-16T09:05:00",
    },
]
