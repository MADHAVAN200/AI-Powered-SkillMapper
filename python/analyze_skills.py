import os
import sys
import json
import random
from common import read_input, write_output, call_llm

NORMALIZED_SKILLS = {
    "ml": "Machine Learning",
    "machine-learning": "Machine Learning",
    "dl": "Deep Learning",
    "deeplearning": "Deep Learning",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "fastapi": "FastAPI",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "react": "React",
    "reactjs": "React",
    "nodejs": "Node.js",
    "aws": "AWS",
    "gcp": "Google Cloud Platform",
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL"
}

def normalize_skill_name(name: str) -> str:
    clean = name.strip().lower()
    return NORMALIZED_SKILLS.get(clean, name.strip())

def get_fallback_data(skills_list, exp):
    mapped_skills = []
    for skill in skills_list:
        norm_name = normalize_skill_name(skill)
        category = "Other"
        name_l = norm_name.lower()
        if any(x in name_l for x in ["python", "javascript", "typescript", "java", "c++", "rust", "go"]):
            category = "Programming"
        elif any(x in name_l for x in ["machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "transformers", "openai"]):
            category = "AI/ML"
        elif any(x in name_l for x in ["aws", "gcp", "azure", "docker", "kubernetes", "ci/cd"]):
            category = "Cloud"
        elif any(x in name_l for x in ["sql", "postgresql", "postgres", "mysql", "mongodb", "redis", "supabase"]):
            category = "Databases"
        elif any(x in name_l for x in ["communication", "presentation", "leadership", "agile", "scrum"]):
            category = "Soft Skills"
            
        multiplier = 60
        if "Senior" in exp:
            multiplier = 82
        elif "Mid-Level" in exp:
            multiplier = 72
            
        proficiency = min(100, random.randint(0, 14) + multiplier)
        confidence = round(0.8 + random.random() * 0.15, 2)
        market_demand = random.choice(["Very High", "High", "Medium"])
        
        mapped_skills.append({
            "skill_id": "".join(c if c.isalnum() else "-" for c in norm_name.lower()),
            "skill_name": norm_name,
            "category": category,
            "proficiency": proficiency,
            "confidence": confidence,
            "market_demand": market_demand
        })
    return {"skills": mapped_skills}

def main():
    payload = read_input()
    skills_list = payload.get("knownSkills", [])
    exp = payload.get("experienceLevel", "Junior")
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(skills_list, exp))
        
    prompt = f"""You are a strict, world-class AI developer profile evaluator.
Analyze the following list of raw skills and experience grade to produce a standardized skill proficiency matrix.
Normalize skill names (e.g. TF -> TensorFlow, ML -> Machine Learning).
Classify each skill into exactly one of: "Programming" | "AI/ML" | "Cloud" | "Databases" | "Soft Skills" | "Other".
Tally an individual proficiency percentage (out of 100) and evaluation confidence value (between 0.0 and 1.0) based on developer standards for a: "{exp}".

SKILLS TO ANALYZE: {json.dumps(skills_list)}

Response strictly as a JSON string matching this structure:
{{
  "skills": [
    {{ "skill_id": "lowercase-slug", "skill_name": "Standardized Name", "category": "Programming" | "AI/ML" | "Cloud" | "Databases" | "Soft Skills" | "Other", "proficiency": 85, "confidence": 0.95, "market_demand": "Very High" | "High" | "Medium" | "Low" }}
  ]
}}
Return ONLY valid JSON. No conversational text wrap."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling analyze skills: {e}\n")
        write_output(get_fallback_data(skills_list, exp))

if __name__ == "__main__":
    main()
