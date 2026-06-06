import os
import sys
import json
import base64
import re
import requests
from common import read_input, write_output, call_llm

POPULAR_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Docker", "AWS", "Google Cloud", 
    "Kubernetes", "SQL", "PostgreSQL", "Machine Learning", "FastAPI", "TensorFlow", "PyTorch",
    "Git", "HTML", "CSS", "Java", "C++", "NoSQL", "Redis", "Linux"
]

def offline_fallback_parser(raw_text):
    # Heuristic Name Extraction
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    name = "Candidate"
    for line in lines[:3]:
        # Assume a line with 2-3 words (capitalized) is the name
        words = line.split()
        if len(words) >= 2 and len(words) <= 3 and all(w[0].isupper() for w in words if w.isalpha()):
            name = line
            break

    # Heuristic Degree Extraction
    degree = "Not Specified"
    for line in lines:
        lower_line = line.lower()
        if any(keyword in lower_line for keyword in ["b.s.", "b.tech", "m.s.", "bachelor", "master", "degree", "computer science", "information technology", "ph.d."]):
            # Clean up the line a bit
            degree = line[:60]
            break

    # Heuristic Experience Grade
    experience_level = "Junior (1-2 Years)"
    years = 1
    years_match = re.search(r"(\d+)\+?\s*(?:year|yr)s?", raw_text, re.IGNORECASE)
    if years_match:
        years = int(years_match.group(1))
    
    if "senior" in raw_text.lower() or "lead" in raw_text.lower() or "architect" in raw_text.lower() or years >= 6:
        experience_level = "Senior (6+ Years)"
    elif "mid" in raw_text.lower() or years >= 3:
        experience_level = "Mid-Level (3-5 Years)"
    elif "intern" in raw_text.lower() or "fresher" in raw_text.lower() or "entry" in raw_text.lower():
        experience_level = "Entry Level (Fresher)"

    # Heuristic Career Goal
    career_goal = "Software Engineer"
    lower_text = raw_text.lower()
    if "ai architect" in lower_text or "ai engineer" in lower_text or "machine learning" in lower_text:
        career_goal = "AI Architect"
    elif "full stack" in lower_text:
        career_goal = "Full Stack Developer"
    elif "backend" in lower_text:
        career_goal = "Backend Developer"
    elif "frontend" in lower_text:
        career_goal = "Frontend Developer"
    elif "data scientist" in lower_text or "data science" in lower_text:
        career_goal = "Data Scientist"
    elif "cloud" in lower_text or "devops" in lower_text or "sre" in lower_text:
        career_goal = "Cloud Engineer"

    # Heuristic Skills Extraction
    skills = []
    for skill in POPULAR_SKILLS:
        # Match word boundaries or surrounding text
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, raw_text, re.IGNORECASE):
            skills.append(skill)
            
    if not skills:
        skills = ["Python", "JavaScript", "React"]

    return {
        "name": name,
        "degree": degree,
        "experienceLevel": experience_level,
        "careerGoal": career_goal,
        "knownSkills": skills,
        "extractedText": raw_text.strip()
    }

def main():
    payload = read_input()
    file_base64 = payload.get("fileBase64")
    file_name = payload.get("fileName")
    file_type = payload.get("fileType", "")
    
    if not file_base64 or not file_name:
        write_output({"error": "Missing fileBase64 or fileName."})
        
    use_real_ai = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY"))
    
    # Attempt raw text decoding
    raw_text = ""
    try:
        raw_text = base64.b64decode(file_base64).decode("utf-8", errors="ignore")
    except Exception as e:
        sys.stderr.write(f"Raw text decode failure: {e}\n")
        raw_text = "[Binary file content]"
        
    # If no AI keys, run offline fallback parser immediately
    if not use_real_ai:
        fallback_data = offline_fallback_parser(raw_text if raw_text else file_name)
        fallback_data["warning"] = "AI API key not configured. We used our local parser to pre-fill details from your resume."
        write_output(fallback_data)
        
    gemini_key = os.environ.get("GEMINI_API_KEY")
    
    # 1. PDF multimodal handling (Gemini)
    if gemini_key and (file_type == "application/pdf" or file_name.lower().endswith(".pdf")):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        prompt_text = """Analyze this resume PDF and extract the profile details to configure a career platform.
Output MUST be strictly a parseable JSON object matching this schema:
{
  "name": "Candidate's Full Name (or 'Candidate' if not found)",
  "degree": "Degree / Education Title / Current Status (or 'Not Specified' if not found)",
  "experienceLevel": "Entry Level (Fresher)" | "Junior (1-2 Years)" | "Mid-Level (3-5 Years)" | "Senior (6+ Years)" (Determine based on years of experience or titles),
  "careerGoal": "Target Career Goal or predicted engineering role (e.g. AI Architect, Full Stack Developer, Data Scientist) based on resume alignment",
  "knownSkills": ["Skill 1", "Skill 2", ...], (Extract up to 8 core technical stack skills),
  "extractedText": "Verbatim full text extracted from this resume"
}
Return ONLY valid JSON. No conversational text, no markdown backtick blocks."""
        
        payload_data = {
            "contents": [{
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": "application/pdf",
                            "data": file_base64
                        }
                    },
                    {
                        "text": prompt_text
                    }
                ]
            }],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        
        try:
            response = requests.post(url, json=payload_data, headers=headers, timeout=45)
            if response.status_code == 200:
                result_json = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                write_output(json.loads(result_json.strip()))
            else:
                sys.stderr.write(f"Gemini PDF extraction error: {response.text}\n")
        except Exception as e:
            sys.stderr.write(f"Gemini PDF extraction request failure: {e}\n")
            
    # 2. Text / DOCX fallback handling (LLM parsing of decoded text)
    prompt = f"""The following is raw file content extracted from a resume document ({file_name}).
Analyze this resume text and extract the profile details to configure a career platform.
Output MUST be strictly a parseable JSON object matching this schema:
{{
  "name": "Candidate's Full Name (or 'Candidate' if not found)",
  "degree": "Degree / Education Title / Current Status (or 'Not Specified' if not found)",
  "experienceLevel": "Entry Level (Fresher)" | "Junior (1-2 Years)" | "Mid-Level (3-5 Years)" | "Senior (6+ Years)" (Determine based on years of experience or titles),
  "careerGoal": "Target Career Goal or predicted engineering role (e.g. AI Architect, Full Stack Developer, Data Scientist) based on resume alignment",
  "knownSkills": ["Skill 1", "Skill 2", ...], (Extract up to 8 core technical stack skills),
  "extractedText": "Clean verbatim resume text extracted from the document"
}}
Return ONLY valid JSON. No markdown block wraps or intro sentences.

RAW CONTENT:
{raw_text[:8000]}"""

    try:
        extracted = call_llm(prompt, True)
        cleaned = extracted.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"LLM resume parsing failure: {e}\n")
        fallback_data = offline_fallback_parser(raw_text)
        fallback_data["error"] = str(e)
        write_output(fallback_data)

if __name__ == "__main__":
    main()
