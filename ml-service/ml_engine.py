"""
Core ML Engine for AHIS.
- Skill extraction using spaCy PhraseMatcher
- Semantic scoring using sentence-transformers (BERT)
- Cosine similarity via scikit-learn
- Skill gap detection
- Summary generation
"""
import re
import spacy
from spacy.matcher import PhraseMatcher
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from skills_vocab import SKILLS_VOCAB
from skill_normalizer import (
    normalize_skill,
    normalize_skills_list,
    get_missing_skills,
    get_skill_match_score,
)

print("[ML Engine] Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")

print("[ML Engine] Loading sentence-transformer (BERT)...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Build PhraseMatcher with skills vocabulary
print("[ML Engine] Building skills PhraseMatcher...")
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(skill) for skill in SKILLS_VOCAB]
matcher.add("SKILLS", patterns)

print("[ML Engine] ✅ All models loaded successfully")


def extract_skills(text: str) -> list[str]:
    """
    Extract technical skills from text using spaCy PhraseMatcher.
    Normalizes all extracted skills to canonical form.
    Returns deduplicated, sorted list of skills found.
    """
    doc = nlp(text.lower())
    matches = matcher(doc)
    found = set()
    for _, start, end in matches:
        skill = doc[start:end].text.strip().lower()
        if len(skill) > 1:
            # Normalize to canonical form
            normalized = normalize_skill(skill)
            found.add(normalized)
    return sorted(list(found))


def get_semantic_score(resume_text: str, job_description: str) -> float:
    """
    Compute semantic similarity between resume and job description.
    Uses multi-chunk strategy + rescaling for realistic 0-100 scores.
    
    BERT cosine similarity naturally falls in 0.2-0.6 range even for
    good matches. We rescale from realistic range [0.15, 0.75] to [0, 100].
    """
    # Strategy: encode multiple resume chunks and take the best match
    # This handles long resumes better than a single truncated chunk
    chunk_size = 512
    words = resume_text.split()

    # Create overlapping chunks of the resume
    chunks = []
    step = 300
    for i in range(0, len(words), step):
        chunk = ' '.join(words[i:i + chunk_size])
        if len(chunk.strip()) > 50:
            chunks.append(chunk)
        if len(chunks) >= 5:  # max 5 chunks
            break

    if not chunks:
        chunks = [resume_text[:2000]]

    # Encode job description once
    job_embedding = embedder.encode([job_description[:1000]])[0]

    # Encode all resume chunks
    chunk_embeddings = embedder.encode(chunks)

    # Take the BEST similarity across all chunks
    similarities = [
        cosine_similarity([ce], [job_embedding])[0][0]
        for ce in chunk_embeddings
    ]
    best_sim = max(similarities)
    avg_sim  = sum(similarities) / len(similarities)

    # Weighted: 70% best chunk + 30% average
    final_sim = (best_sim * 0.7) + (avg_sim * 0.3)

    # Rescale from realistic BERT range [0.15, 0.72] → [0, 100]
    # This makes scores more intuitive and spread out
    min_sim, max_sim = 0.15, 0.72
    rescaled = (final_sim - min_sim) / (max_sim - min_sim) * 100

    # Clamp to 0-100
    score = max(0.0, min(100.0, rescaled))

    print(f"[Semantic] best={best_sim:.3f} avg={avg_sim:.3f} final={final_sim:.3f} score={score:.1f}")
    return float(round(score, 1))


def get_missing_skills(extracted: list[str], required: list[str]) -> list[str]:
    """
    Return required skills NOT found in extracted skills.
    Uses fuzzy normalization — handles React.js vs react vs ReactJS etc.
    Imported from skill_normalizer for consistency.
    """
    from skill_normalizer import get_missing_skills as _get_missing
    return _get_missing(extracted, required)


