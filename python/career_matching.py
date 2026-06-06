import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data():
    positions = [
        {"title": "AI Systems Engineer", "matchScore": 82, "salaryRange": "₹14L - ₹28L", "marketDemand": "Very High", "description": "Design cloud servers coordinating vector memory and prompt LLM parameters."},
        {"title": "Full Stack Developer", "matchScore": 78, "salaryRange": "₹10L - ₹20L", "marketDemand": "High", "description": "Implement responsive layouts and direct high-performance backends."},
        {"title": "DevOps Orchestrator", "matchScore": 65, "salaryRange": "₹12L - ₹24L", "marketDemand": "High", "description": "Direct Docker registries, cluster environments, and deployment pipelines."},
        {"title": "Data Analyst Specialist", "matchScore": 60, "salaryRange": "₹8L - ₹15L", "marketDemand": "Medium", "description": "Leverage advanced SQL and Tableau platforms to drive commercial stats."}
    ]
    return {"matches": positions}

def main():
    payload = read_input()
    skills = payload.get("currentSkills", [])
    if not isinstance(skills, list):
        skills = []
        
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data())
        
    prompt = f"""Compare this user's tech skills list with modern technology positions.
User Skills: {json.dumps(skills)}
Predict 4 ideal multi-role profiles.
For each, provide:
1. title (e.g. AI systems engineer)
2. matchScore %
3. salaryRange (local style)
4. marketDemand ("Very High" | "High" | "Medium" | "Low")
5. description

Response JSON format:
{{
  "matches": [
    {{ "title": "...", "matchScore": 85, "salaryRange": "...", "marketDemand": "...", "description": "..." }}
  ]
}}
Return only JSON."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling career matching: {e}\n")
        write_output(get_fallback_data())

if __name__ == "__main__":
    main()
