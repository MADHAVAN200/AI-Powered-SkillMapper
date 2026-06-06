import os
import sys
import json
import random
from common import read_input, write_output, call_llm

def get_fallback_data(name, degree, exp_level, goal, skills):
    t_goal = goal or "AI Software Engineer"
    user_skills_list = skills if skills and len(skills) > 0 else ["React", "JavaScript", "Python"]
    
    skills_data = []
    for idx, s in enumerate(user_skills_list):
        category = "Programming" if idx % 3 == 0 else "Databases" if idx % 3 == 1 else "AI/ML"
        skills_data.append({
            "name": s,
            "category": category,
            "proficiency": random.randint(0, 19) + 65,  # 65-84
            "description": f"Demonstrates comfortable implementation knowledge of {s}."
        })
    skills_data.append({
        "name": "Communication",
        "category": "Soft Skills",
        "proficiency": 85,
        "description": "Excellent professional articulation and documentation design."
    })
    
    skill_gaps = [
        {
            "skillName": "TensorFlow" if ("ai" in t_goal.lower() or "data" in t_goal.lower()) else "System Architecture",
            "priority": "High",
            "whyNeeded": f"Essential component of top-tier role requirements for {t_goal}."
        },
        {
            "skillName": "MLOps & Cloud Deployments" if ("ai" in t_goal.lower() or "data" in t_goal.lower()) else "Docker & Kubernetes",
            "priority": "High",
            "whyNeeded": f"Crucial for operationalizing scale and continuous integration as a {t_goal}."
        },
        {
            "skillName": "System Design for Scale",
            "priority": "Medium",
            "whyNeeded": "Required to optimize high-performance services and ensure robust data flow."
        }
    ]
    
    career_paths = [
        {
            "title": t_goal,
            "matchScore": 78,
            "salaryRange": "₹12L - ₹25L",
            "marketDemand": "Very High",
            "description": f"Directly targets tasks combining user's experience with engineering competencies."
        },
        {
            "title": "Data Architect" if "ai" in t_goal.lower() else "Systems Developer",
            "matchScore": 65,
            "salaryRange": "₹14L - ₹28L",
            "marketDemand": "High",
            "description": "Alternative career track prioritizing robust database structures and pipelines."
        }
    ]
    
    resume_analysis = {
        "atsScore": 72,
        "strengths": [
            "Consistent programming experience listed in user profile.",
            "Solid educational alignment with target fields.",
            "Good core tech stack keywords."
        ],
        "improvements": [
            "Quantify achievements (e.g., 'Improved database query load time by 30%').",
            f"Directly integrate key terminologies matching current {t_goal} hiring specifications.",
            "Highlight collaborative team lead tasks or system design experience."
        ],
        "formattingScore": 85,
        "keywordCompleteness": 64,
        "atsFeedback": "Your profile has high potential but lacks empirical metrics. Transform task descriptions from passive statements into result-oriented sentences."
    }
    
    learning_roadmap = [
        {
            "phaseNumber": 1,
            "title": "Phase 1: Algorithmic Fundamentals & Object-Oriented Blueprint Architecture",
            "topics": [
                {
                    "name": "Object-Oriented Design & Decoupled Architecture Concepts",
                    "difficulty": "Medium",
                    "estimatedTime": "1-2 weeks",
                    "description": f"Establish highly scalable design foundations for {t_goal}: separate business controllers, build abstract interfaces to prevent tightly coupled code, and create automated test suites."
                },
                {
                    "name": "System Data Scalability & Low-level Isolation Containers",
                    "difficulty": "Medium",
                    "estimatedTime": "2 weeks",
                    "description": "Orchestrate clean isolated sandbox folders: compile lightweight Dockerfiles caching common layers, map local static directory paths, and bind internal network ports."
                }
            ],
            "recommendedCourses": [
                {"name": "Practical System Design Paradigms", "platform": "YouTube / edX", "type": "Course"},
                {"name": "Containerization & Docker Core Specialist", "platform": "Coursera", "type": "Certification"}
            ],
            "projects": [
                {
                    "title": "Scalable Event-Driven Local Orchestrator",
                    "description": "Build an isolated message coordinator with dedicated task workers, handling concurrency without blocking main loops.",
                    "skillsUtilized": ["Node.js", "Redis", "Docker", "Syllabus Design"]
                }
            ]
        },
        {
            "phaseNumber": 2,
            "title": "Phase 2: Target Capability Deep-Dive, API Contractual Layers & Core Workloads",
            "topics": [
                {
                    "name": "API Spec Contracts & Dynamic Input Validator Gates",
                    "difficulty": "Medium",
                    "estimatedTime": "1-2 weeks",
                    "description": "Install strict runtime validating boundaries on incoming payloads. Avoid structural database injection queries, and format clean standardized JSON API results."
                },
                {
                    "name": "Neural Networks & Live Hyperparameter Tracers" if ("ai" in t_goal.lower() or "data" in t_goal.lower()) else "High-Availability Multi-Tier Container Blueprints",
                    "difficulty": "Hard",
                    "estimatedTime": "3 weeks",
                    "description": "Orchestrate live deep learning models: set up tracking pipelines reporting dynamic loss metrics, compare accuracy drift indices, and save model binary files securely." if ("ai" in t_goal.lower() or "data" in t_goal.lower()) else "Design high-availability cloud configurations: build multi-pod load balancers, assemble secure ingress gateway proxies, and formulate resilient host directory paths."
                }
            ],
            "recommendedCourses": [
                {
                    "name": "Deep Learning Specialization (Andrew Ng)" if ("ai" in t_goal.lower() or "data" in t_goal.lower()) else "Docker & Kubernetes Complete Bootcamp",
                    "platform": "Coursera / Udemy",
                    "type": "Course"
                }
            ],
            "projects": [
                {
                    "title": "Full-Stack Predictive Automation Pipeline" if ("ai" in t_goal.lower() or "data" in t_goal.lower()) else "Elastic Fault-Tolerant microservices Node Group",
                    "description": "Construct and run a complete multi-layered container set connecting to real-time telemetry endpoints.",
                    "skillsUtilized": ["Python", "Docker", "GCP", "Express"]
                }
            ]
        },
        {
            "phaseNumber": 3,
            "title": "Phase 3: Automated Release Pipelines & Production Site-Reliability Operations",
            "topics": [
                {
                    "name": "Automated Release Integrations & Git Webhooq Testing Workflows",
                    "difficulty": "Medium",
                    "estimatedTime": "1 week",
                    "description": "Write automated GitHub validation routines verifying all type safety constraints and launching regression unit-tests before merging any updates into master branch."
                },
                {
                    "name": "Unified System Metrics Telemetry, Alerts & Real-Time Monitoring",
                    "difficulty": "Hard",
                    "estimatedTime": "2 weeks",
                    "description": "Ensure five-nines service uptime: set up telemetry collectors catching memory exhaust triggers, log database load query roundtrip metrics, and hook up custom notification sound alarms."
                }
            ],
            "recommendedCourses": [
                {"name": "Continuous Integration & SRE Site Reliability Foundations", "platform": "edX", "type": "Course"},
                {"name": "Automated Deployment Infrastructures Specialist", "platform": "Google Cloud / Coursera", "type": "Certification"}
            ],
            "projects": [
                {
                    "title": "Dynamic Operational Telemetry Capstone Dashboard",
                    "description": "Deploy a live dashboard displaying continuous response logs, tracking CPU consumption, and raising priority notifications for any broken network socket connections.",
                    "skillsUtilized": ["GitHub Actions", "Prometheus", "Linux Streams", "InfluxDB"]
                }
            ]
        }
    ]
    
    return {
        "skills": skills_data,
        "skillGaps": skill_gaps,
        "careerPaths": career_paths,
        "resumeAnalysis": resume_analysis,
        "learningRoadmap": learning_roadmap
    }

