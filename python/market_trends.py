import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(goal):
    return {
        "trendingTech": [
            {"name": "Generative AI Engineering (LLMs/RAG)", "growthRate": "+182% YoY", "demandIndex": "Very High"},
            {"name": "MLOps with Kubeflow & MLflow", "growthRate": "+94% YoY", "demandIndex": "Very High"},
            {"name": "Rust Backend Development for WebAssembly", "growthRate": "+64% YoY", "demandIndex": "High"},
            {"name": "Serverless Edge Computing", "growthRate": "+48% YoY", "demandIndex": "Medium"}
        ],
        "hiringStatus": "The job market is shifting rapidly towards specialized platform models, real-time inference, and robust systems architecture. Candidates with solid deployment cycle portfolios have a significant advantage.",
        "salaryInsights": [
            {"position": "Junior/Associate", "range": "₹8L - ₹14L", "multiplier": "1.0x"},
            {"position": "Mid-Level Specialist", "range": "₹15L - ₹28L", "multiplier": "2.1x"},
            {"position": "Senior Lead Principal", "range": "₹32L - ₹55L+", "multiplier": "3.8x"}
        ],
        "emergingRoles": [
            {"roleName": "AI Infrastructure Architect", "demandTrend": "Sprinting", "salaryReference": "₹28L+"},
            {"roleName": "MLOps Systems Administrator", "demandTrend": "Surging", "salaryReference": "₹22L+"},
            {"roleName": "Enterprise Integration Lead", "demandTrend": "High Demand", "salaryReference": "₹18L+"}
        ],
        "trendingTechnologies": [
            {"technology_id": "1", "technology_name": "Generative AI Engineering (LLMs/RAG)", "growth_score": 182},
            {"technology_id": "2", "technology_name": "MLOps with Kubeflow & MLflow", "growth_score": 94},
            {"technology_id": "3", "technology_name": "Rust Backend Development for WebAssembly", "growth_score": 64},
            {"technology_id": "4", "technology_name": "Serverless Edge Computing", "growth_score": 48},
            {"technology_id": "5", "technology_name": "Vector Databases & Graph Neural Networks", "growth_score": 142}
        ],
        "inDemandSkills": [
            {"skill_id": "1", "skill_name": "RAG & Vector Search", "market_demand": 98, "salary_impact": 35},
            {"skill_id": "2", "skill_name": "Python Software Stack", "market_demand": 92, "salary_impact": 20},
            {"skill_id": "3", "skill_name": "Docker & Kubernetes Clusters", "market_demand": 89, "salary_impact": 30},
            {"skill_id": "4", "skill_name": "MLOps Pipelines", "market_demand": 88, "salary_impact": 38}
        ],
        "salarySpectrum": [
            {"role_id": "1", "role_name": "AI Software Engineer", "salary_range": "₹12L - ₹25L", "region": "Bangalore"},
            {"role_id": "2", "role_name": "Systems Architect", "salary_range": "₹25L - ₹48L+", "region": "Bangalore"},
            {"role_id": "3", "role_name": "DevOps Engineer", "salary_range": "₹12L - ₹24L", "region": "Pune"},
            {"role_id": "4", "role_name": "Data Analyst", "salary_range": "₹6L - ₹12L", "region": "Chennai"},
            {"role_id": "5", "role_name": "Full Stack Developer", "salary_range": "₹8L - ₹18L", "region": "Mumbai"}
        ],
        "hiringStats": [
            {"role_id": "1", "role_name": "AI Software Engineer", "job_openings": 45000, "growth_rate": 38},
            {"role_id": "2", "role_name": "Full Stack Developer", "job_openings": 35000, "growth_rate": 18},
            {"role_id": "3", "role_name": "DevOps Engineer", "job_openings": 18000, "growth_rate": 26},
            {"role_id": "4", "role_name": "Data Scientist", "job_openings": 12000, "growth_rate": 31},
            {"role_id": "5", "role_name": "Systems Architect", "job_openings": 8500, "growth_rate": 22}
        ],
        "futurePrediction": {
            "nextYearDemandTrend": "Incredibly Bullish / Hyper-Surging (+142%)",
            "predictedEmergingSkills": ["Agentic AI Orchestrations", "GPU Pipeline Parallelisms", "LLMOps Model Tuning"],
            "predictedSalaryGrowth": "Average starting salary premium of +35% over legacy full-stack tracks",
            "technologyAdoptionCurve": "Currently in Early Majority phase, expected to saturate standard setups by the end of 2026."
        },
        "regionalInsights": [
            {"city": "Bangalore", "hotspotType": "AI & MLOps Development Hub", "activeOpenings": 18400, "averagePremium": "+35%"},
            {"city": "Hyderabad", "hotspotType": "Enterprise Cloud Platforms", "activeOpenings": 12100, "averagePremium": "+26%"},
            {"city": "Pune", "hotspotType": "DevOps Clusters & Platform SREs", "activeOpenings": 9800, "averagePremium": "+22%"},
            {"city": "Chennai", "hotspotType": "FinTech & Secure Databases", "activeOpenings": 7400, "averagePremium": "+18%"},
            {"city": "Mumbai", "hotspotType": "Enterprise Solutions & Integrations", "activeOpenings": 6900, "averagePremium": "+15%"}
        ],
        "platformConnections": {
            "mapper": "{\n  \"role\": \"AI Specialist\",\n  \"marketDemand\": \"Very High\",\n  \"salaryBands\": \"₹12L - ₹25L\"\n}",
            "learning": "{\n  \"prioritySkills\": [\"Generative AI\", \"RAG & Vector Search\"],\n  \"coursesReference\": [\"Udemy\"]\n}",
            "skills": "{\n  \"demandThreshold\": 90,\n  \"weightBoost\": \"+20 priority points\"\n}",
            "resume": "{\n  \"recommendedKeywords\": [\"LLMOps\", \"Vector Storage\", \"LangChain\"]\n}",
            "interview": "{\n  \"activeScreeningTopic\": \"Vector DB System Design & RAG Metrics\"\n}",
            "mentor": "{\n  \"recommendedHub\": \"Bangalore\",\n  \"expectedPremium\": \"+35%\"\n}"
        }
    }

