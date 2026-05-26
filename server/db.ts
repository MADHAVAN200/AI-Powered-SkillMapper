import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Shadow console.log to silence database logs locally in this module
const console = {
  ...globalThis.console,
  log: (..._args: any[]) => {}
};

// Path to the SQLite database file directly in the project working directory
const DB_PATH = path.join(process.cwd(), "local.db");

let dbInstance: sqlite3.Database;

/**
 * Initialize SQLite database, create tables, and seed initial data
 */
export async function initDb(): Promise<void> {
  console.log(`🔌 Initializing SQLite Local Database in working directory: ${DB_PATH}...`);
  
  return new Promise((resolve, reject) => {
    dbInstance = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error("💥 Failed to open local SQLite file:", err);
        return reject(err);
      }
      console.log("✅ Successfully connected to local SQLite database!");

      // Enable foreign keys
      dbInstance.run("PRAGMA foreign_keys = ON;");

      // Load schema migrations
      try {
        const schemaPath = path.join(process.cwd(), "local-sqlite-schema.sql");
        if (fs.existsSync(schemaPath)) {
          console.log("📖 Reading local SQLite schema...");
          const schemaSql = fs.readFileSync(schemaPath, "utf8");
          
          // Split queries by semicolon to execute them sequentially in SQLite
          const queries = schemaSql
            .split(/;\s*$/m)
            .map(q => q.trim())
            .filter(q => q.length > 0);

          console.log("⚙️ Running table creation migrations...");
          for (const query of queries) {
            await runCommand(query);
          }
          console.log("✅ All SQLite tables and indexes are ready!");
        } else {
          console.warn("⚠️ Warning: local-sqlite-schema.sql was not found at root!");
        }
      } catch (migrationErr) {
        console.error("❌ SQLite Migration execution failed:", migrationErr);
        return reject(migrationErr);
      }

      // Seed default datasets
      try {
        await seedDefaultData();
        resolve();
      } catch (seedErr) {
        reject(seedErr);
      }
    });
  });
}

/**
 * Run a command (INSERT, UPDATE, DELETE, CREATE TABLE)
 */
