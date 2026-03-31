# WeatherXpert — Tata Power Weather Intelligence Platform

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL 14+

### Frontend Setup
```bash
cd weatherxpert
npm install --legacy-peer-deps
cp .env.development .env
npm run dev
# Opens at http://localhost:5173
```

### Backend Setup
```bash
cd weatherxpert-backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY
python seed.py        # Creates tables + seed data
uvicorn app.main:app --reload
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Default Login Credentials (after seed)
- **Superadmin**: rajesh.k@tatapower.com / Admin@1234
- **Admin**: priya.s@tatapower.com / Admin@1234

---

## Deploy to Render.com (Free Hosting)

1. Push this entire folder to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your GitHub repo
4. Render reads `render.yaml` automatically — creates DB + API + Frontend
5. Add environment variables in Render dashboard:
   - `TOMORROW_IO_API_KEY` — get free at tomorrow.io
   - `IMD_API_KEY` — get from IMD portal
6. First deploy runs `seed.py` automatically
7. Your app is live at `https://weatherxpert.onrender.com`

---

## Project Structure

```
weatherxpert/                    ← React Frontend (Vite + TypeScript)
├── src/
│   ├── api/                    ← API service layer (connects to backend)
│   │   ├── client.ts           ← Fetch wrapper + JWT auth
│   │   └── services.ts         ← All API calls (auth, weather, alerts...)
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/      ← KpiCards, AlertStrip, PlaybackControl...
│   │   │   ├── climate/        ← Accuracy Lab, Advanced Weather View...
│   │   │   ├── upload/         ← DropZone, PreviewTable, Validation...
│   │   │   ├── alerts/         ← Alert management components
│   │   │   ├── settings/       ← Settings tabs (RBAC)
│   │   │   └── ui/             ← shadcn/ui primitives
│   │   └── pages/              ← All page components
│   └── hooks/                  ← Custom React hooks
├── public/                     ← Static assets (logos, images)
├── .env.development            ← Local dev environment
├── .env.production             ← Production environment
└── vite.config.ts

weatherxpert-backend/           ← Python FastAPI Backend
├── app/
│   ├── api/routes/             ← API endpoints
│   │   ├── auth.py             ← Login, JWT, user management
│   │   ├── weather.py          ← Current, historical, forecast data
│   │   ├── alerts.py           ← Alert CRUD + rules
│   │   ├── accuracy.py         ← MAE/RMSE/MBE/Correlation
│   │   ├── reports.py          ← CSV export, summaries
│   │   ├── upload.py           ← CSV data ingestion
│   │   └── utilities.py        ← Utility + station management
│   ├── core/
│   │   ├── config.py           ← Settings (env vars)
│   │   ├── database.py         ← Async SQLAlchemy + PostgreSQL
│   │   └── security.py         ← JWT, password hashing, role guards
│   └── models/
│       ├── user.py             ← User + Utility tables
│       ├── weather.py          ← Observations + Forecasts (all BRD params)
│       └── alert.py            ← Alert rules + alert instances
├── seed.py                     ← Initial data (utilities, stations, users)
├── requirements.txt
└── render.yaml                 ← Render.com deployment config
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Animation | Framer Motion |
| Routing | React Router v7 |
| Backend | Python FastAPI |
| Database | PostgreSQL + SQLAlchemy (async) |
| Auth | JWT (python-jose + passlib) |
| Hosting | Render.com |

