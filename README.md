# NetDoc Maker

Aplikacja do tworzenia dokumentacji sieciowej w stylu Cisco.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Zustand + React Query
- **Backend**: FastAPI + Python 3.11 + SQLAlchemy + PostgreSQL
- **Export**: WeasyPrint (PDF), python-docx (DOCX)
- **Konteneryzacja**: Docker + Docker Compose

## Funkcje

- Kreator topologii sieci (drag & drop)
- Tablica adresacji IP (edytowalna)
- Automatyczne generowanie konfiguracji Cisco IOS
- Eksport do PDF i DOCX
- Zapis/odczyt projektów w PostgreSQL
- REST API (FastAPI + OpenAPI docs)

## Uruchomienie (Docker)

\`\`\`
docker compose up --build
\`\`\`

Aplikacja dostępna pod:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Dokumentacja API: http://localhost:8000/docs

## Uruchomienie lokalne

### Backend

\`\`\`
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # uzupełnij DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload
\`\`\`

### Frontend

\`\`\`
cd frontend
npm install
cp .env.example .env      # ustaw VITE_API_URL
npm run dev
\`\`\`
