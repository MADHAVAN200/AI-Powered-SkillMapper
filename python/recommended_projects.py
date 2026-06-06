import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(skills, diff, role):
    first_skill = skills[0] if skills else "Data"
    return {
        "projects": [
            {
                "title": f"Distributed {first_skill} Realtime Portal",
                "description": f"Build a highly available system utilizing worker threads, secure socket structures, and optimized schemas designed for {role} parameters.",
                "skillsUtilized": skills + ["Docker"] if isinstance(skills, list) else ["Docker"],
                "complexity": diff or "Intermediate",
                "estimatedHours": 24
            }
        ]
    }

def main():
    payload = read_input()
    skills = payload.get("requiredSkills", ["React", "SQL"])
    diff = payload.get("difficulty", "Intermediate")
    role = payload.get("careerRole", "Full Stack Developer")
    if not isinstance(skills, list):
        skills = [skills] if skills else ["React", "SQL"]
        
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(skills, diff, role))
        
    prompt = f"""Recommend exactly 2 practical, high-value, portfolio-worthy software projects.
User is targeting the job role: "{role}"
Skills to utilize: {json.dumps(skills)}
Desired project level: "{diff or "Intermediate"}"

Return strictly in format:
{{
  "projects": [
    {{ "title": "...", "description": "...", "skillsUtilized": ["...", "..."], "complexity": "...", "estimatedHours": 30 }}
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
        sys.stderr.write(f"Error calling recommended projects: {e}\n")
        write_output(get_fallback_data(skills, diff, role))

if __name__ == "__main__":
    main()
