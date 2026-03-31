# WeatherXpert Backend — FastAPI

## Setup
```bash
pip install -r requirements.txt
cp .env.example .env     # Fill in your values
python seed.py            # Creates DB tables + seed data
uvicorn app.main:app --reload
```

## API Docs
After starting: http://localhost:8000/docs

## Environment Variables (.env)
```
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/weatherxpert
TOMORROW_IO_API_KEY=<from tomorrow.io>
FRONTEND_URL=http://localhost:5173
```

## Seed Users
- superadmin: rajesh.k@tatapower.com / Admin@1234
- admin (Mumbai): priya.s@tatapower.com / Admin@1234
