# WeatherXpert — Tata Power Weather Intelligence Platform

## Repository Structure
```
/
├── render.yaml          ← Render.com deployment config (ROOT level)
├── frontend/            ← React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── backend/             ← Python FastAPI
    ├── app/
    ├── requirements.txt
    └── seed.py
```

## Deploy to Render.com

1. Push this entire folder to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your GitHub repo
4. **Blueprint Path:** leave blank (render.yaml is at root ✅)
5. Click Apply — Render creates DB + API + Frontend automatically
6. Add env vars in Render dashboard:
   - `TOMORROW_IO_API_KEY`
   - `IMD_API_KEY`

## Local Development

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # fill in values
python seed.py        # setup DB + seed data
uvicorn app.main:app --reload   # http://localhost:8000
```

### Default Login
| Role | Email | Password |
|------|-------|----------|
| Superadmin | rajesh.k@tatapower.com | Admin@1234 |
| Admin | priya.s@tatapower.com | Admin@1234 |
