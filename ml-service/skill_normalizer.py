"""
Skill Normalizer — handles fuzzy matching, aliases, and variations.
Ensures "React.js", "ReactJS", "React js", "react" all map to "react".
"""

import re

# ── Alias Map ─────────────────────────────────────────────
# Maps all known variations → canonical name
SKILL_ALIASES = {
    # JavaScript / Frontend
    "react.js":        "react",
    "reactjs":         "react",
    "react js":        "react",
    "react native":    "react-native",
    "react-native":    "react-native",
    "vue.js":          "vue",
    "vuejs":           "vue",
    "vue js":          "vue",
    "next.js":         "nextjs",
    "next js":         "nextjs",
    "nuxt.js":         "nuxtjs",
    "angular.js":      "angular",
    "angularjs":       "angular",
    "node.js":         "nodejs",
    "node js":         "nodejs",
    "express.js":      "express",
    "expressjs":       "express",
    "tailwind css":    "tailwind",
    "tailwindcss":     "tailwind",
    "material ui":     "material-ui",
    "material-ui":     "material-ui",
    "mui":             "material-ui",

    # Python
    "py":              "python",
    "python3":         "python",
    "python 3":        "python",

    # Databases
    "mongo":           "mongodb",
    "mongo db":        "mongodb",
    "postgres":        "postgresql",
    "postgre sql":     "postgresql",
    "mysql db":        "mysql",
    "ms sql":          "mssql",
    "sql server":      "mssql",
    "elastic search":  "elasticsearch",
    "elastic":         "elasticsearch",
    "redis cache":     "redis",

    # Cloud
    "amazon web services": "aws",
    "amazon aws":      "aws",
    "gcp":             "google cloud",
    "google cloud platform": "google cloud",
    "azure cloud":     "azure",
    "microsoft azure": "azure",

    # ML / AI
    "ml":              "machine learning",
    "ai":              "artificial intelligence",
    "deep learning":   "deep learning",
    "dl":              "deep learning",
    "nlp":             "natural language processing",
    "natural language processing": "nlp",
    "cv":              "computer vision",
    "scikit learn":    "scikit-learn",
    "sklearn":         "scikit-learn",
    "sci-kit learn":   "scikit-learn",
    "tensorflow 2":    "tensorflow",
    "tf":              "tensorflow",
    "pytorch":         "pytorch",
    "torch":           "pytorch",
    "hugging face":    "huggingface",
    "huggingface transformers": "huggingface",

    # DevOps
    "k8s":             "kubernetes",
    "kube":            "kubernetes",
    "docker container": "docker",
    "ci/cd":           "ci-cd",
    "ci cd":           "ci-cd",
    "github actions":  "ci-cd",
    "gitlab ci":       "ci-cd",
    "jenkins":         "jenkins",
    "terraform":       "terraform",

    # Languages
    "c++":             "cpp",
    "cplusplus":       "cpp",
    "c plus plus":     "cpp",
    "c#":              "csharp",
    "c sharp":         "csharp",
    "golang":          "go",
    "typescript":      "typescript",
    "ts":              "typescript",
    "js":              "javascript",

    # Mobile
    "flutter dart":    "flutter",
    "react-native":    "react-native",
    "ios development": "ios",
    "android development": "android",

    # Methods
    "oop":             "object-oriented programming",
    "object oriented": "object-oriented programming",
    "rest":            "rest api",
    "restful":         "rest api",
    "restful api":     "rest api",
    "graphql api":     "graphql",
    "agile scrum":     "agile",
    "scrum agile":     "agile",
    "git hub":         "git",
    "version control": "git",
}

# ── Normalization ─────────────────────────────────────────

def normalize_skill(skill: str) -> str:
    """
    Normalize a skill string:
    1. Lowercase
    2. Remove extra spaces
    3. Remove special chars except - and .
    4. Apply alias map
    """
    # Lowercase + strip
    s = skill.lower().strip()

    # Remove extra whitespace
    s = re.sub(r'\s+', ' ', s)

    # Check alias map first (before removing dots)
    if s in SKILL_ALIASES:
        return SKILL_ALIASES[s]

    # Remove dots and normalize again
    s_no_dot = s.replace('.', '').replace('-', ' ').strip()
    s_no_dot = re.sub(r'\s+', ' ', s_no_dot)

    if s_no_dot in SKILL_ALIASES:
        return SKILL_ALIASES[s_no_dot]

    # Return cleaned version
    return s


def skills_match(skill_a: str, skill_b: str) -> bool:
    """
    Check if two skills are the same after normalization.
    Also handles partial matching for compound skills.
    """
    na = normalize_skill(skill_a)
    nb = normalize_skill(skill_b)

    # Exact match after normalization
    if na == nb:
        return True

    # One contains the other (e.g. "react" matches "react native")
    if na in nb or nb in na:
        return True

    # Remove all non-alphanumeric and compare
    clean_a = re.sub(r'[^a-z0-9]', '', na)
    clean_b = re.sub(r'[^a-z0-9]', '', nb)
    if clean_a == clean_b:
        return True

    # Check if stripped versions match
    # e.g. "reactjs" == "react js" after removing spaces
    if clean_a and clean_b and (clean_a in clean_b or clean_b in clean_a):
        # Only allow if lengths are close (avoid "js" matching "nodejs")
        if abs(len(clean_a) - len(clean_b)) <= 3:
            return True

    return False


def get_missing_skills(extracted: list, required: list) -> list:
    """
    Return required skills NOT matched in extracted skills.
    Uses fuzzy normalization for matching.
    """
    missing = []
    for req in required:
        matched = any(skills_match(req, ext) for ext in extracted)
        if not matched:
            missing.append(req)
    return missing


def get_matched_skills(extracted: list, required: list) -> list:
    """
    Return required skills that ARE found in extracted skills.
    """
    matched = []
    for req in required:
        if any(skills_match(req, ext) for ext in extracted):
            matched.append(req)
    return matched


def get_skill_match_score(extracted: list, required: list) -> float:
    """
    Percentage of required skills found in extracted skills.
    Returns 0-100.
    """
    if not required:
        return 50.0
    matched = get_matched_skills(extracted, required)
    return round((len(matched) / len(required)) * 100, 2)


def normalize_skills_list(skills: list) -> list:
    """Normalize an entire list of skills."""
    normalized = set()
    for s in skills:
        normalized.add(normalize_skill(s))
    return sorted(list(normalized))