function runCommand(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    dbInstance.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Run a query (SELECT) returning all matching rows
 */
function runQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    dbInstance.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Parse any JSON text strings back to JSON objects / arrays automatically
 */
function parseJsonFields(row: any) {
  if (!row) return row;
  const clean: any = {};
  for (const key of Object.keys(row)) {
    const val = row[key];
    if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
      try {
        clean[key] = JSON.parse(val);
      } catch {
        clean[key] = val;
      }
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Seed initial showcase datasets in SQLite
 */
async function seedDefaultData() {
  // A. Seed Technologies
  const techCheck = await runQuery("SELECT COUNT(*) as count FROM technologies");
  if (techCheck[0].count === 0) {
    console.log("🌱 Seeding technologies table...");
    const techSeeds = [
      ["Generative AI", 182],
      ["Kubernetes", 95],
      ["Python Programming", 120],
      ["FastAPI Architecture", 140],
      ["Docker Containerization", 80],
      ["React & Tailwind CSS", 75],
      ["PostgreSQL Database", 110],
      ["TypeScript Security", 115]
    ];
    for (const [name, score] of techSeeds) {
      const uuid = crypto.randomUUID();
      await runCommand(
        "INSERT INTO technologies (technology_id, technology_name, growth_score) VALUES (?, ?, ?)",
        [uuid, name, score]
      );
    }
  }

  // B. Seed Skill Trends
  const skillCheck = await runQuery("SELECT COUNT(*) as count FROM skill_trends");
  if (skillCheck[0].count === 0) {
    console.log("🌱 Seeding skill_trends table...");
    const skillSeeds = [
      ["PyTorch", 95, 35],
      ["TensorFlow", 90, 25],
      ["MLOps & Pipelines", 98, 40],
      ["LangChain RAG", 92, 38],
      ["Kubernetes Nodes", 88, 30],
      ["PostgreSQL pgvector", 82, 20],
      ["TypeScript Types", 85, 15]
    ];
    for (const [name, demand, impact] of skillSeeds) {
      const uuid = crypto.randomUUID();
      await runCommand(
        "INSERT INTO skill_trends (skill_id, skill_name, market_demand, salary_impact) VALUES (?, ?, ?, ?)",
        [uuid, name, demand, impact]
      );
    }
  }

  // C. Seed Salary Analytics
  const salaryCheck = await runQuery("SELECT COUNT(*) as count FROM salary_analytics");
  if (salaryCheck[0].count === 0) {
    console.log("🌱 Seeding salary_analytics table...");
    const salarySeeds = [
      ["AI Systems Engineer", "₹14L - ₹28L", "Bangalore"],
      ["AI Systems Engineer", "₹12L - ₹24L", "Mumbai"],
      ["Full Stack Developer", "₹10L - ₹20L", "Hyderabad"],
      ["Full Stack Developer", "₹9L - ₹18L", "Pune"],
      ["Cloud DevOps Architect", "₹12L - ₹24L", "Global"],
      ["Data Science Specialist", "₹11L - ₹22L", "Delhi NCR"]
    ];
    for (const [role, range, region] of salarySeeds) {
      const uuid = crypto.randomUUID();
      await runCommand(
        "INSERT INTO salary_analytics (role_id, role_name, salary_range, region) VALUES (?, ?, ?, ?)",
        [uuid, role, range, region]
      );
    }
  }

  // D. Seed Hiring Trends
  const hiringCheck = await runQuery("SELECT COUNT(*) as count FROM hiring_trends");
  if (hiringCheck[0].count === 0) {
    console.log("🌱 Seeding hiring_trends table...");
    const hiringSeeds = [
      ["AI Systems Engineer", 45000, 38],
      ["Full Stack Developer", 95000, 18],
      ["Cloud DevOps Architect", 35000, 25],
      ["Data Science Specialist", 50000, 22]
    ];
    for (const [role, openings, rate] of hiringSeeds) {
      const uuid = crypto.randomUUID();
      await runCommand(
        "INSERT INTO hiring_trends (role_id, role_name, job_openings, growth_rate) VALUES (?, ?, ?, ?)",
        [uuid, role, openings, rate]
      );
    }
  }

  // E. Seed Interview Questions
  const questionCheck = await runQuery("SELECT COUNT(*) as count FROM interview_questions");
  if (questionCheck[0].count === 0) {
    console.log("🌱 Seeding interview_questions bank...");
    const questionSeeds = [
      [
        "AI Systems Engineer",
        "Hard",
        "Technical core",
        "Explain the key architectural differences between dense retrieval models and sparse retrieval (BM25) systems in a production-ready RAG application. How does vector database dimensionality impact lookups?",
        "// Design abstract prompt mapping vectors\nfunction queryVectorDb(queryText, dim = 1536) {\n  // Implement RAG retrieval layers\n}",
        "Evaluates candidate depth in semantic neural search architectures, index quantization algorithms (HNSW vs IVF-Flat), and operational trade-offs."
      ],
      [
        "AI Systems Engineer",
        "Medium",
        "Technical gap",
        "What is data drift and concept drift in live production ML models? Provide a concrete workflow of how you would detect accuracy degradation in an image classification service.",
        "// Monitor prediction shifts\nfunction calculateDrift(baselinePayload, currentPayload) {\n  // Implement Kolomogorov-Smirnov check\n}",
        "Verifies competence in continuous deployment lifecycle operations, telemetry thresholds, and system health triggers."
      ],
      [
        "Full Stack Developer",
        "Medium",
        "Technical core",
        "Describe how React 19's Server Components model handles concurrency and data fetching compared to traditional Client-Side Hydration (SPA). Highlight potential waterfalls and their preventions.",
        "// Express SSR API gateway endpoint\napp.get('/api/dashboard', async (req, res) => {\n  // Stream render layout\n});",
        "Assesses understanding of contemporary rendering structures, web latency improvements, and node performance specifications."
      ],
      [
        "Full Stack Developer",
        "Hard",
        "Practical coding assessment",
        "Write a thread-safe, high-concurrency memory cache pool in JavaScript/Node.js that enforces strict Least Recently Used (LRU) eviction rules. Ensure lookup operates in O(1) time.",
        "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n  \n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n  }\n}",
        "Validates advanced low-level algorithm optimizations, double-linked hash lists, and solid data flow controls."
      ],
      [
        "Cloud DevOps Architect",
        "Medium",
        "Technical core",
        "What is the difference between Blue-Green deployments and Canary deployments? How do you orchestrate traffic splitting in an Nginx Ingress Controller inside a Kubernetes cluster?",
        "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  annotations:\n    nginx.ingress.kubernetes.io/canary: \"true\"\n    nginx.ingress.kubernetes.io/canary-weight: \"10\"",
        "Tests structural reliability knowledge, cluster deployment controllers, and microservice traffic configurations."
      ]
    ];

    for (const [domain, diff, qType, text, solution, rationale] of questionSeeds) {
      await runCommand(
        `INSERT INTO interview_questions (domain, difficulty, question_type, question_text, solution_template, rationale)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [domain, diff, qType, text, solution, rationale]
      );
    }
  }

  console.log("🌱 Database seeding complete successfully!");
  
  // F. Seed Showcase Portfolio data for user 'admin'
  try {
    await seedAdminShowcaseData();
  } catch (seedAdminErr) {
    console.error("❌ Warning: Failed to seed admin showcase data:", seedAdminErr);
  }
}

/**
 * Seed comprehensive showcase datasets for user 'admin' (user_id: 'local-admin')
 */
async function seedAdminShowcaseData() {
  console.log("🌱 Seeding rich showcase portfolio dataset for user: admin / password123...");

  // 1. users
  await runCommand(
    `INSERT OR IGNORE INTO users (user_id, full_name, email, password_hash, auth_provider, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ["local-admin", "Portfolio Admin", "admin@skillmapper.local", "password123", "local", 1]
  );

  // 2. user_profiles
  await runCommand(
    `INSERT OR IGNORE INTO user_profiles (id, name, degree, experience_level, career_goal, known_skills, education, bio, preferred_learning_style, github_url, linkedin_url, target_industry, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "local-admin",
      "Portfolio Admin",
      "M.S. in Computer Science & Artificial Intelligence",
      "Senior (5+ Years)",
      "Lead AI Systems Architect",
      JSON.stringify(["Python", "TypeScript", "React", "Docker", "Node.js", "FastAPI", "PyTorch", "Kubernetes", "PostgreSQL", "LangChain"]),
      "Master of Science in Artificial Intelligence, Stanford University",
      "Passionate AI Systems Architect with 6+ years of experience designing and deploying high-performance distributed systems, low-latency neural inference pipelines, and scalable event-driven microservices.",
      "Project-based hands-on labs and low-level source code explorations",
      "https://github.com/portfolio-admin",
      "https://linkedin.com/in/portfolio-admin",
      "Artificial Intelligence & Distributed Systems",
      "Bangalore, KA, India"
    ]
  );

  // 3. mapping_results
  const skillsList = [
    { name: "Python", category: "Programming", proficiency: 95, description: "Expert scripting, asynchronous executors, neural networks, and library design." },
    { name: "TypeScript", category: "Programming", proficiency: 90, description: "Advanced typing paradigms, generic interfaces, and React component structures." },
    { name: "FastAPI", category: "AI/ML", proficiency: 88, description: "Highly scalable endpoint designs, dependency injection gates, and OpenAPI integrations." },
    { name: "Docker", category: "Cloud", proficiency: 85, description: "Lightweight container blueprints, multi-stage builders, and localized cluster sandboxes." },
    { name: "PyTorch", category: "AI/ML", proficiency: 82, description: "Neural model configuration, training iterations, validation telemetry, and model weights export." },
    { name: "PostgreSQL", category: "Databases", proficiency: 80, description: "Complex relational join queries, constraint bindings, and pgvector semantic calculations." }
  ];
  const gapsList = [
    { skillName: "MLOps pipelines", priority: "High", whyNeeded: "Crucial for automated validation, model registry checks, and Git continuous release cycles." },
    { skillName: "Kubernetes orchestration", priority: "Medium", whyNeeded: "Required for dynamic auto-scaling, ingress load balancer bindings, and high-availability pods." },
    { skillName: "System design", priority: "Medium", whyNeeded: "Required to layout decentralized message queues, Redis cache layers, and avoid tight coupling." }
  ];
  const careerList = [
    { title: "Lead AI Systems Architect", matchScore: 92, salaryRange: "₹28L - ₹45L", marketDemand: "Very High", description: "Architect distributed semantic retrieval systems, deploy high-performance LLM engines, and manage production container setups." },
    { title: "Senior Machine Learning Engineer", matchScore: 85, salaryRange: "₹22L - ₹36L", marketDemand: "Sprinting", description: "Train, tune, and package predictive models, orchestrate continuous telemetry lines, and optimize neural latency parameters." }
  ];
  const resumeResult = {
    atsScore: 86,
    strengths: [
      "Consistent lead architectural project narratives detailed.",
      "Excellent high-value keyword indexing (Python, PyTorch, Kubernetes).",
      "Clear structural categorization and modern layout parameters."
    ],
    improvements: [
      "Include more empirical business outcomes (e.g., 'Reduced query latencies by 35%').",
      "Explicitly detail MLOps tools (MLflow, Triton) in project summaries.",
      "Include links to live verified portfolio deployments."
    ],
    formattingScore: 92,
    keywordCompleteness: 80,
    atsFeedback: "Excellent modern technical CV. Adding specific business metric outcomes and quantifying MLOps framework usage will guarantee a 98% interview selection rate."
  };
  const roadmapList = [
    {
      phaseNumber: 1,
      title: "Phase 1: Algorithmic Fundamentals & Object-Oriented Blueprint Architecture",
      topics: [
        { name: "Object-Oriented Design & Decoupled Architecture Concepts", difficulty: "Medium", estimatedTime: "1 week" },
        { name: "System Data Scalability & Low-level Isolation Containers", difficulty: "Medium", estimatedTime: "2 weeks" }
      ],
      recommendedCourses: [
        { name: "Practical System Design Paradigms", platform: "edX", type: "Course" },
        { name: "Containerization & Docker Core Specialist", platform: "Coursera", type: "Certification" }
      ],
      projects: [
        { title: "Scalable Event-Driven Local Orchestrator", description: "Build an isolated message coordinator with dedicated task workers, handling concurrency without blocking main loops.", skillsUtilized: ["Node.js", "Redis", "Docker"] }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Target Capability Deep-Dive, API Contractual Layers & Core Workloads",
      topics: [
        { name: "API Spec Contracts & Dynamic Input Validator Gates", difficulty: "Medium", estimatedTime: "1 week" },
        { name: "Neural Networks & Live Hyperparameter Tracers", difficulty: "Hard", estimatedTime: "3 weeks" }
      ],
      recommendedCourses: [
        { name: "Deep Learning Specialization (Andrew Ng)", platform: "Coursera", type: "Course" }
      ],
      projects: [
        { title: "Full-Stack Predictive Automation Pipeline", description: "Construct and run a complete multi-layered container set connecting to real-time telemetry endpoints.", skillsUtilized: ["Python", "Docker", "Express"] }
      ]
    }
  ];

  await runCommand(
    `INSERT OR IGNORE INTO mapping_results (user_id, skills, skill_gaps, career_paths, resume_analysis, learning_roadmap)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      "local-admin",
      JSON.stringify(skillsList),
      JSON.stringify(gapsList),
      JSON.stringify(careerList),
      JSON.stringify(resumeResult),
      JSON.stringify(roadmapList)
    ]
  );

  // 4. user_skills
  for (const s of skillsList) {
    await runCommand(
      `INSERT OR IGNORE INTO user_skills (user_skill_id, user_id, skill_name, category, proficiency_score, confidence_score, source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), "local-admin", s.name, s.category, s.proficiency, 0.90, "Calibration Matrix"]
    );
  }

  // 5. career_goals
  await runCommand(
    `INSERT OR IGNORE INTO career_goals (goal_id, user_id, target_role, target_salary, target_company, target_timeline_months, readiness_score)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), "local-admin", "Lead AI Systems Architect", "₹28L - ₹45L", "Google / OpenAI", 12, 92.00]
  );

  // 6. mentor_conversations
  await runCommand(
    `INSERT OR IGNORE INTO mentor_conversations (conversation_id, user_id, conversation_title, context_summary)
     VALUES (?, ?, ?, ?)`,
    ["convo-architect-guidance", "local-admin", "AI Architect Career Transition", "Transition details from Senior Developer to Lead AI Architect focusing on distributed vector caches."]
  );

  // 7. mentor_messages
  const dialogue = [
    ["user", "Hey Coach! I want to transition to a Lead AI Systems Architect role. What system architecture skills should I focus on next?"],
    ["assistant", "Excellent choice! As a Lead AI Systems Architect, the core focus shifts from just training models to scale-out distributed inference. You should master: 1) Model quantization (reducing 16-bit parameters to 8-bit to speed up lookups), 2) High-performance serving grids (like Triton or vLLM), and 3) Custom semantic caches using Redis. What experiences do you currently have with model deployment?"],
    ["user", "I have deployed FastAPI servers wrapping PyTorch models in Docker containers, but I haven't done clustering or custom caches yet."],
    ["assistant", "FastAPI + PyTorch in Docker is a perfect foundation! To take it to the next tier, let's design a custom vector lookups cache. This prevents redundant LLM processing and reduces system latency. I suggest a weekend project: connect Redis as an event-driven cache in front of a PyTorch semantic similarity engine. Does this sound like a solid next step?"]
  ];
  for (const [sender, content] of dialogue) {
    await runCommand(
      `INSERT OR IGNORE INTO mentor_messages (message_id, conversation_id, sender_type, message_content, token_count)
       VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), "convo-architect-guidance", sender, content, 120]
    );
  }

  // 8. mentor_memory
  const memories = [
    ["weak_skill", "Kubernetes Clustering", 8.00],
    ["preferred_learning_style", "Hands-on Project Blueprints", 9.50],
    ["career_goal", "Lead AI Systems Architect", 9.80]
  ];
  for (const [type, val, score] of memories) {
    await runCommand(
      `INSERT OR IGNORE INTO mentor_memory (memory_id, user_id, memory_type, memory_key, memory_value, importance_score)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), "local-admin", type, type, val, score]
    );
  }

  // 9. mentor_recommendations
  const recSeeds = [
    ["skill", "Model Quantization", "Master reducing weights precision without score degradation.", "High", "pending", "Resume Intelligence"],
    ["project", "Redis-PyTorch Semantic Cache", "Connect Redis cache in front of model similarity lookups.", "High", "pending", "Skill Analyzer"],
    ["course", "Distributed Systems serving MLOps", "Learn multi-tier orchestration frameworks.", "Medium", "pending", "Career Coach"]
  ];
  for (const [type, title, desc, pri, stat, src] of recSeeds) {
    await runCommand(
      `INSERT OR IGNORE INTO mentor_recommendations (recommendation_id, user_id, recommendation_type, title, description, priority, status, source_module)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), "local-admin", type, title, desc, pri, stat, src]
    );
  }

  // 10. learning_paths
  await runCommand(
    `INSERT OR IGNORE INTO learning_paths (path_id, user_id, target_role, current_phase, completion_percentage, streak, estimated_completion_months)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ["path-architect", "local-admin", "Lead AI Systems Architect", 1, 60.00, 15, 6]
  );

  // 11. learning_phases
  await runCommand(
    `INSERT OR IGNORE INTO learning_phases (phase_id, path_id, phase_name, phase_order, progress, is_completed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ["phase-1", "path-architect", "Phase 1: Algorithmic Fundamentals & Object-Oriented Blueprint Architecture", 1, 100, 1]
  );
  await runCommand(
    `INSERT OR IGNORE INTO learning_phases (phase_id, path_id, phase_name, phase_order, progress, is_completed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ["phase-2", "path-architect", "Phase 2: Target Capability Deep-Dive, API Contractual Layers & Core Workloads", 2, 20, 0]
  );

  // 12. learning_tasks
  const tasks = [
    ["phase-1", "Object-Oriented Design & Decoupled Architecture Concepts", "Topic", "Completed"],
    ["phase-1", "System Data Scalability & Low-level Isolation Containers", "Lab", "Completed"],
    ["phase-2", "API Spec Contracts & Dynamic Input Validator Gates", "Topic", "Pending"],
    ["phase-2", "Neural Networks & Live Hyperparameter Tracers", "Lab", "Pending"]
  ];
  for (const [phId, title, type, stat] of tasks) {
    await runCommand(
      `INSERT OR IGNORE INTO learning_tasks (task_id, phase_id, task_title, task_type, status)
       VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), phId, title, type, stat]
    );
  }

  // 13. courses
  await runCommand(
    `INSERT OR IGNORE INTO courses (course_id, phase_id, skill_name, course_name, provider, difficulty)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), "phase-1", "System Design", "Practical System Design Paradigms", "edX", "Medium"]
  );
  await runCommand(
    `INSERT OR IGNORE INTO courses (course_id, phase_id, skill_name, course_name, provider, difficulty)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), "phase-1", "Docker", "Containerization & Docker Core Specialist", "Coursera", "Medium"]
  );

  // 14. projects
  await runCommand(
    `INSERT OR IGNORE INTO projects (project_id, phase_id, project_title, description, required_skills, difficulty)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      "phase-1",
      "Scalable Event-Driven Local Orchestrator",
      "Build an isolated message coordinator with dedicated task workers, handling concurrency without blocking main loops.",
      JSON.stringify(["Node.js", "Redis", "Docker"]),
      "Intermediate"
    ]
  );

  // 15. certifications
  await runCommand(
    `INSERT OR IGNORE INTO certifications (certification_id, phase_id, skill_name, certification_name, provider)
     VALUES (?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), "phase-1", "Docker Containerization", "Docker Core Architect Certified", "Docker Inc."]
  );

  // 16. resume_analysis
  await runCommand(
    `INSERT OR IGNORE INTO resume_analysis (analysis_id, user_id, ats_score, readability_score, keyword_score, resume_strength, missing_keywords, improvement_suggestions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      "local-admin",
      86.00,
      90.00,
      82.00,
      "Strong",
      JSON.stringify(["MLflow", "Triton Serving", "Prometheus Telemetry"]),
      JSON.stringify([
        "Quantify backend throughput values (e.g. queries per second).",
        "Include vLLM deployment setups in your bio.",
        "Add Git release pipeline validation benchmarks."
      ])
    ]
  );

  // 17. interview_analytics
  await runCommand(
    `INSERT OR IGNORE INTO interview_analytics (analytics_id, user_id, technical_score, communication_score, coding_score, confidence_score, overall_readiness, weak_topics, session_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      "local-admin",
      85.00,
      90.00,
      88.00,
      85.00,
      88,
      JSON.stringify(["Kubernetes Pod Scaling", "Distributed Vector Caching", "Model quantization weights"]),
      1
    ]
  );

  // 18. mock_interviews
  await runCommand(
    `INSERT OR IGNORE INTO mock_interviews (interview_id, user_id, domain, target_goal, submitted_answers, evaluation, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      "mock-interview-1",
      "local-admin",
      "AI Systems Engineer",
      "Lead AI Systems Architect",
      JSON.stringify({ "1": "Sparse models like BM25 look for exact keyword overlap, whereas dense models represent text in high-dimensional vector spaces and compute cosine similarity to capture semantic intent. Custom quantization reduces memory bounds." }),
      JSON.stringify({ "overallReadiness": 88, "technicalAccuracy": 85, "communicationScore": 90, "confidenceScore": 85, "weakTopics": ["Model quantization weights"] }),
      320
    ]
  );

  // 19. coding_assessments
  await runCommand(
    `INSERT OR IGNORE INTO coding_assessments (assessment_id, user_id, problem_title, language, code_submitted, test_results, time_complexity, space_complexity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "coding-run-1",
      "local-admin",
      "Least Recently Used (LRU) Eviction Cache Pool",
      "TypeScript",
      "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n}",
      JSON.stringify({ "passed": true, "total": 3 }),
      "O(1)",
      "O(N)"
    ]
  );

  // 20. market_preferences
  await runCommand(
    `INSERT OR IGNORE INTO market_preferences (preference_id, user_id, preferred_domains, preferred_locations, remote_preference, salary_expectation)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      "local-admin",
      JSON.stringify(["Artificial Intelligence", "Cloud Systems", "Microservices"]),
      JSON.stringify(["Bangalore", "San Francisco", "Remote"]),
      1,
      "₹32L - ₹45L"
    ]
  );

  // 21. mentor_actions
  await runCommand(
    `INSERT OR IGNORE INTO mentor_actions (action_id, user_id, action_type, action_payload, status)
     VALUES (?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), "local-admin", "Generate Roadmap", JSON.stringify({ path: "Lead AI Architect" }), "completed"]
  );
  await runCommand(
    `INSERT OR IGNORE INTO mentor_actions (action_id, user_id, action_type, action_payload, status)
     VALUES (?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), "local-admin", "Analyze Resume", JSON.stringify({ doc: "CV_Architect_Madhavan.pdf" }), "completed"]
  );

  console.log("🌱 Showcase portfolio data for admin seeded successfully!");
}


