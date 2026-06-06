import os
import sys
import json
from common import read_input, write_output, call_llm

LOCAL_QUESTIONS = [
    {
        "question_id": 1,
        "domain": "AI/ML Engineer",
        "difficulty": "Medium",
        "question_type": "Technical core",
        "question_text": "Explain the difference between supervised, unsupervised, and reinforcement learning. Give a practical industry example for each.",
        "rationale": "Evaluates core foundational understanding of machine learning paradigms."
    },
    {
        "question_id": 2,
        "domain": "AI/ML Engineer",
        "difficulty": "Hard",
        "question_type": "Technical gap",
        "question_text": "What is Retrieval-Augmented Generation (RAG)? How do you address vector database search latency and retrieve highly relevant data context?",
        "rationale": "Tests practical production knowledge of Semantic Vector Search and Large Language Model architectures."
    },
    {
        "question_id": 3,
        "domain": "AI/ML Engineer",
        "difficulty": "Hard",
        "question_type": "Practical coding assessment",
        "question_text": "Write a high-performance Python function or outline an algorithm that calculates the Cosine Similarity between two arrays without utilizing external numpy wrappers. State the time complexity.",
        "solution_template": "def cosine_similarity(v1, v2):\n    # Vector lengths must match\n    # Implement mathematical dot product\n    pass",
        "rationale": "Validates computational mathematics understanding and raw algorithm implementation efficiency."
    },
    {
        "question_id": 4,
        "domain": "AI/ML Engineer",
        "difficulty": "Medium",
        "question_type": "Behavioral/Culture",
        "question_text": "Describe a scenario where your AI model suffered from training data drift or produced biased results in production. How did you diagnose, redeploy, and communicate this to your team?",
        "rationale": "Assesses MLOps diagnostics, prompt accountability, and technical incident transparency."
    },
    {
        "question_id": 5,
        "domain": "Backend Development",
        "difficulty": "Medium",
        "question_type": "Technical core",
        "question_text": "Explain how database connection pooling works. Why do we need it, and how would you configure it to avoid bottlenecks in a high-traffic API server?",
        "rationale": "Tests knowledge of concurrency bounds, DB connection overhead, and systems optimization."
    },
    {
        "question_id": 6,
        "domain": "Backend Development",
        "difficulty": "Hard",
        "question_type": "Technical gap",
        "question_text": "How do you handle transactional ACID compliance across multiple independent microservices? Provide trade-offs between Sagas and Two-Phase Commits.",
        "rationale": "Validates architectural wisdom relative to distributed systems, eventual consistency, and network failures."
    },
    {
        "question_id": 7,
        "domain": "Backend Development",
        "difficulty": "Hard",
        "question_type": "Practical coding assessment",
        "question_text": "Write a JavaScript/TypeScript script that implements an in-memory Rate Limiter using a slide window counter logic. Cap requests to 100 per minute per IP.",
        "solution_template": "class RateLimiter {\n  constructor(limit = 100) {\n    this.limit = limit;\n    this.requests = new Map(); \n  }\n  isAllowed(ip) {\n    // Implement window time checks\n    return true;\n  }\n}",
        "rationale": "Evaluates algorithm state design, complexity bounds, and middleware security paradigms."
    },
    {
        "question_id": 8,
        "domain": "Backend Development",
        "difficulty": "Medium",
        "question_type": "Behavioral/Culture",
        "question_text": "Share a scenario where you had a dispute with a frontend engineer or a product owner regarding API payload design. How did you resolve the conflict pragmatically?",
        "rationale": "Assesses collaboration skills, business empathy, and technical negotiation characteristics."
    }
]

def get_fallback_data(career_goal, domain_str):
    curated_list = []
    for item in LOCAL_QUESTIONS:
        if item["domain"].lower() == domain_str.lower() or item["domain"].lower() in career_goal.lower():
            curated_list.append({
                "id": item["question_id"],
                "type": item["question_type"],
                "question": item["question_text"],
                "solutionTemplate": item.get("solution_template"),
                "rationale": item["rationale"]
            })
            
    if len(curated_list) >= 4:
        return {"questions": curated_list[:4]}
        
    return {
        "questions": [
            {
                "id": 101,
                "type": "Technical core",
                "question": f"How would you describe the core operational dataflow within high-availability system nodes for {career_goal}?",
                "rationale": "Checks operational architecture awareness and concurrency capabilities."
            },
            {
                "id": 102,
                "type": "Technical gap",
                "question": "Detail the critical operational trade-offs of using Redis caching layers to store user profiles vs cold hard relational databases.",
                "rationale": "Tests system state handling and latency performance understanding."
            },
            {
                "id": 103,
                "type": "Practical coding assessment",
                "question": "Implement a function that detects circular references or duplicate entries inside a nested structure map. State complexity metrics.",
                "solutionTemplate": "function detectDuplicates(data) {\n  # Implement logic\n  return false;\n}",
                "rationale": "Verifies basic recursion and graph-traversal coding capabilities."
            },
            {
                "id": 104,
                "type": "Behavioral/Culture",
                "question": "Describe a time when you received harsh criticism on a pull request from a tech lead. How did you handle the review feedback?",
                "rationale": "Assesses emotional maturity, feedback intake, and team chemistry."
            }
        ]
    }

def main():
    payload = read_input()
    career_goal = payload.get("careerGoal", "AI Software Developer")
    domain_str = payload.get("domain", "AI/ML Engineer")
    selected_skills = payload.get("selectedSkills", [])
    skill_set_str = ", ".join(selected_skills) if isinstance(selected_skills, list) else "None specified"
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(career_goal, domain_str))
        
    prompt = f"""You are a legendary Senior Technical Interviewer and Engineering Manager at a high-growth tech startup.
Configure an in-depth interview panel for a developer targeting: "{career_goal}" under the domain category "{domain_str}".
Candidate is familiar with: {skill_set_str}.

Create exactly 4 robust questions covering these components exactly:
- Question 1 (Core Theory): Deep conceptual query about architectures, models or infrastructure specific to {domain_str}.
- Question 2 (Technical Gap / Concept): Dynamic, challenging query focusing on typical gaps, trade-offs, or database/performance parameters.
- Question 3 (Practical coding assessment): High-fidelity algorithmic coding problem with a clear instructions outline and a code starter template snippet.
- Question 4 (Behavioral/Culture): Situational problem to check communications under pressure or incident debugging.

Respond with ONLY a clean JSON object containing ALL requests:
{{
  "questions": [
    {{
      "id": 1,
      "type": "Technical core",
      "question": " Conceptual prompt goes here",
      "rationale": "Why this matches real world roles"
    }},
    {{
      "id": 2,
      "type": "Technical gap",
      "question": "Challenging tradeoff scenario prompt",
      "rationale": "Evaluation indicators focus"
    }},
    {{
      "id": 3,
      "type": "Practical coding assessment",
      "question": "Coding/Algorithmic task details",
      "solutionTemplate": "Starter code templates in Python/JS",
      "rationale": "What correctness metrics are checked"
    }},
    {{
      "id": 4,
      "type": "Behavioral/Culture",
      "question": "Behavioral scenario question",
      "rationale": "Empathy, communication and conflict checks"
    }}
  ]
}}
Do not include any intro, outro, or markdown formatting backticks."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error starting interview: {e}\n")
        write_output(get_fallback_data(career_goal, domain_str))

if __name__ == "__main__":
    main()