def get_skill_match_score(extracted: list[str], required: list[str]) -> float:
    """
    Compute what percentage of required skills are present.
    Uses fuzzy normalization for matching.
    """
    from skill_normalizer import get_skill_match_score as _get_score
    return _get_score(extracted, required)


def generate_summary(
    resume_text: str,
    extracted_skills: list[str],
    semantic_score: float,
    missing_skills: list[str],
    job_title: str
) -> str:
    """
    Generate a bias-free professional summary without using any external API.
    Based purely on extracted data.
    """
    skill_count   = len(extracted_skills)
    missing_count = len(missing_skills)
    top_skills    = ", ".join(extracted_skills[:5]) if extracted_skills else "general skills"

    if semantic_score >= 75:
        fit = "strong"
        outlook = "highly recommended for further evaluation"
    elif semantic_score >= 50:
        fit = "moderate"
        outlook = "recommended for review with some skill development needed"
    else:
        fit = "partial"
        outlook = "may require significant upskilling for this role"

    summary = (
        f"Candidate demonstrates a {fit} fit for the {job_title} role "
        f"with a semantic match score of {semantic_score:.0f}/100. "
        f"Profile includes {skill_count} relevant skill(s) including {top_skills}. "
    )

    if missing_count > 0:
        missing_preview = ", ".join(missing_skills[:3])
        summary += (
            f"Notable skill gaps include: {missing_preview}"
            f"{'...' if missing_count > 3 else '.'}  "
        )

    summary += f"Overall assessment: {outlook}."
    return summary


def analyze_resume(
    resume_text: str,
    job_description: str,
    job_title: str,
    required_skills: list[str]
) -> dict:
    """
    Full ML pipeline for resume analysis.
    Returns structured dict with all scores and insights.
    """
    print(f"[ML] Analyzing resume ({len(resume_text)} chars) for: {job_title}")

    # 1. Extract skills from resume
    extracted_skills = extract_skills(resume_text)
    print(f"[ML] Extracted {len(extracted_skills)} skills: {extracted_skills[:10]}")

    # 2. Semantic similarity score (BERT)
    semantic_score = get_semantic_score(resume_text, job_description)
    print(f"[ML] Semantic score: {semantic_score}")

    # 3. Skill match score
    skill_score = get_skill_match_score(extracted_skills, required_skills)
    print(f"[ML] Skill match score: {skill_score}")

    # 4. Missing skills
    missing_skills = get_missing_skills(extracted_skills, required_skills)
    print(f"[ML] Missing skills: {missing_skills}")

    # 5. Combined score — weighted blend of semantic + skill match
    # Skill match is very reliable (exact/fuzzy), semantic adds context
    combined_score = round(
        (semantic_score * 0.55) + (skill_score * 0.45), 2
    )

    print(f"[ML] semantic={semantic_score} skill={skill_score} combined={combined_score}")

    # 6. Generate summary
    summary = generate_summary(
        resume_text, extracted_skills, semantic_score, missing_skills, job_title
    )

    return {
        "extractedSkills":  [str(s) for s in extracted_skills],
        "semanticScore":    float(round(semantic_score, 1)),
        "skillScore":       float(round(skill_score, 1)),
        "combinedScore":    float(round(combined_score, 1)),
        "missingSkills":    [str(s) for s in missing_skills],
        "shortSummary":     str(summary),
    }