/**
 * Mock PostgreSQL Pool Wrapper translating inputs to SQLite
 */
class SQLitePoolWrapper {
  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    // 1. Strip schema namespace public.
    let cleanSql = sql.replace(/public\./g, "");

    // 2. Translate $1, $2 placeholders sequentially to ? for SQLite
    cleanSql = cleanSql.replace(/\$\d+/g, "?");

    // 3. Stringify any object parameters for SQLite TEXT fields
    const cleanParams = params.map(val => {
      if (val !== null && typeof val === "object") {
        return JSON.stringify(val);
      }
      return val;
    });

    const rows = await runQuery(cleanSql, cleanParams);
    
    // 4. Parse JSON fields back to standard JS objects for returned rows
    const mapped = rows.map(r => parseJsonFields(r));
    return { rows: mapped };
  }
}

const poolWrapperInstance = new SQLitePoolWrapper();

/**
 * Return compatible query interface
 */
export function getDbPool() {
  return poolWrapperInstance as any;
}

/**
 * Generic Select proxy method
 */
export async function dbSelect(table: string, userId: string) {
  // Strip schemas
  const safeTable = table.replace(/[^a-zA-Z0-9_]/g, "");
  
  const isGlobalTable = ["technologies", "skill_trends", "salary_analytics", "hiring_trends", "interview_questions"].some(
    t => safeTable.includes(t)
  );

  if (isGlobalTable) {
    const q = `SELECT * FROM ${safeTable}`;
    const rows = await runQuery(q);
    return rows.map(r => parseJsonFields(r));
  }

  const colName = safeTable === "user_profiles" ? "id" : "user_id";
  const q = `SELECT * FROM ${safeTable} WHERE ${colName} = ?`;
  const rows = await runQuery(q, [userId]);
  return rows.map(r => parseJsonFields(r));
}

