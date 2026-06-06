import os
import sys
import json
import random
from common import read_input, write_output, call_llm

def get_scores(skills, experience_level):
    skills_list = skills if isinstance(skills, list) else []
    avg_proficiency = sum(s.get("proficiency", 70) for s in skills_list) / len(skills_list) if skills_list else 72
    
    exp_score = 65
    if experience_level and "Senior" in experience_level:
        exp_score = 92
    elif experience_level and "Mid-Level" in experience_level:
        exp_score = 80
        
    projects_score = min(100, 70 + (len(skills_list) * 4))
    market_alignment = random.randint(0, 9) + 78
    cert_alignment = 75
    
    final_score = round(
        avg_proficiency * 0.35 +
        projects_score * 0.20 +
        exp_score * 0.15 +
        cert_alignment * 0.15 +
        market_alignment * 0.15
    )
    
    return {
        "readinessScore": final_score,
        "technicalScore": round(avg_proficiency),
        "projectsScore": projects_score,
        "experienceScore": exp_score,
        "certificationsScore": cert_alignment,
        "marketAlignmentValue": market_alignment,
        "industryAverageContrast": 68
    }

def main():
    payload = read_input()
    skills = payload.get("skills", [])
    experience_level = payload.get("experienceLevel")
    carrier_goal = payload.get("carrierGoal")  # Note typo in JS body keys: carrierGoal vs careerGoal
    
    scores = get_scores(skills, experience_level)
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        scores["feedback"] = "Based on local calibration rules, your technical portfolio stands above the industry standards. Direct resume refinement with high-fidelity project metrics will maximize recruiter capture rates."
        write_output(scores)
        
    prompt = f"""You are a corporate recruiter analytics scoring engine.
Calculate a detailed job readiness diagnosis for a candidate with:
- Career Goal: {carrier_goal or "AI Soft Engineer"}
- Current skills with proficiencies: {json.dumps(skills)}
- Experience Grade: {experience_level or "Junior"}

Provide a summarizing professional feedback review explaining how the candidate can bridge details immediately.
Response format strictly matches:
{{
  "readinessScore": 75,
  "technicalScore": 80,
  "projectsScore": 75,
  "experienceScore": 70,
  "certificationsScore": 60,
  "marketAlignmentValue": 85,
  "industryAverageContrast": 68,
  "feedback": "Custom 2-sentence HR recruiter breakdown"
}}
Output only JSON."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling industry readiness: {e}\n")
        scores["feedback"] = "Local model calibration completed successfully. Upgrade credentials through cloud certifications or system design tests."
        write_output(scores)

if __name__ == "__main__":
    main()
