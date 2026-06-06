import os
import sys
import json
from common import read_input, write_output, call_llm

def get_fallback_data(goal, skills, gaps):
    is_ai_or_data = any(x in goal.lower() for x in ["ai", "ml", "machine", "data", "analytics", "python"])
    
    if is_ai_or_data:
        return {
            "roadmap": [
                {
                    "phaseNumber": 1,
                    "title": "Phase 1: Python Core Foundations, Computational Packages & Object-Oriented Structures",
                    "topics": [
                        {
                            "name": "Python Core Syntax, Variables & Control flows",
                            "difficulty": "Beginner",
                            "estimatedTime": "1 week",
                            "description": "Master the foundational syntax for all machine learning scripts: declare raw variables, manage logic with IF/ELSE clauses, write looping FOR/WHILE cycles to parse input records, and handle errors using try-except blocks."
                        },
                        {
                            "name": "Essential Python Compound Data Structures (Lists, Dicts, Tuples, Sets)",
                            "difficulty": "Beginner",
                            "estimatedTime": "1 week",
                            "description": "Learn to handle complex data matrices in memory: construct mutable index-ordered Lists, utilize fast key-value Dictionary maps, build read-only immutable Tuples to store schema definitions, and clear double entries using Sets."
                        },
                        {
                            "name": "Object-Oriented Programming (OOP) & Modular Code Practices",
                            "difficulty": "Medium",
                            "estimatedTime": "1-2 weeks",
                            "description": "Transition from basic scripting to professional pipeline design: write modular Python classes, initialize attributes inside constructor __init__ scopes, manage inheritance, and configure clean reusable modules."
                        },
                        {
                            "name": "Scientific Math & Tabular Analytics in Python (NumPy & Pandas Foundations)",
                            "difficulty": "Medium",
                            "estimatedTime": "2 weeks",
                            "description": "The structural baseline of any AI or Data pipeline: perform high-speed matrix equations using multidimensional NumPy arrays, and leverage Pandas DataFrames to load, clean, filter, and manipulate raw datasets."
                        }
                    ],
                    "recommendedCourses": [
                        {"name": "Python for Everybody Specialization", "platform": "Coursera", "type": "Certification"},
                        {"name": "Data Manipulation with Pandas & NumPy", "platform": "Coursera", "type": "Course"}
                    ],
                    "projects": [
                        {
                            "title": "Local Tabular Data Cleansing Engine",
                            "description": "Build a modular, OOP-compliant filesystem analyzer that ingests dirty tabular CSV documents, cleans empty values using Pandas, transforms metrics dynamically, and exports vector data.",
                            "skillsUtilized": ["Python", "Pandas", "NumPy", "OOP Concepts"]
                        }
                    ],
                    "certifications": [
                        {"name": "Python Institute Certified Entry-Level Programmer", "provider": "Python Institute"}
                    ]
                },
                {
                    "phaseNumber": 2,
                    "title": "Phase 2: Statistical Inference, Supervised Modeling & PyTorch Deep Learning",
                    "topics": [
                        {
                            "name": "Statistical Inference & Outlier Elimination Metrics",
                            "difficulty": "Medium",
                            "estimatedTime": "1 week",
                            "description": "Establish mathematical baseline evaluations: calculate variance offsets, calculate standard dev spreads, identify outline anomalies, and handle target bias metrics correctly."
                        },
                        {
                            "name": "Supervised Algorithm Training with SciKit-Learn",
                            "difficulty": "Medium",
                            "estimatedTime": "2 weeks",
                            "description": "Train active modeling estimators: build supervised machine learning classifications (e.g., Random Forests, Support Vector Machines) and regressions to output target estimations cleanly."
                        },
                        {
                            "name": "Deep Learning Network Layers & Tensor Operations (PyTorch Core)",
                            "difficulty": "Hard",
                            "estimatedTime": "2-3 weeks",
                            "description": "Build structured deep learning engines: design stacked neural network layers, calculate weights backpropagation gradients, optimize loss criteria, and execute training loops on local/remote processors."
                        }
                    ],
                    "recommendedCourses": [
                        {"name": "Deep Learning Specialization (Andrew Ng)", "platform": "Coursera", "type": "Certification"},
                        {"name": "Applied Machine Learning with Scikit-Learn", "platform": "Udemy", "type": "Course"}
                    ],
                    "projects": [
                        {
                            "title": "Live Hyperparameter Predictive Tuning Pipeline",
                            "description": "Train of multi-layer regression neural models across active files, tracking learning rate losses and printing real-time console reports on best parameters.",
                            "skillsUtilized": ["PyTorch", "SciKit-Learn", "Python"]
                        }
                    ],
                    "certifications": [
                        {"name": "AWS Certified Machine Learning Specialty", "provider": "Amazon Web Services"}
                    ]
                },
                {
                    "phaseNumber": 3,
                    "title": "Phase 3: Continuous MLOps Pipelines, Containerized Service Layers & Live Telemetry",
                    "topics": [
                        {
                            "name": "Multi-Stage Docker Sandboxed Containers for AI Models",
                            "difficulty": "Medium",
                            "estimatedTime": "1 week",
                            "description": "Abolish machine compatibility failure points: write multi-stage Dockerfiles caching requirement.txt packages, expose web ports, and mount fast localized models directories."
                        },
                        {
                            "name": "Unified Model Run Tracking & Parameter Registries (MLflow Setup)",
                            "difficulty": "Hard",
                            "estimatedTime": "2 weeks",
                            "description": "Build a reliable monitoring station: write automated hooks inside Python scripts logging accuracy, hyperparameter trends, and storing versions of weights binaries inside centralized charts."
                        },
                        {
                            "name": "Automated Deployment Pipelines, Web APIs & Github Gateways",
                            "difficulty": "Hard",
                            "estimatedTime": "2 weeks",
                            "description": "Prepare professional endpoints: wrap trained prediction weights in validation-gated FastAPIs, deploy safe GitHub Action unit tests, and configure load balancer routing."
                        }
                    ],
                    "recommendedCourses": [
                        {"name": "Machine Learning Engineering for Production (MLops)", "platform": "Coursera", "type": "Specialization"}
                    ],
                    "projects": [
                        {
                            "title": "Industrial Grade AutoML Containerized Gateway",
                            "description": "Integrate a full cycle engine that receives raw CSV inputs, trains a model, saves performance states in MLflow, compiles a Docker stack, and exposes a healthy FastAPI gateway.",
                            "skillsUtilized": ["Docker", "MLflow", "FastAPI", "GitHub Actions"]
                        }
                    ],
                    "certifications": [
                        {"name": "TensorFlow Developer Certificate", "provider": "Google"}
                    ]
                }
            ]
        }
    else:
        return {
            "roadmap": [
                {
                    "phaseNumber": 1,
                    "title": "Phase 1: Basic Programming Logic, Structure Schemas & Code-Isolation Environments",
                    "topics": [
                        {
                            "name": "Language Syntax Variables, Logical Operators & Control Flows",
                            "difficulty": "Beginner",
                            "estimatedTime": "1 week",
                            "description": "Master the foundational computer logic of systems engineering: initialize type variables, write conditional checks to isolate software loops, and configure optimized iteration patterns safely."
                        },
                        {
                            "name": "System Data Structures, Arrays Operations & Map Pools",
                            "difficulty": "Beginner",
                            "estimatedTime": "1 week",
                            "description": "Organize raw inputs in browser and server memories: master indexable arrays, hash map grids, key-value models, nested record datasets, and clear redundant entries with Sets."
                        },
                        {
                            "name": "Object-Oriented Design Rules & Modular Class Decouplers",
                            "difficulty": "Medium",
                            "estimatedTime": "1-2 weeks",
                            "description": "Block system repetitions: write custom classes, encapsulate variables via constructors, define clean interfaces, and assemble decoupled code structures easily."
                        },
                        {
                            "name": "Local Sandboxed Systems Container Orchestration (Docker Essentials)",
                            "difficulty": "Medium",
                            "estimatedTime": "1 week",
                            "description": "Eradicate machine compatibility friction: build and compile lightweight Dockerfiles that install system environments, bind server ports, and manage volume links."
                        }
                    ],
                    "recommendedCourses": [
                        {"name": "Modern Software Construction & Design Patterns", "platform": "edX", "type": "Course"},
                        {"name": "Docker Fundamentals for Modern Teams", "platform": "Udemy", "type": "Course"}
                    ],
                    "projects": [
                        {
                            "title": "Decoupled Containerized Gateway Proxy Router",
                            "description": "Compile and run a stateful proxy router inside Docker that intercepts client web requests, balances server traffic, and isolates errors cleanly.",
                            "skillsUtilized": ["TypeScript", "Docker", "Git"]
                        }
                    ],
                    "certifications": [
                        {"name": "Associate Software Developer Pro", "provider": "RedHat"}
                    ]
                },
                {
                    "phaseNumber": 2,
                    "title": "Phase 2: Server Routing Schemas, Schema Validation Gates & Data Stores",
                    "topics": [
                        {
                            "name": "Contract Validation Schemas & Anti-Injection API Routing",
                            "difficulty": "Medium",
                            "estimatedTime": "1-2 weeks",
                            "description": "Defend endpoints against wrong inputs: write Express middleware parsing incoming JSON strings, inject strict schema filtering rules, and format clean consistent API replies."
                        },
                        {
                            "name": "Data Modeling, Cache Schemas & SQL Database Optimizations",
                            "difficulty": "Hard",
                            "estimatedTime": "2 weeks",
                            "description": "Master transaction record architecture: design clean relative SQL structures, compile database performance indices to avoid bottlenecks, and hook up Redis caches."
                        }
                    ],
                    "recommendedCourses": [
                        {"name": "Node.js with Express & Relational Databases Boot Camp", "platform": "Udemy", "type": "Course"}
                    ],
                    "projects": [
                        {
                            "title": "High-Throughput Caching Data Ingestion Hub",
                            "description": "Assemble a multi-route server validating payloads, caching redundant lookups on real-time Redis queues, and archiving records.",
                            "skillsUtilized": ["SQL", "Redis", "TypeScript"]
                        }
                    ],
                    "certifications": [
                        {"name": "MySQL Professional Developer Cert", "provider": "Oracle"}
                    ]
                },
                {
                    "phaseNumber": 3,
                    "title": "Phase 3: Cloud Clusters, Automated GitHub Action Sprints & Telemetry Charts",
                    "topics": [
                        {
                            "name": "Continuous Integration Sprints & Regression GitHub Action Workflows",
                            "difficulty": "Medium",
                            "estimatedTime": "1 week",
                            "description": "Harness continuous verification pipelines: write scripts triggered by commits that automatically test file types and run unit checks before merges."
                        },
                        {
                            "name": "Kubernetes Pod Cluster Deployment & Node Auto-Scaling Limits",
                            "difficulty": "Hard",
                            "estimatedTime": "2 weeks",
                            "description": "Master Cloud Infrastructure scalability: write robust YAML manifest pods, build load balancers, and structure automated cluster scaling limits."
                        },
                        {
                            "name": "Advanced Unified Telemetry Graphs, Error Trails & SRE Alarms",
                            "difficulty": "Hard",
                            "estimatedTime": "1 week",
                            "description": "Protect system uptime: plot request latency metrics on operational charts, analyze system memory leaks, and trigger quick email alerts on crashes."
                        }
                    ],
                    "recommendedCourses": [
                        {"name": "SRE Reliability Foundations Strategy", "platform": "Coursera", "type": "Course"}
                    ],
                    "projects": [
                        {
                            "title": "Unified Live Performance Telemetry Dashboard",
                            "description": "Build a complete real-time dashboard showing application workloads, tracking database response speed, and posting message alerts on broken sockets.",
                            "skillsUtilized": ["Prometheus", "Kubernetes", "Shell Streams"]
                        }
                    ],
                    "certifications": [
                        {"name": "Kubernetes Certified Administrator (CKA)", "provider": "Linux Foundation"}
                    ]
                }
            ]
        }

