import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(gaps, role):
    recs = {
        "skillsToLearn": [f"Master {g.get('skillName', g) if isinstance(g, dict) else g}" for g in gaps],
        "suggestedProjects": [
            {
                "title": "Enterprise Micro-service Shell",
                "description": f"Construct an end-to-end sandbox applying your target {role} patterns, complete with secure PostgreSQL databases and client interfaces.",
                "tools": ["Docker", "PostgreSQL", "Node.js"]
            }
        ],
        "suggestedCertifications": [
            {"name": "AWS Developer Associate", "issuer": "Amazon Web Services", "usefulness": "High"},
            {"name": "Google Professional Data Engineer", "issuer": "Google Cloud", "usefulness": "High"}
        ],
        "onlineCourses": [
            {"name": f"Advanced {role} Masterclass", "platform": "Coursera", "duration": "4 Weeks"}
        ]
    }
    return recs

def main():
    payload = read_input()
    gaps = payload.get("skillGaps", [])
    if not isinstance(gaps, list):
        gaps = []
    role = payload.get("targetRole", "Systems Architect")
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(gaps, role))
        
    prompt = f"""Generate hyper-tailored professional recommendations to bridge the specified gaps and reach the target role.
Target Role: {role}
Gaps List: {json.dumps(gaps)}

Output format strictly:
{{
  "skillsToLearn": ["List item 1 to learn", "List item 2 to learn"],
  "suggestedProjects": [
    {{ "title": "Project Title", "description": "Highly motivating workflow scope narrative", "tools": ["Tool1", "Tool2"] }}
  ],
  "suggestedCertifications": [
    {{ "name": "Certificate Title", "issuer": "AWS / Google / Coursera", "usefulness": "High" }}
  ],
  "onlineCourses": [
    {{ "name": "Exact course name", "platform": "Coursera / Udemy", "duration": "4 weeks" }}
  ]
}}
Only return JSON."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling recommended skills: {e}\n")
        write_output(get_fallback_data(gaps, role))

if __name__ == "__main__":
    main()
