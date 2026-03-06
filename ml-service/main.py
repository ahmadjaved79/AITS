"""
AHIS ML Service — FastAPI
Handles all ML operations: resume analysis, scoring, MCQ generation.
Called internally by Node.js backend.
"""
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from extractor import extract_text
from ml_engine import analyze_resume, generate_mcq_questions

load_dotenv()

app = FastAPI(
    title="AHIS ML Service",
    description="Resume screening ML engine using BERT + spaCy",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ──────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "AHIS ML Service"}


# ── Resume Analysis ───────────────────────────────────────
@app.post("/ml/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    required_skills: str = Form(...),  # comma-separated string
):
    """
    Accepts resume file + job details.
    Returns semantic score, extracted skills, missing skills, summary.
    """
    try:
        # Read file bytes
        file_bytes = await resume.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Extract text
        resume_text = extract_text(file_bytes, resume.filename)
        print(f"[/ml/analyze] Extracted {len(resume_text)} chars from {resume.filename}")

        # Parse required skills
        skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]

        # Run ML pipeline
        result = analyze_resume(
            resume_text=resume_text,
            job_description=job_description,
            job_title=job_title,
            required_skills=skills_list,
        )

        return {
            "success": True,
            "resumeText": resume_text[:500] + "..." if len(resume_text) > 500 else resume_text,
            **result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[/ml/analyze ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"ML analysis failed: {str(e)}")


# ── Text-only Analysis (when resume already extracted) ────
class AnalyzeTextRequest(BaseModel):
    resumeText: str
    jobTitle: str
    jobDescription: str
    requiredSkills: List[str]


@app.post("/ml/analyze-text")
async def analyze_text(body: AnalyzeTextRequest):
    """Analyze pre-extracted resume text."""
    try:
        result = analyze_resume(
            resume_text=body.resumeText,
            job_description=body.jobDescription,
            job_title=body.jobTitle,
            required_skills=body.requiredSkills,
        )
        return {"success": True, **result}
    except Exception as e:
        print(f"[/ml/analyze-text ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── MCQ Generation ────────────────────────────────────────
class MCQRequest(BaseModel):
    jobTitle: str
    requiredSkills: List[str]


@app.post("/ml/generate-questions")
async def generate_questions(body: MCQRequest):
    """Generate 5 technical MCQ questions for a job role."""
    try:
        questions = generate_mcq_questions(body.jobTitle, body.requiredSkills)
        return {"success": True, "questions": questions}
    except Exception as e:
        print(f"[/ml/generate-questions ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Skill Extraction Only ─────────────────────────────────
class SkillRequest(BaseModel):
    text: str


@app.post("/ml/extract-skills")
async def extract_skills_endpoint(body: SkillRequest):
    """Extract skills from raw text."""
    from ml_engine import extract_skills
    skills = extract_skills(body.text)
    return {"success": True, "skills": skills}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", 8000))
    print(f"🚀 AHIS ML Service starting on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)