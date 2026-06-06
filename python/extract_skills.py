import os
import sys
import json
import re
from common import read_input, write_output, call_llm

def get_fallback_data(text):
    if not text:
        return {"extractedSkills": []}
    keywords = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "Express", "Docker", "AWS", "SQL", "Postgres", "FastAPI", "TensorFlow", "PyTorch", "Kubernetes", "HTML", "CSS", "MLflow"]
    detected = []
    for k in keywords:
        pattern = re.compile(rf"\b{re.escape(k)}\b", re.IGNORECASE)
        if pattern.search(text):
            detected.append(k)
    return {"extractedSkills": detected if len(detected) > 0 else ["React", "JavaScript", "SQL"]}

def main():
    payload = read_input()
    text = payload.get("text", "")
    if not text:
        write_output({"extractedSkills": []})
        
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(text))
        
    prompt = f"""Read the following biography, project narrative, resume body text, and extract all technical tools, methods, frameworks, and languages mentioned. Normalize names.
Raw Text: "{text}"

Output strictly as JSON in the format:
{{
  "extractedSkills": ["Skill Name 1", "Skill Name 2"]
}}
Only return json."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling extract skills: {e}\n")
        write_output(get_fallback_data(text))

if __name__ == "__main__":
    main()
