# Niyora — Backend

FastAPI backend for the Citizen Application Digital Twin (SIH PS 26130).

## Run it locally

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open http://127.0.0.1:8000/docs — every endpoint is listed and testable there.

## For the frontend

Base URL: `http://127.0.0.1:8000`

| Endpoint | Method | Returns |
|---|---|---|
| `/api/services` | GET | all services (filter with `?audience=student`) |
| `/api/match-service` | POST | `{"need": "..."}` → matching services + checklist |
| `/api/eligibility` | POST | `{"service_code": "...", "answers": {...}}` → pass / fail / needs_proof |
| `/api/applications` | POST | creates an application, returns `twin_id` |
| `/api/twin/{twin_id}` | GET | the full twin — status, issues, risk, timeline |
| `/api/queue` | GET | officer work queue, sorted by delay risk |
| `/api/applications/{id}/decision` | POST | approve / reject / query |
| `/api/analytics/bottlenecks` | GET | delay by stage and by document type |

**Note:** responses are currently sample data. The shape is final — build against it.
The twin structure is defined in `schemas.py`; that file is the contract.

CORS is open, so the React dev server can call this directly.



# Niyora Frontend

React + Vite frontend for the SIH 26130 Citizen Application Digital Twin backend.

## Run
```bash
npm install
npm run dev
```

The default API is `https://sih-twin.onrender.com`.
To override it, create `.env`:

```env
VITE_API_URL=https://sih-twin.onrender.com
```

## Backend endpoints used
- GET `/api/services`
- POST `/api/match-service`
- POST `/api/eligibility`
- POST `/api/applications`
- GET `/api/twin/{twin_id}`
- GET `/api/queue`
- POST `/api/applications/{twin_id}/decision`
- GET `/api/analytics/bottlenecks`

The UI has two modes:
- Applicant: discover services, eligibility, start applications, track the Digital Twin.
- Officer: work queue, risk prioritization, decisions, bottleneck analytics.

The current backend returns sample data, so the frontend intentionally renders the contract rather than inventing a different API.