def main():
    payload = read_input()
    name = payload.get("name")
    degree = payload.get("degree")
    experience_level = payload.get("experienceLevel")
    career_goal = payload.get("careerGoal")
    known_skills = payload.get("knownSkills", [])
    resume_text = payload.get("resumeText")
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        fallback = get_fallback_data(name, degree, experience_level, career_goal, known_skills)
        fallback["info"] = "LLM API key is missing. Tailored interactive mockup generated."
        write_output(fallback)
        
    clean_skills = known_skills if isinstance(known_skills, list) else []
    
    prompt = f"""You are a world-class AI Career Coach, Skill Analytics Platform advisor and ATS Resume Optimizer.
Analyze the user's detailed profile and target career goals to perform an exhaustive, custom-tailored mapping analysis.

USER PROFILE DETAILS:
- Candidate Name: {name or "User"}
- Degree & Major / Current Role: {degree or "CS Student / Professional"}
- Professional Experience Level: {experience_level or "Entry Level / Junior"}
- Desired Target Career Goal: {career_goal or "Full Stack developer / AI Engineer"}
- Current Stated Skills: {", ".join(clean_skills) if clean_skills else "None specified yet"}
- Extracted Resume Texts / Current Job History: {resume_text or "No resume texts supplied"}

Evaluate and calculate realistic career outcomes. Based on their target roles, identify precisely what actual technical skill gaps they must focus on to secure modern employment in the industry.
Also, perform a meticulous ATS score analysis on their resume metadata, highlighting critical improvement points (e.g. adding quantifiable metrics, key-terms match). Provide a highly actionable, phase-by-phase learning roadmap as well.

Produce your output ONLY as a valid and well-formatted JSON structure matching exactly this interface:
{{
  "skills": [
    {{ "name": "Skill Name", "category": "Programming" | "AI/ML" | "Cloud" | "Databases" | "Soft Skills" | "Other", "proficiency": 80, "description": "Quick description of current mastery level and uses" }}
  ],
  "skillGaps": [
    {{ "skillName": "Missing Tool/Concept", "priority": "High" | "Medium" | "Low", "whyNeeded": "Why it's essential for achieving their specified career goal" }}
  ],
  "careerPaths": [
    {{ "title": "Career Role Title", "matchScore": 85, "salaryRange": "e.g. ₹12L - ₹25L or $110,000 - $160,000", "marketDemand": "Very High" | "High" | "Medium" | "Low", "description": "What this role entails and their alignment" }}
  ],
  "resumeAnalysis": {{
    "atsScore": 75,
    "strengths": ["list of 3 items highlighting what resume does right"],
    "improvements": ["list of 3 items highlighting what resume must rewrite/upgrade"],
    "formattingScore": 80,
    "keywordCompleteness": 70,
    "atsFeedback": "Overall diagnostic review stating precisely how to raise keyword compatibility."
  }},
  "learningRoadmap": [
    {{
      "phaseNumber": 1,
      "title": "Phase Title",
      "topics": [
        {{ "name": "Subtopic Name", "difficulty": "Beginner" | "Medium" | "Hard", "estimatedTime": "1-2 weeks", "description": "3-4 detailed sentences explaining the subtopic" }}
      ],
      "recommendedCourses": [
        {{ "name": "Specific High-Quality Course Name", "platform": "Coursera" | "Udemy" | "YouTube" | "edX" | "Google", "type": "Course" | "Certification" }}
      ],
      "projects": [
        {{ "title": "Practical Portfolio Project Name", "description": "Brief, compelling summary of what to build asynchronously", "skillsUtilized": ["Skill1", "Skill2"] }}
      ]
    }}
  ]
}}

Strict Rule: Return ONLY valid, stringified JSON. No Markdown formatting backticks (```json ... ```), no conversational prefix/suffix, just the clean JSON object. Make sure the JSON parser won't throw errors. Use double quotes for property names."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        parsed = json.loads(cleaned)
        write_output(parsed)
    except Exception as e:
        sys.stderr.write(f"Error parsing profile analysis: {e}\n")
        # Fallback to local calibration heuristics
        fallback = get_fallback_data(name, degree, experience_level, career_goal, known_skills)
        fallback["info"] = "Offline calibration analyzer fell back successfully."
        write_output(fallback)

if __name__ == "__main__":
    main()
