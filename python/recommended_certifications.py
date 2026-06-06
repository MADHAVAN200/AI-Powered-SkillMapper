import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(skill):
    return {
        "certifications": [
            {"name": f"{skill} Professional Engineer", "provider": "AWS", "relevance": "Very High", "valueIndex": 9.5}
        ]
    }

def main():
    payload = read_input()
    skill = payload.get("skillName", "AWS Cloud Computing")
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(skill))
        
    prompt = f"""Suggest standard, industry recognized, high-value resume certifications for: "{skill}".
Return strictly as:
{{
  "certifications": [
    {{ "name": "...", "provider": "Google / AWS / TensorFlow", "relevance": "...", "valueIndex": 9.2 }}
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
        sys.stderr.write(f"Error calling recommended certifications: {e}\n")
        write_output(get_fallback_data(skill))

if __name__ == "__main__":
    main()