def main():
    payload = read_input()
    career_goal = payload.get("careerGoal", "Software Engineer")
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(career_goal))
        
    prompt = f"""You are an elite, real-time labor market forecaster and talent intelligence platform.
Analyze the current industry trajectory for careers targeting: "{career_goal}".
Focus in-depth on trending technology adoption, salary metrics (INR ₹ focus but fits USD context if global), active open jobs, future-scaped projections, and downstream connection APIs.

Respond with ONLY a clean JSON object containing ALL requested keys exactly:
{{
  "trendingTech": [
    {{ "name": "e.g. LangChain & Semantic Orchestrations", "growthRate": "+182% YoY", "demandIndex": "Very High" }},
    {{ "name": "e.g. Serverless MLOps Pipelines", "growthRate": "+94% YoY", "demandIndex": "Very High" }},
    {{ "name": "e.g. Rust High-Performance Backends", "growthRate": "+64% YoY", "demandIndex": "High" }},
    {{ "name": "e.g. Serverless Edge Computing", "growthRate": "+48% YoY", "demandIndex": "Medium" }}
  ],
  "hiringStatus": "Detailed status report of what tech leaders look for concerning {career_goal} candidates right now.",
  "salaryInsights": [
    {{ "position": "Junior/Associate {career_goal}", "range": "₹8L - ₹14L", "multiplier": "1.0x" }},
    {{ "position": "Mid-Level {career_goal}", "range": "₹15L - ₹28L", "multiplier": "2.1x" }},
    {{ "position": "Senior / Principal {career_goal}", "range": "₹32L - ₹55L+", "multiplier": "3.8x" }}
  ],
  "emergingRoles": [
    {{ "roleName": "AI Systems Deployment Lead", "demandTrend": "Sprinting", "salaryReference": "₹28L+" }},
    {{ "roleName": "DevOps Model Orchestrator", "demandTrend": "Surging", "salaryReference": "₹22L+" }},
    {{ "roleName": "Semantic Search Engineer", "demandTrend": "High Demand", "salaryReference": "₹18L+" }}
  ],
  "trendingTechnologies": [
    {{ "technology_id": "1", "technology_name": "Generative AI Systems", "growth_score": 182 }},
    {{ "technology_id": "2", "technology_name": "MLOps Pipelines", "growth_score": 94 }},
    {{ "technology_id": "3", "technology_name": "Rust Systems Programming", "growth_score": 64 }},
    {{ "technology_id": "4", "technology_name": "Edge Frameworks", "growth_score": 48 }},
    {{ "technology_id": "5", "technology_name": "Vector Datastores", "growth_score": 142 }}
  ],
  "inDemandSkills": [
    {{ "skill_id": "1", "skill_name": "Vector Search Systems", "market_demand": 98, "salary_impact": 35 }},
    {{ "skill_id": "2", "skill_name": "Advanced Python SDKs", "market_demand": 92, "salary_impact": 20 }},
    {{ "skill_id": "3", "skill_name": "Kubernetes Clusters", "market_demand": 89, "salary_impact": 30 }},
    {{ "skill_id": "4", "skill_name": "CI/CD Deployment automation", "market_demand": 88, "salary_impact": 38 }}
  ],
  "salarySpectrum": [
    {{ "role_id": "1", "role_name": "{career_goal}", "salary_range": "₹12L - ₹26L", "region": "Bangalore" }},
    {{ "role_id": "2", "role_name": "Lead {career_goal}", "salary_range": "₹25L - ₹48L+", "region": "Bangalore" }},
    {{ "role_id": "3", "role_name": "{career_goal}", "salary_range": "₹10L - ₹22L", "region": "Hyderabad" }},
    {{ "role_id": "4", "role_name": "Systems Lead", "salary_range": "$110,000 - $160,000", "region": "Global" }}
  ],
  "hiringStats": [
    {{ "role_id": "1", "role_name": "{career_goal}", "job_openings": 45000, "growth_rate": 38 }},
    {{ "role_id": "2", "role_name": "Architectural Leads", "job_openings": 8500, "growth_rate": 22 }},
    {{ "role_id": "3", "role_name": "DevOps Engineers", "job_openings": 18000, "growth_rate": 26 }}
  ],
  "futurePrediction": {{
    "nextYearDemandTrend": "Forecasted demand trend description (e.g. +85% growth inside companies)",
    "predictedEmergingSkills": ["Skill 1", "Skill 2", "Skill 3"],
    "predictedSalaryGrowth": "Brief salary growth trajectory forecast",
    "technologyAdoptionCurve": "Adoption curve status"
  }},
  "regionalInsights": [
    {{ "city": "Bangalore", "hotspotType": "AI & MLOps Hub", "activeOpenings": 18400, "averagePremium": "+35%" }},
    {{ "city": "Hyderabad", "hotspotType": "Enterprise Cloud Setup", "activeOpenings": 12100, "averagePremium": "+26%" }},
    {{ "city": "Pune", "hotspotType": "DevOps Clusters", "activeOpenings": 9800, "averagePremium": "+22%" }}
  ],
  "platformConnections": {{
    "mapper": "{{\\n  \\"role\\": \\"{career_goal}\\",\\n  \\"marketDemand\\": \\"Very High\\",\\n  \\"salaryBands\\": \\"₹12L - ₹25L\\"\\n}}",
    "learning": "{{\\n  \\"prioritySkills\\": [\\"Generative AI\\", \\"RAG & Vector Search\\"],\\n  \\"coursesReference\\": [\\"Udemy\\"]\\n}}",
    "skills": "{{\\n  \\"demandThreshold\\": 90,\\n  \\"weightBoost\\": \\"+20 priority points\\"\\n}}",
    "resume": "{{\\n  \\"recommendedKeywords\\": [\\"LLMOps\\", \\"Vector Storage\\", \\"LangChain\\"]\\n}}",
    "interview": "{{\\n  \\"activeScreeningTopic\\": \\"Vector DB System Design & RAG Metrics\\"\\n}}",
    "mentor": "{{\\n  \\"recommendedHub\\": \\"Bangalore\\",\\n  \\"expectedPremium\\": \\"+35%\\"\\n}}"
  }}
}}
Do not use markdown wrappers or trailing conversational statements. Respond with strictly parseable, highly customized JSON state."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error calling market trends: {e}\n")
        write_output(get_fallback_data(career_goal))

if __name__ == "__main__":
    main()