/**
 * Generic Insert proxy method
 */
export async function dbInsert(table: string, payload: any) {
  const safeTable = table.replace(/[^a-zA-Z0-9_]/g, "");

  const keys = Object.keys(payload);
  const values = keys.map(k => {
    const val = payload[k];
    if (val !== null && typeof val === "object") {
      return JSON.stringify(val);
    }
    return val;
  });
  
  const cols = keys.map(k => `"${k}"`).join(", ");
  const placeholders = keys.map(() => "?").join(", ");

  const q = `INSERT INTO ${safeTable} (${cols}) VALUES (${placeholders})`;
  await runCommand(q, values);
  
  // Return the newly created record
  const pkeyCol = safeTable === "user_profiles" ? "id" : (safeTable === "mapping_results" ? "user_id" : "rowid");
  const pkeyValue = payload[pkeyCol] || values[0];
  const selectQ = `SELECT * FROM ${safeTable} WHERE ${pkeyCol} = ?`;
  const rows = await runQuery(selectQ, [pkeyValue]);
  return parseJsonFields(rows[0]);
}

/**
 * Generic Upsert proxy method with dynamic ON CONFLICT mapping for SQLite
 */
export async function dbUpsert(table: string, payload: any) {
  const safeTable = table.replace(/[^a-zA-Z0-9_]/g, "");

  const keys = Object.keys(payload);
  const values = keys.map(k => {
    const val = payload[k];
    if (val !== null && typeof val === "object") {
      return JSON.stringify(val);
    }
    return val;
  });

  // Identify conflict primary column
  let conflictCol = "id";
  if (safeTable === "mapping_results" || safeTable === "interview_analytics") {
    conflictCol = "user_id";
  }

  const cols = keys.map(k => `"${k}"`).join(", ");
  const placeholders = keys.map(() => "?").join(", ");

  const updateSetItems = keys
    .filter(k => k !== conflictCol)
    .map(k => `"${k}" = excluded."${k}"`);

  let q = `INSERT INTO ${safeTable} (${cols}) VALUES (${placeholders})`;
  if (updateSetItems.length > 0) {
    q += ` ON CONFLICT ("${conflictCol}") DO UPDATE SET ${updateSetItems.join(", ")}`;
  } else {
    q += ` ON CONFLICT ("${conflictCol}") DO NOTHING`;
  }
  
  await runCommand(q, values);

  const selectQ = `SELECT * FROM ${safeTable} WHERE "${conflictCol}" = ?`;
  const rows = await runQuery(selectQ, [payload[conflictCol]]);
  return parseJsonFields(rows[0]);
}

/**
 * Generic Delete proxy method
 */
export async function dbDelete(table: string, column: string, value: any) {
  const safeTable = table.replace(/[^a-zA-Z0-9_]/g, "");
  const safeColumn = column.replace(/[^a-zA-Z0-9_]/g, "");

  const q = `DELETE FROM ${safeTable} WHERE "${safeColumn}" = ?`;
  await runCommand(q, [value]);
  return { success: true };
}