def main():
    payload = read_input()
    goal = payload.get("careerGoal", "AI Systems Architect")
    skills = payload.get("currentSkills", [])
    gaps = payload.get("skillGaps", [])
    
    use_real_ai = bool(os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    if not use_real_ai:
        write_output(get_fallback_data(goal, skills, gaps))
        
    prompt = f"""You are an elite curriculum lead architect. Create a highly structured, fully explained, and extremely comprehensive phase-by-phase learning roadmap for a developer targeting: "{goal}"
Current acquired skills: {json.dumps(skills)}
Stated talent gaps: {json.dumps(gaps)}

STRICT STRUCTURAL REQUIREMENTS:
1. Divide the curriculum into exactly 3 progressive phases (Phase 1, Phase 2, Phase 3).
2. Phase 1 MUST target core programming and system foundations.
   - For AI, Machine Learning, Data Science, Data Engineering, or Python pipelines: Phase 1 MUST begin with an extensive, highly granular, step-by-step programming language foundation (specifically Python). Do not just list a generic "Python Basics" topic. Break it down into concrete, understandable topics (specifically: Python Core Syntax & loops, Essential Compound Structures (Lists, Dicts, Sets), Object-Oriented Programming (OOP) in Python, and mathematical/tabular manipulation libraries NumPy and Pandas).
   - For Web Development or general Software Engineering: Phase 1 MUST similarly start with core software programming foundations (e.g., JavaScript/TypeScript variables, functions, scopes, array methods, DOM/runtime engines, and basic environment sandboxes like Docker).
3. For EVERY topic generated in EVERY phase, you MUST provide active, detailed beginner-friendly parameters:
   - "name": A highly specific, professional title (e.g., "Python Core Syntax & Control flow structures" instead of "Python").
   - "difficulty": Must be "Beginner", "Medium", or "Hard".
   - "estimatedTime": e.g., "1 week", "2 weeks".
   - "description": A highly detailed, explanatory paragraph (at least 3-4 clear, comprehensive sentences) explaining:
      - Exactly what the concept is and its technical purpose.
      - Why it is a critical prerequisite to master before advancing.
      - Actionable sub-skills, specific libraries, or syntaxes they must practice coding to master it (e.g., list comprehensions, object constructor methods, matrix formulas).
4. For recommended courses, projects, and certifications: Make them popular, specific, and realistic names mapped precisely to the phase targets.

Return ONLY a valid stringified JSON structure matching this exact shape:
{{
  "roadmap": [
    {{
      "phaseNumber": 1,
      "title": "Professional descriptive Phase Title, starting explicitly with foundations",
      "topics": [{{ "name": "...", "difficulty": "Medium", "estimatedTime": "1 week", "description": "..." }}],
      "recommendedCourses": [{{ "name": "...", "platform": "Coursera", "type": "Course" }}],
      "projects": [{{ "title": "...", "description": "...", "skillsUtilized": ["...", "..."] }}],
      "certifications": [{{ "name": "...", "provider": "..." }}]
    }}
  ]
}}
Do not return any introductory remarks or surround the JSON with backticks. Provide pure, parser-ready JSON."""

    try:
        text_output = call_llm(prompt, True)
        cleaned = text_output.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "", 1).replace("```", "").strip()
        write_output(json.loads(cleaned))
    except Exception as e:
        sys.stderr.write(f"Error generating roadmap LLM: {e}\n")
        write_output(get_fallback_data(goal, skills, gaps))

if __name__ == "__main__":
    main()