def generate_mcq_questions(job_title: str, required_skills: list[str]) -> list[dict]:
    """
    Generate technical MCQ questions from a curated question bank.
    Falls back to generic questions if skill not in bank.
    """
    question_bank = {
        "python": [
            {
                "question": "What is the output of: print(type([]))?",
                "options": ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"],
                "correct": 0
            },
            {
                "question": "Which keyword is used to define a generator function in Python?",
                "options": ["return", "yield", "generate", "async"],
                "correct": 1
            },
        ],
        "react": [
            {
                "question": "Which hook is used to manage state in a React functional component?",
                "options": ["useEffect", "useContext", "useState", "useReducer"],
                "correct": 2
            },
            {
                "question": "What does the useEffect hook with an empty dependency array [] do?",
                "options": [
                    "Runs on every render",
                    "Runs only on component unmount",
                    "Runs only once after initial render",
                    "Never runs"
                ],
                "correct": 2
            },
        ],
        "javascript": [
            {
                "question": "What is the difference between '==' and '===' in JavaScript?",
                "options": [
                    "No difference",
                    "'===' checks value only",
                    "'===' checks both value and type",
                    "'==' checks type only"
                ],
                "correct": 2
            },
        ],
        "node.js": [
            {
                "question": "What is the event loop in Node.js?",
                "options": [
                    "A loop that runs JavaScript synchronously",
                    "A mechanism that handles async callbacks",
                    "A built-in HTTP server",
                    "A database connection pool"
                ],
                "correct": 1
            },
        ],
        "mongodb": [
            {
                "question": "Which MongoDB method returns all documents in a collection?",
                "options": ["find({})", "get({})", "select({})", "fetch({})"],
                "correct": 0
            },
        ],
        "sql": [
            {
                "question": "Which SQL clause is used to filter records?",
                "options": ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
                "correct": 2
            },
        ],
        "machine learning": [
            {
                "question": "What does overfitting mean in machine learning?",
                "options": [
                    "Model performs well on both train and test data",
                    "Model performs well on training but poorly on new data",
                    "Model has too few parameters",
                    "Model underfits the training data"
                ],
                "correct": 1
            },
        ],
        "docker": [
            {
                "question": "What is a Docker container?",
                "options": [
                    "A virtual machine",
                    "A lightweight isolated runtime environment",
                    "A cloud storage service",
                    "A CI/CD pipeline tool"
                ],
                "correct": 1
            },
        ],
        "aws": [
            {
                "question": "Which AWS service is used for object storage?",
                "options": ["EC2", "RDS", "S3", "Lambda"],
                "correct": 2
            },
        ],
    }

    # Generic fallback questions
    fallback_questions = [
        {
            "question": f"What is your primary approach to problem-solving in {job_title} projects?",
            "options": [
                "Top-down decomposition",
                "Bottom-up implementation",
                "Iterative prototyping",
                "All of the above depending on context"
            ],
            "correct": 3
        },
        {
            "question": "What does SOLID stand for in software engineering?",
            "options": [
                "Single, Open, Liskov, Interface, Dependency",
                "Simple, Object, Linear, Interface, Design",
                "Single, Object, Liskov, Integration, Dependency",
                "Scalable, Open, Linear, Interface, Design"
            ],
            "correct": 0
        },
        {
            "question": "Which version control command creates a new branch?",
            "options": ["git merge", "git branch", "git commit", "git push"],
            "correct": 1
        },
        {
            "question": "What is the purpose of an API?",
            "options": [
                "To store data in a database",
                "To allow different software systems to communicate",
                "To render UI components",
                "To compile source code"
            ],
            "correct": 1
        },
        {
            "question": "What does REST stand for?",
            "options": [
                "Relational Endpoint State Transfer",
                "Remote Execution State Transfer",
                "Representational State Transfer",
                "Reactive Event State Transfer"
            ],
            "correct": 2
        },
    ]

    selected = []
    used_skills = set()

    # Pick questions from question bank based on required skills
    for skill in required_skills:
        skill_l = skill.lower()
        for bank_key in question_bank:
            if bank_key in skill_l or skill_l in bank_key:
                if bank_key not in used_skills:
                    selected.extend(question_bank[bank_key])
                    used_skills.add(bank_key)
                if len(selected) >= 5:
                    break
        if len(selected) >= 5:
            break

    # Fill remaining with fallback
    for q in fallback_questions:
        if len(selected) >= 5:
            break
        if q not in selected:
            selected.append(q)

    return selected[:5]