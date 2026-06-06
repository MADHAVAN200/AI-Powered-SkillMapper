import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(role, curr):
    default_requirements = {
        "ai": ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "LangChain", "Vector Databases"],
        "full stack": ["React", "Node.js", "Express", "SQL", "PostgreSQL", "Docker", "AWS", "CSS"],
        "devops": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Monitoring Tools"],
        "data": ["SQL", "Python", "Tableau", "Excel", "Pandas", "PowerBI", "Stats"]
    }
    
    pre_list = default_requirements["full stack"]
    test_l = role.lower()
    if any(x in test_l for x in ["ai", "machine", "ml"]):
        pre_list = default_requirements["ai"]
    elif any(x in test_l for x in ["devops", "cloud", "system"]):
        pre_list = default_requirements["devops"]
    elif any(x in test_l for x in ["data", "analytic"]):
        pre_list = default_requirements["data"]
        
    gaps = []
    for idx, req_s in enumerate(pre_list):
        if not any(req_s.lower() in c.lower() for c in curr):
            priority = "High" if idx == 0 else "Medium" if idx == 1 else "Low"
            severity = "Critical" if idx == 0 else "Moderate" if idx == 1 else "Minor"
            gaps.append({
                "skillName": req_s,
                "priority": priority,
                "severity": severity,
                "whyNeeded": f"Crucial industry requirement for top-tier {role} openings to implement standard, distributed structures."
            })
            
    if not gaps:
        gaps = [{
            "skillName": "System Architecture",
            "priority": "Medium",
            "severity": "Minor",
            "whyNeeded": "Provides structural consistency across high-availability developer layouts."
        }]
        
    return {"gaps": gaps}

def main():
    payload = read_input()
    role = payload.get("targetRole", "AI Software Engineer")
    curr = payload.get("currentSkills", [])
    if not isinstance(curr, list):
        curr = []
        
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(role, curr))
        
    prompt = f"""Perform an enterprise-ready skill gap analysis.
Compare the user's current skills to the industry-standard requirements for an expert: "{role}".
USER SKILLS: {json.dumps(curr)}

Identify what essential skills or concepts are completely missing.
For each gap, provide:
1. skillName
2. priority ("High" | "Medium" | "Low")
3. severity ("Critical" | "Moderate" | "Minor")
4. whyNeeded (descriptive industry requirement justification)

Response format:
{{
  "gaps": [
    {{ "skillName": "MLOps", "priority": "High", "severity": "Critical", "whyNeeded": "Why it's essential for achieving the career goal" }}
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
        sys.stderr.write(f"Error calling skill gap analysis: {e}\n")
        write_output(get_fallback_data(role, curr))

if __name__ == "__main__":
    main()
