# Autonomous Hiring Intelligence System (AHIS)

> AI-powered resume screening and candidate ranking platform using local BERT + spaCy ML — zero API costs, zero quota limits.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) + Tailwind CSS + Chart.js |
| Backend | Node.js + Express.js + JWT |
| ML Service | Python FastAPI + spaCy + sentence-transformers (BERT) |
| Database | Supabase (PostgreSQL) |

---

## Project Structure

```
AHIS/
├── frontend/                  # React app (port 5173)
│   └── src/
│       ├── pages/
│       │   ├── candidate/     # JobListPage, ApplyPage
│       │   └── recruiter/     # Dashboard, CreateJob, Candidates, Analytics
│       ├── layouts/           # CandidateLayout, RecruiterLayout
│       ├── context/           # AuthContext
│       └── api.js             # Axios instance
│
├── backend/                   # Node.js API (port 5000)
│   ├── controllers/index.js   # All route handlers (single file)
│   ├── middleware/auth.js     # JWT + role guard
│   ├── routes/auth.js         # Auth routes
│   └── utils/
│       ├── supabase.js        # Supabase client
│       └── mlClient.js        # Python ML service client
│
└── ml-service/                # Python FastAPI (port 8000)
    ├── main.py                # FastAPI app + endpoints
    ├── ml_engine.py           # BERT scoring + skill extraction
    ├── extractor.py           # PDF/DOCX text extraction
    ├── skill_normalizer.py    # Fuzzy skill matching
    └── skills_vocab.py        # 500+ skills vocabulary
```

---

## ML Pipeline

```
Resume (PDF/DOCX)
      ↓
Text Extraction (pdfplumber / python-docx)
      ↓
Skill Extraction (spaCy PhraseMatcher + 500 skills vocab)
      ↓
Skill Normalization (react.js = React = ReactJS = reactjs)
      ↓
BERT Embeddings (sentence-transformers all-MiniLM-L6-v2)
      ↓
Multi-chunk Cosine Similarity → Semantic Score (0-100)
      ↓
Fuzzy Skill Match Score (0-100)
      ↓
Combined Score = (Semantic × 0.55) + (Skill × 0.45)
```

---

## Supabase Schema

```sql
users       → id, name, email, password, role
jobs        → id, title, description, required_skills[], weights
candidates  → id, name, email, job_id, scores, skills, status
validations → id, candidate_id, questions (JSONB), answers, score
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/seed | No | Create default recruiter |
| POST | /api/auth/login | No | Login |
| POST | /api/jobs/create | Recruiter | Create job posting |
| GET | /api/jobs | No | List all jobs |
| GET | /api/jobs/:id | No | Get job details |
| POST | /api/apply | No | Submit resume application |
| GET | /api/candidates/:jobId | Recruiter | Ranked candidates |
| GET | /api/candidate/:id | Recruiter | Candidate detail |
| POST | /api/validation/generate/:id | Recruiter | Generate MCQ test |
| POST | /api/validation/submit | No | Submit test answers |
| GET | /api/analytics/:jobId | Recruiter | Analytics data |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (free)

### 1. Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase_schema.sql`
3. Go to **Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 2. Backend Setup
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
JWT_SECRET=your_secret_min_32_chars
PORT=5000
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

### 3. ML Service Setup
```bash
cd ml-service
python -m venv venv
.\venv\Scripts\activate       # Windows
source venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```
Create `ml-service/.env`:
```env
ML_SERVICE_PORT=8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Project

Open **3 terminals**:

```bash
# Terminal 1 — ML Service
cd ml-service
.\venv\Scripts\activate
python main.py
# → http://localhost:8000

# Terminal 2 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 3 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### Seed Default Recruiter (run once)
```
POST http://localhost:5000/api/auth/seed
```
Login credentials:
```
Email:    recruiter@ahis.com
Password: recruiter123
```

---

## Scoring Formula

```
Semantic Score  = BERT cosine similarity (resume vs job description)
Skill Score     = matched required skills / total required skills × 100
Combined Score  = (Semantic × 0.55) + (Skill × 0.45)
Final Score     = (Combined × weight_semantic) + (Validation × weight_validation)
```

Weights are configurable per job posting by the recruiter.

---

## Key Features

- 🤖 **Local AI** — No Gemini/OpenAI API needed. Runs fully offline.
- 🎯 **Fuzzy Skill Matching** — React.js = ReactJS = react js = React
- 🔒 **Blind Mode** — Hide candidate name/email to eliminate bias
- 📊 **Analytics Dashboard** — Charts for top candidates + skill distribution
- 🧪 **Validation Tests** — Auto-generated MCQ tests per job role
- ⚡ **Real-time Ranking** — Candidates auto-ranked by final score
- 📄 **PDF + DOCX** — Supports both resume formats

---

## ML Service API Docs

FastAPI auto-generates Swagger docs:
```
http://localhost:8000/docs
```

---

## License
MIT