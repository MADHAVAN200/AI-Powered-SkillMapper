import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(skill, diff):
    return {
        "courses": [
            {"name": f"Ultimate Guide to {skill} Mastering", "platform": "Coursera", "type": "Course", "duration": "12 Hours", "rating": 4.8},
            {"name": f"{skill} Professional Specialization Certification", "platform": "Udemy", "type": "Certification", "duration": "8 Hours", "rating": 4.7}
        ]
    }

def main():
    payload = read_input()
    skill = payload.get("skillName", "MLOps")
    diff = payload.get("difficulty", "Medium")
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(skill, diff))
        
    prompt = f"""Suggest exactly 2 highly rated online courses for mastering the skill: "{skill}" with a difficulty level of: "{diff}".
Describe their characteristics.

Return output ONLY as:
{{
  "courses": [
    {{ "name": "...", "platform": "Coursera" | "Udemy" | "YouTube", "type": "Course" | "Certification", "duration": "e.g. 10 hours", "rating": 4.8 }}
  ]
}}
Only JSON."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling recommended courses: {e}\n")
        write_output(get_fallback_data(skill, diff))

if __name__ == "__main__":
    main()
