/**
 * AI Powered Skill Mapper — SQLite Database Reset & Full Seed Script
 * Run with:  node scripts/reset-db.mjs  OR  npm run db:reset
 *
 * Creates 3 demo users:
 *   1. arjun@skillmapper.local   / AIEngineer@123    → AI Engineer
 *   2. priya@skillmapper.local   / BackendDev@123    → Backend Developer
 *   3. rohan@skillmapper.local   / CloudEngineer@123 → Cloud Engineer
 */

import sqlite3 from 'sqlite3';
import fs      from 'fs';
import path    from 'path';
import crypto  from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, '..', 'local.db');
const SQL_PATH  = path.join(__dirname, '..', 'local-sqlite-schema.sql');

// ─────────────────────────────────────────────────────────────────────────────
// DB helpers
// ─────────────────────────────────────────────────────────────────────────────
function openDb(p) {
  return new Promise((res, rej) => {
    const db = new sqlite3.Database(p, e => e ? rej(e) : res(db));
  });
}
function run(db, sql, params = []) {
  return new Promise((res, rej) => {
    db.run(sql, params, function(e) {
      e ? rej(new Error(`SQL Error: ${e.message}\n↳ ${sql.slice(0, 160)}`)) : res(this);
    });
  });
}
function all(db, sql, params = []) {
  return new Promise((res, rej) => {
    db.all(sql, params, (e, rows) => e ? rej(e) : res(rows || []));
  });
}
function uid() { return crypto.randomUUID(); }
function jstr(v) { return JSON.stringify(v); }

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Apply schema
// ─────────────────────────────────────────────────────────────────────────────
async function applySchema(db) {
  console.log('📖  Applying schema from local-sqlite-schema.sql …');
  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  const stripped = sql.split('\n').map(l => l.replace(/--.*$/, '')).join('\n');
  const stmts = stripped.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const s of stmts) await run(db, s);
  console.log(`✅  Schema applied (${stmts.length} statements).`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Global reference / market data
// ─────────────────────────────────────────────────────────────────────────────
async function seedReferenceData(db) {
  console.log('\n🌐  Seeding global reference data …');

  /* technologies */
  const techs = [
    ['Generative AI & LLMs',            182, 'AI/ML'],
    ['Python Programming',               120, 'Programming'],
    ['FastAPI & Async Backends',         140, 'Backend'],
    ['Kubernetes & Container Orch.',      95, 'DevOps'],
    ['Docker Containerization',           80, 'DevOps'],
    ['React & Tailwind CSS',              75, 'Frontend'],
    ['PostgreSQL & pgvector',            110, 'Databases'],
    ['TypeScript',                       115, 'Programming'],
    ['LangChain & RAG Pipelines',         98, 'AI/ML'],
    ['MLOps & CI/CD Pipelines',          130, 'DevOps'],
    ['Terraform & Cloud IaC',             88, 'DevOps'],
    ['Node.js & Express',                 85, 'Backend'],
    ['Redis & Caching',                   78, 'Backend'],
    ['AWS Cloud Services',                92, 'Cloud'],
    ['Azure DevOps',                      82, 'Cloud'],
    ['Prometheus & Grafana',              74, 'DevOps'],
  ];
  for (const [name, score, cat] of techs)
    await run(db, 'INSERT OR IGNORE INTO technologies (technology_id,technology_name,growth_score,category) VALUES (?,?,?,?)', [uid(), name, score, cat]);

  /* skill trends */
  const trends = [
    ['PyTorch',           95, 35], ['TensorFlow',        90, 25],
    ['MLOps Pipelines',   98, 40], ['LangChain RAG',     92, 38],
    ['Kubernetes',        88, 30], ['PostgreSQL pgvector',82, 20],
    ['TypeScript',        85, 15], ['Terraform',         88, 22],
    ['FastAPI',           94, 28], ['Docker Compose',    80, 14],
    ['GitHub Actions',    85, 18], ['Redis',             78, 16],
    ['AWS Lambda',        86, 24], ['Node.js',           83, 18],
    ['Go (Golang)',        76, 20],
  ];
  for (const [name, demand, impact] of trends)
    await run(db, 'INSERT OR IGNORE INTO skill_trends (skill_id,skill_name,market_demand,salary_impact) VALUES (?,?,?,?)', [uid(), name, demand, impact]);

  /* salary analytics */
  const salaries = [
    ['AI/ML Engineer',         '₹14L - ₹30L', 'Bangalore'],
    ['AI/ML Engineer',         '₹12L - ₹26L', 'Hyderabad'],
    ['Senior AI Engineer',     '₹28L - ₹50L', 'Bangalore'],
    ['Backend Developer',      '₹10L - ₹22L', 'Pune'],
    ['Backend Developer',      '₹9L  - ₹20L', 'Chennai'],
    ['Senior Backend Engineer','₹18L - ₹35L', 'Bangalore'],
    ['Cloud Engineer',         '₹12L - ₹24L', 'Global'],
    ['Senior Cloud Architect', '₹22L - ₹42L', 'Bangalore'],
    ['DevOps Engineer',        '₹11L - ₹22L', 'Remote'],
    ['Full Stack Developer',   '₹10L - ₹20L', 'Hyderabad'],
    ['Lead AI Architect',      '₹30L - ₹50L', 'Bangalore'],
  ];
  for (const [role, range, region] of salaries)
    await run(db, 'INSERT OR IGNORE INTO salary_analytics (role_id,role_name,salary_range,region) VALUES (?,?,?,?)', [uid(), role, range, region]);

  /* hiring trends */
  const hiring = [
    ['AI/ML Engineer',       52000, 42],
    ['Backend Developer',    88000, 18],
    ['Cloud Engineer',       41000, 28],
    ['DevOps Engineer',      38000, 24],
    ['Full Stack Developer', 95000, 16],
    ['Data Scientist',       50000, 22],
    ['Lead AI Architect',    12000, 48],
  ];
  for (const [role, opens, rate] of hiring)
    await run(db, 'INSERT OR IGNORE INTO hiring_trends (role_id,role_name,job_openings,growth_rate) VALUES (?,?,?,?)', [uid(), role, opens, rate]);

  /* interview questions bank */
  const questions = [
    // ── AI / ML ──────────────────────────────────────────────────────────────
    ['AI/ML Engineer','Hard','Technical core',
      'Explain the difference between dense retrieval (HNSW, IVF-Flat) and sparse retrieval (BM25) in a production RAG system. How does vector dimensionality affect lookup latency?',
      'function queryVectorDb(text, dim=1536) {\n  // cosine similarity over HNSW index\n}',
      'Tests depth in semantic search architecture and production retrieval trade-offs.'],
    ['AI/ML Engineer','Medium','Technical gap',
      'What is data drift vs concept drift? Describe a concrete workflow to detect accuracy degradation in a live image classification service.',
      'function detectDrift(baseline, current) {\n  // Kolmogorov-Smirnov test\n}',
      'Verifies ML deployment lifecycle knowledge and telemetry awareness.'],
    ['AI/ML Engineer','Hard','System design',
      'Design an inference API serving 10,000 RPS at <50ms p95 latency. Cover model batching, caching, and auto-scaling strategies.',
      'const arch = { batchSize:32, cache:"Redis", autoscaler:"KEDA", serving:"Triton" };',
      'Assesses production AI system design skills end-to-end.'],
    ['AI/ML Engineer','Medium','Practical coding',
      'Implement a token-based sliding window rate limiter in Python. The limiter should allow N requests per minute per user.',
      'import time\nclass RateLimiter:\n    def __init__(self, n, window=60):\n        self.n = n\n        self.window = window\n        self.requests = {}',
      'Tests algorithmic thinking and practical backend integration skills.'],
    ['AI/ML Engineer','Easy','Conceptual',
      'What is the difference between supervised, unsupervised, and reinforcement learning? Give a real-world example for each.',
      '# supervised: spam filter\n# unsupervised: customer segmentation\n# RL: game AI agent',
      'Baseline ML knowledge question for mid-level candidates.'],

    // ── Backend Developer ─────────────────────────────────────────────────────
    ['Backend Developer','Medium','Technical core',
      'How does Node.js handle concurrency using its event loop despite being single-threaded? Explain the call stack, microtask queue, and macrotask queue.',
      'setTimeout(() => console.log("macro"), 0);\nPromise.resolve().then(() => console.log("micro"));\nconsole.log("sync");',
      'Assesses deep understanding of async Node.js runtime mechanics.'],
    ['Backend Developer','Hard','Practical coding',
      'Write a thread-safe LRU cache in JavaScript with O(1) get and put. Use a doubly-linked list + HashMap approach.',
      'class LRUCache {\n  constructor(cap) { this.cap=cap; this.map=new Map(); }\n  get(k) { if(!this.map.has(k)) return -1;\n    const v=this.map.get(k); this.map.delete(k); this.map.set(k,v); return v; }\n  put(k,v) { this.map.delete(k); this.map.set(k,v);\n    if(this.map.size>this.cap) this.map.delete(this.map.keys().next().value); }\n}',
      'Validates algorithm mastery and data structure knowledge under production constraints.'],
    ['Backend Developer','Medium','System design',
      'Design a URL shortener service (like bit.ly) that handles 100M URLs and 1B reads/day. Discuss hashing, caching, and database choices.',
      'const design = { hash:"base62(md5)", cache:"Redis TTL", db:"PostgreSQL+index", cdn:"CloudFront" };',
      'Tests system design fundamentals for high-read workloads.'],
    ['Backend Developer','Hard','Technical core',
      'Explain ACID properties in databases and when you would choose eventual consistency (BASE) over strong consistency. Give a practical example.',
      '// PostgreSQL ACID example with transactions\nBEGIN;\nUPDATE accounts SET balance=balance-100 WHERE id=1;\nUPDATE accounts SET balance=balance+100 WHERE id=2;\nCOMMIT;',
      'Core database fundamentals question for senior backend candidates.'],
    ['Backend Developer','Easy','Conceptual',
      'What is the difference between REST and GraphQL? When would you choose one over the other?',
      '// REST: GET /users/1/posts\n// GraphQL: query { user(id:1) { posts { title } } }',
      'Baseline API design knowledge for junior-to-mid backend roles.'],

    // ── Cloud Engineer ────────────────────────────────────────────────────────
    ['Cloud Engineer','Medium','Technical core',
      'What is the difference between Blue-Green and Canary deployments? How do you configure traffic splitting with Nginx Ingress Controller in Kubernetes?',
      'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  annotations:\n    nginx.ingress.kubernetes.io/canary: "true"\n    nginx.ingress.kubernetes.io/canary-weight: "10"',
      'Tests zero-downtime deployment strategy knowledge and Kubernetes ingress configuration.'],
    ['Cloud Engineer','Hard','Practical design',
      'Design a GitOps pipeline with ArgoCD for a microservices app. Cover secrets management, rollbacks, and environment promotion strategies.',
      'apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: skillmapper-prod\nspec:\n  source:\n    repoURL: https://github.com/org/repo',
      'Evaluates GitOps maturity and production DevOps discipline.'],
    ['Cloud Engineer','Medium','Technical core',
      'Explain the difference between Kubernetes Deployments, StatefulSets, and DaemonSets. When would you use each?',
      '# Deployment: stateless apps (API servers)\n# StatefulSet: databases (PostgreSQL, Kafka)\n# DaemonSet: node agents (log collectors, metrics)',
      'Core Kubernetes workload knowledge expected of cloud engineers.'],
    ['Cloud Engineer','Hard','System design',
      'Design a multi-region, highly available architecture on AWS for a SaaS application with a 99.99% SLA. Cover failover, data replication, and cost optimization.',
      'const arch = { regions:["us-east-1","eu-west-1"], db:"RDS Multi-AZ", lb:"Route53 failover", cache:"ElastiCache" };',
      'Tests cloud architecture breadth for senior cloud engineer candidates.'],
    ['Cloud Engineer','Easy','Conceptual',
      'What is Infrastructure as Code (IaC)? Compare Terraform and AWS CloudFormation.',
      '# Terraform: cloud-agnostic HCL, state management\n# CloudFormation: AWS-native, YAML/JSON, deep integration',
      'Baseline IaC knowledge for entry-level cloud engineering roles.'],
  ];
  for (const [domain, diff, qtype, text, sol, rat] of questions)
    await run(db,
      'INSERT INTO interview_questions (domain,difficulty,question_type,question_text,solution_template,rationale) VALUES (?,?,?,?,?,?)',
      [domain, diff, qtype, text, sol, rat]);

  console.log('✅  Global reference data seeded.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — seed all user-specific tables from a profile config object
// ─────────────────────────────────────────────────────────────────────────────
async function seedUser(db, U) {
  const ID = U.id;
  console.log(`\n👤  Seeding user: ${U.fullName} (${U.email}) …`);

  /* users */
  await run(db,
    'INSERT OR IGNORE INTO users (user_id,full_name,email,password_hash,auth_provider,is_active) VALUES (?,?,?,?,?,?)',
    [ID, U.fullName, U.email, U.passwordHash, 'local', 1]);

  /* user_profiles */
  await run(db,
    `INSERT OR IGNORE INTO user_profiles
       (id,name,degree,experience_level,career_goal,known_skills,education,bio,
        preferred_learning_style,github_url,linkedin_url,target_industry,location)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [ID, U.fullName, U.degree, U.expLevel, U.careerGoal,
     jstr(U.skills.map(s => s.name)),
     U.education, U.bio, U.learnStyle,
     U.github, U.linkedin, U.industry, U.location]);

  /* mapping_results */
  await run(db,
    `INSERT OR IGNORE INTO mapping_results
       (user_id,skills,skill_gaps,career_paths,resume_analysis,learning_roadmap)
     VALUES (?,?,?,?,?,?)`,
    [ID, jstr(U.skills), jstr(U.gaps), jstr(U.careerPaths),
     jstr(U.resumeAnalysis), jstr(U.roadmap)]);

  /* user_skills */
  for (const s of U.skills)
    await run(db,
      'INSERT OR IGNORE INTO user_skills (user_skill_id,user_id,skill_name,category,proficiency_score,confidence_score,source) VALUES (?,?,?,?,?,?,?)',
      [uid(), ID, s.name, s.category, s.proficiency, s.confidence ?? 0.88, 'AI Skill Engine v2']);

  /* career_goals */
  await run(db,
    'INSERT OR IGNORE INTO career_goals (goal_id,user_id,target_role,target_salary,target_company,target_timeline_months,readiness_score) VALUES (?,?,?,?,?,?,?)',
    [uid(), ID, U.careerGoal, U.targetSalary, U.targetCompany, U.timelineMonths, U.readinessScore]);

  /* career_matches */
  for (const c of U.careerPaths)
    await run(db,
      'INSERT OR IGNORE INTO career_matches (match_id,user_id,career_role,compatibility_score,salary_range,market_demand) VALUES (?,?,?,?,?,?)',
      [uid(), ID, c.title, c.matchScore, c.salaryRange, c.marketDemand]);

  /* resume_analysis */
  await run(db,
    `INSERT OR IGNORE INTO resume_analysis
       (analysis_id,user_id,ats_score,readability_score,keyword_score,
        resume_strength,missing_keywords,improvement_suggestions)
     VALUES (?,?,?,?,?,?,?,?)`,
    [uid(), ID,
     U.resumeAnalysis.atsScore, U.resumeAnalysis.readabilityScore, U.resumeAnalysis.keywordScore,
     U.resumeAnalysis.strength, jstr(U.resumeAnalysis.missingKeywords),
     jstr(U.resumeAnalysis.improvements)]);

  /* interview_analytics */
  await run(db,
    `INSERT OR IGNORE INTO interview_analytics
       (analytics_id,user_id,technical_score,communication_score,coding_score,
        confidence_score,overall_readiness,weak_topics,session_count)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [uid(), ID,
     U.interviewAnalytics.technical, U.interviewAnalytics.communication,
     U.interviewAnalytics.coding, U.interviewAnalytics.confidence,
     U.interviewAnalytics.overall, jstr(U.interviewAnalytics.weakTopics), 1]);

  /* market_preferences */
  await run(db,
    'INSERT OR IGNORE INTO market_preferences (preference_id,user_id,preferred_domains,preferred_locations,remote_preference,salary_expectation) VALUES (?,?,?,?,?,?)',
    [uid(), ID, jstr(U.marketPrefs.domains), jstr(U.marketPrefs.locations), U.marketPrefs.remote ? 1 : 0, U.targetSalary]);

  /* learning_paths */
  const pathId = `path-${ID}`;
  await run(db,
    'INSERT OR IGNORE INTO learning_paths (path_id,user_id,target_role,current_phase,completion_percentage,streak,estimated_completion_months) VALUES (?,?,?,?,?,?,?)',
    [pathId, ID, U.careerGoal, U.currentPhase, U.completionPct, U.streak, U.estimatedMonths]);

  /* learning_phases, tasks, courses, projects, certifications */
  for (const phase of U.roadmap) {
    const phId = `phase-${ID}-${phase.phaseNumber}`;
    const isDone = phase.phaseNumber < U.currentPhase ? 1 : 0;
    const prog   = phase.phaseNumber < U.currentPhase ? 100
                 : phase.phaseNumber === U.currentPhase ? U.currentPhaseProgress : 0;

    await run(db,
      'INSERT OR IGNORE INTO learning_phases (phase_id,path_id,phase_name,phase_order,phase_description,progress,is_completed) VALUES (?,?,?,?,?,?,?)',
      [phId, pathId, phase.title, phase.phaseNumber, phase.description ?? null, prog, isDone]);

    for (const t of (phase.topics ?? [])) {
      const taskStatus = isDone ? 'Completed' : 'Pending';
      await run(db,
        'INSERT OR IGNORE INTO learning_tasks (task_id,phase_id,task_title,task_type,difficulty,estimated_time,status) VALUES (?,?,?,?,?,?,?)',
        [uid(), phId, t.name, t.type ?? 'Topic', t.difficulty ?? 'Medium', t.time ?? '1 week', t.status ?? taskStatus]);
    }

    for (const c of (phase.courses ?? []))
      await run(db,
        'INSERT OR IGNORE INTO courses (course_id,phase_id,skill_name,course_name,provider,difficulty) VALUES (?,?,?,?,?,?)',
        [uid(), phId, c.skill, c.name, c.provider, c.difficulty ?? 'Medium']);

    for (const p of (phase.projects ?? []))
      await run(db,
        'INSERT OR IGNORE INTO projects (project_id,phase_id,project_title,description,required_skills,difficulty) VALUES (?,?,?,?,?,?)',
        [uid(), phId, p.title, p.description, jstr(p.skills), p.difficulty ?? 'Intermediate']);

    for (const cert of (phase.certs ?? []))
      await run(db,
        'INSERT OR IGNORE INTO certifications (certification_id,phase_id,skill_name,certification_name,provider) VALUES (?,?,?,?,?)',
        [uid(), phId, cert.skill, cert.name, cert.provider]);
  }

  /* mentor_conversations & messages */
  const convoId = `convo-${ID}-1`;
  await run(db,
    'INSERT OR IGNORE INTO mentor_conversations (conversation_id,user_id,conversation_title,context_summary) VALUES (?,?,?,?)',
    [convoId, ID, U.mentorConvo.title, U.mentorConvo.summary]);

  for (const [sender, content] of U.mentorConvo.messages)
    await run(db,
      'INSERT OR IGNORE INTO mentor_messages (message_id,conversation_id,sender_type,message_content,token_count) VALUES (?,?,?,?,?)',
      [uid(), convoId, sender, content, Math.ceil(content.length / 4)]);

  /* mentor_memory */
  for (const [mtype, key, value, score] of U.mentorMemory)
    await run(db,
      'INSERT OR IGNORE INTO mentor_memory (memory_id,user_id,memory_type,memory_key,memory_value,importance_score) VALUES (?,?,?,?,?,?)',
      [uid(), ID, mtype, key, value, score]);

  /* mentor_recommendations */
  for (const [rtype, title, desc, priority, src] of U.mentorRecs)
    await run(db,
      'INSERT OR IGNORE INTO mentor_recommendations (recommendation_id,user_id,recommendation_type,title,description,priority,status,source_module) VALUES (?,?,?,?,?,?,?,?)',
      [uid(), ID, rtype, title, desc, priority, 'pending', src]);

  /* mentor_actions */
  for (const [atype, payload, status] of U.mentorActions)
    await run(db,
      'INSERT OR IGNORE INTO mentor_actions (action_id,user_id,action_type,action_payload,status) VALUES (?,?,?,?,?)',
      [uid(), ID, atype, jstr(payload), status]);

  /* mock_interviews */
  for (const mi of U.mockInterviews)
    await run(db,
      'INSERT OR IGNORE INTO mock_interviews (interview_id,user_id,domain,target_goal,submitted_answers,evaluation,duration_seconds) VALUES (?,?,?,?,?,?,?)',
      [mi.id, ID, mi.domain, mi.goal, jstr(mi.answers), jstr(mi.evaluation), mi.duration]);

  /* coding_assessments */
  for (const ca of U.codingAssessments)
    await run(db,
      'INSERT OR IGNORE INTO coding_assessments (assessment_id,user_id,problem_title,language,code_submitted,test_results,time_complexity,space_complexity) VALUES (?,?,?,?,?,?,?,?)',
      [ca.id, ID, ca.title, ca.lang, ca.code, jstr(ca.results), ca.timeC, ca.spaceC]);

  console.log(`✅  ${U.fullName} seeded successfully.`);
}

// ═════════════════════════════════════════════════════════════════════════════
// USER 1 — ARJUN SHARMA  →  AI / ML Engineer
// ═════════════════════════════════════════════════════════════════════════════
const USER_AI = {
  id:           'user-ai-001',
  fullName:     'Arjun Sharma',
  email:        'arjun@skillmapper.local',
  passwordHash: 'AIEngineer@123',          // plain text for demo
  degree:       'B.Tech in Computer Science & Engineering',
  expLevel:     'Mid (2-4 Years)',
  careerGoal:   'Senior AI / ML Engineer',
  education:    'B.Tech in CSE — VIT Vellore (2021)',
  bio:          'Passionate ML engineer with 3 years building NLP pipelines, fine-tuning LLMs, and deploying inference services. '
                + 'Currently focused on RAG systems and model serving at scale.',
  learnStyle:   'Paper reading + hands-on Kaggle competitions',
  github:       'https://github.com/arjun-sharma-ai',
  linkedin:     'https://linkedin.com/in/arjun-sharma-ai',
  industry:     'Artificial Intelligence & Machine Learning',
  location:     'Bangalore, KA, India',
  targetSalary: '₹22L - ₹38L',
  targetCompany:'Google DeepMind / Hugging Face / Sarvam AI',
  timelineMonths: 9,
  readinessScore: 74,
  currentPhase:   2,
  currentPhaseProgress: 45,
  completionPct:  35,
  streak:         8,
  estimatedMonths: 9,

  skills: [
    { name:'Python',           category:'Programming', proficiency:92, confidence:0.95 },
    { name:'PyTorch',          category:'AI/ML',       proficiency:85, confidence:0.90 },
    { name:'TensorFlow',       category:'AI/ML',       proficiency:78, confidence:0.82 },
    { name:'HuggingFace',      category:'AI/ML',       proficiency:80, confidence:0.85 },
    { name:'LangChain',        category:'AI/ML',       proficiency:72, confidence:0.78 },
    { name:'FastAPI',          category:'Backend',     proficiency:70, confidence:0.75 },
    { name:'Docker',           category:'DevOps',      proficiency:65, confidence:0.70 },
    { name:'NumPy / Pandas',   category:'AI/ML',       proficiency:90, confidence:0.93 },
    { name:'Scikit-learn',     category:'AI/ML',       proficiency:88, confidence:0.90 },
    { name:'SQL',              category:'Databases',   proficiency:72, confidence:0.78 },
  ],

  gaps: [
    { skillName:'MLOps & Experiment Tracking', priority:'High',   whyNeeded:'Required to productionise models with MLflow, Triton & automated CI pipelines.' },
    { skillName:'Kubernetes for ML Serving',   priority:'High',   whyNeeded:'Needed to deploy model inference pods with HPA and GPU node pools.' },
    { skillName:'Vector Databases (Chroma/FAISS)', priority:'Medium', whyNeeded:'Core to building scalable RAG retrieval systems.' },
    { skillName:'Distributed Training (DDP)',  priority:'Medium', whyNeeded:'Fine-tuning large models efficiently across multiple GPUs.' },
  ],

  careerPaths: [
    { title:'Senior AI / ML Engineer',      matchScore:88, salaryRange:'₹22L - ₹38L', marketDemand:'Very High' },
    { title:'ML Research Scientist',        matchScore:72, salaryRange:'₹25L - ₹45L', marketDemand:'High' },
    { title:'AI Product Engineer',          matchScore:68, salaryRange:'₹18L - ₹32L', marketDemand:'High' },
  ],

  resumeAnalysis: {
    atsScore:78, readabilityScore:84, keywordScore:75, strength:'Good',
    missingKeywords:['MLflow','Triton Inference Server','vLLM','RLHF','LoRA fine-tuning'],
    improvements:[
      'Add measurable impact: "Reduced model inference latency by 40% using ONNX export".',
      'List specific Kaggle competition ranks to demonstrate applied ML skill.',
      'Include GitHub links to open-source contributions.',
    ],
  },

  interviewAnalytics: {
    technical:80, communication:75, coding:82, confidence:72, overall:78,
    weakTopics:['MLOps pipeline design','Kubernetes pod scheduling','Distributed training strategies'],
  },

  marketPrefs: {
    domains:['Artificial Intelligence','NLP','Computer Vision'],
    locations:['Bangalore','Remote','San Francisco'],
    remote:true,
  },

  roadmap: [
    {
      phaseNumber:1, title:'Phase 1: ML Fundamentals & Python Mastery',
      description:'Solidify theoretical ML foundations and advanced Python for ML workflows.',
      topics:[
        { name:'Linear Algebra & Probability for ML', type:'Topic', difficulty:'Medium', time:'2 weeks', status:'Completed' },
        { name:'Advanced Python: generators, decorators, async', type:'Topic', difficulty:'Medium', time:'1 week', status:'Completed' },
        { name:'Scikit-learn: pipelines & custom estimators', type:'Lab', difficulty:'Medium', time:'1 week', status:'Completed' },
        { name:'Phase 1 Checkpoint: Build an end-to-end ML pipeline', type:'Checkpoint', difficulty:'Medium', time:'3 days', status:'Completed' },
      ],
      courses:[
        { skill:'Mathematics for ML', name:'Mathematics for Machine Learning', provider:'Coursera (Imperial College)', difficulty:'Hard' },
        { skill:'Python',             name:'Python for Data Science & ML',     provider:'Udemy',                     difficulty:'Medium' },
      ],
      projects:[
        { title:'Customer Churn Predictor', description:'Train, evaluate and export a churn model using scikit-learn pipelines with cross-validation.', skills:['Python','Scikit-learn','Pandas','Matplotlib'], difficulty:'Intermediate' },
      ],
      certs:[
        { skill:'Data Science', name:'IBM Data Science Professional Certificate', provider:'Coursera / IBM' },
      ],
    },
    {
      phaseNumber:2, title:'Phase 2: Deep Learning & LLM Fine-Tuning',
      description:'Master PyTorch, Transformers, and hands-on LLM fine-tuning with LoRA/PEFT.',
      topics:[
        { name:'PyTorch: autograd, custom datasets, training loops', type:'Lab', difficulty:'Hard', time:'2 weeks', status:'Completed' },
        { name:'Transformers & Attention Mechanisms (paper reading)', type:'Topic', difficulty:'Hard', time:'1 week', status:'In Progress' },
        { name:'Fine-tuning LLMs with LoRA & PEFT (HuggingFace)', type:'Lab', difficulty:'Hard', time:'2 weeks', status:'Pending' },
        { name:'RLHF & DPO: aligning language models', type:'Topic', difficulty:'Hard', time:'1 week', status:'Pending' },
      ],
      courses:[
        { skill:'Deep Learning', name:'Deep Learning Specialization', provider:'Coursera / deeplearning.ai', difficulty:'Hard' },
        { skill:'LLMs',          name:'LLM Bootcamp',                 provider:'Full Stack Deep Learning', difficulty:'Hard' },
      ],
      projects:[
        { title:'Domain-Specific LLM Fine-Tuner', description:'Fine-tune Llama-3 8B on a custom dataset using LoRA + PEFT. Serve via FastAPI.', skills:['PyTorch','HuggingFace','LoRA','FastAPI','Docker'], difficulty:'Advanced' },
      ],
      certs:[ ],
    },
    {
      phaseNumber:3, title:'Phase 3: MLOps, RAG Systems & Production Deployment',
      description:'Learn to productionise models with MLflow, Kubernetes and build RAG pipelines.',
      topics:[
        { name:'MLflow: experiment tracking & model registry', type:'Lab', difficulty:'Medium', time:'1 week', status:'Pending' },
        { name:'RAG pipeline with LangChain + ChromaDB',       type:'Lab', difficulty:'Hard',   time:'2 weeks', status:'Pending' },
        { name:'Kubernetes for ML: GPU node pools & HPA',      type:'Topic', difficulty:'Hard', time:'2 weeks', status:'Pending' },
        { name:'Triton Inference Server & model batching',     type:'Lab', difficulty:'Hard',   time:'1 week', status:'Pending' },
      ],
      courses:[
        { skill:'MLOps',       name:'MLOps Specialization',                       provider:'Coursera / deeplearning.ai',  difficulty:'Hard' },
        { skill:'Kubernetes',  name:'Kubernetes for Machine Learning',             provider:'O\'Reilly',                   difficulty:'Hard' },
      ],
      projects:[
        { title:'Production RAG API', description:'Build a full RAG system: PDF ingestion → ChromaDB → LangChain → FastAPI → Docker → Kubernetes.', skills:['LangChain','ChromaDB','FastAPI','Docker','Kubernetes','Python'], difficulty:'Advanced' },
      ],
      certs:[
        { skill:'MLOps',      name:'Professional ML Engineer Certificate', provider:'Google Cloud' },
        { skill:'Kubernetes', name:'Certified Kubernetes Administrator',   provider:'Linux Foundation' },
      ],
    },
  ],

  mentorConvo: {
    title:'How to break into Senior AI Engineer role faster',
    summary:'Focused on LLM fine-tuning roadmap, MLOps gaps, and building a strong AI portfolio.',
    messages:[
      ['user', 'Hi Coach! I want to become a Senior AI Engineer within 9 months. What should I prioritise?'],
      ['assistant', 'Great goal, Arjun! Given your strong Python & PyTorch base, your fastest path is:\n\n'
        + '1️⃣ LLM Fine-tuning (LoRA/PEFT) — this is the #1 differentiator for AI engineering roles right now.\n'
        + '2️⃣ Build a production RAG system — it shows you can move from notebook to deployed API.\n'
        + '3️⃣ Learn MLflow + Kubernetes basics — recruiters filter hard on MLOps awareness.\n\n'
        + 'What kind of projects have you shipped end-to-end so far?'],
      ['user', 'I have built a churn predictor and a sentiment analysis API, both in Docker containers. No Kubernetes yet.'],
      ['assistant', 'Perfect foundation! Docker experience means Kubernetes is ~2 weeks away for you. '
        + 'I recommend this weekend project: take your sentiment API, add MLflow tracking, and deploy it on a local Kubernetes cluster (use minikube). '
        + 'Document the whole thing on GitHub with a proper README. That single project will answer 80% of interview questions for AI engineer roles.'],
      ['user', 'That sounds very actionable. What about the LLM side?'],
      ['assistant', 'For LLMs, use the HuggingFace PEFT library to fine-tune a small model (Phi-3 mini or Llama-3 8B) on any domain-specific dataset you care about. '
        + 'Push it to HuggingFace Hub. Recruiters LOVE seeing a public fine-tuned model. '
        + 'Pair that with a LangChain RAG demo and you will stand out from 95% of applicants.'],
    ],
  },

  mentorMemory:[
    ['weak_skill',         'MLOps Pipelines',         'MLOps Pipelines',              8.5],
    ['weak_skill',         'Kubernetes ML serving',   'Kubernetes GPU node pools',    8.0],
    ['career_goal',        'Senior AI Engineer',      'Senior AI / ML Engineer',      9.8],
    ['preferred_learning', 'kaggle_papers',           'Kaggle + paper reading style', 9.2],
    ['strength',           'Python & PyTorch',        'Strong Python & PyTorch base', 9.0],
    ['strength',           'NLP & Transformers',      'Solid Transformer knowledge',  8.5],
  ],

  mentorRecs:[
    ['project',       'Production RAG API on Kubernetes',       'Build LangChain RAG + ChromaDB + FastAPI deployed on Minikube.',        'High',   'AI Mentor'],
    ['skill',         'LoRA / PEFT Fine-Tuning',                'Fine-tune Llama-3 8B on custom dataset and push to HuggingFace Hub.',   'High',   'Skill Analyzer'],
    ['skill',         'MLflow Experiment Tracking',             'Instrument your next training run with MLflow and set up model registry.','High',  'Career Coach'],
    ['course',        'MLOps Specialization',                   'Coursera deeplearning.ai — covers pipelines, deployment & monitoring.',  'Medium', 'Learning Path'],
    ['certification', 'Google Professional ML Engineer',        'Validates end-to-end ML engineering on Google Cloud.',                  'Medium', 'Market Intelligence'],
  ],

  mentorActions:[
    ['Generate Roadmap',   { path:'Senior AI Engineer', phases:3 },     'completed'],
    ['Analyze Resume',     { doc:'Arjun_AI_Resume.pdf' },               'completed'],
    ['Identify Skill Gaps',{ skills:['MLOps','Kubernetes','RAG'] },     'completed'],
    ['Interview Prep',     { domain:'AI/ML Engineer' },                 'pending'],
  ],

  mockInterviews:[{
    id:'mock-ai-001', domain:'AI/ML Engineer', goal:'Senior AI / ML Engineer',
    answers:{
      '1':'Dense retrieval uses embedding models to encode queries into vectors and searches using ANN indices like HNSW. BM25 is a sparse bag-of-words model. Hybrid search combines both for best recall. Higher vector dimensions increase recall but hurt latency — HNSW with dim=768 is a sweet spot.',
      '2':'Data drift is a shift in input feature distribution. Concept drift is a change in the P(Y|X) relationship. I would monitor using KL divergence on input features and track model accuracy using a labelled shadow dataset with rolling weekly evaluation.',
    },
    evaluation:{ overallReadiness:78, technicalAccuracy:80, communicationScore:75, confidenceScore:72, weakTopics:['MLOps CI/CD','Distributed training'] },
    duration:385,
  }],

  codingAssessments:[{
    id:'code-ai-001', title:'Sliding Window Rate Limiter',
    lang:'Python',
    code:'from collections import deque\nimport time\n\nclass RateLimiter:\n    def __init__(self, n, window=60):\n        self.n = n\n        self.window = window\n        self.log = {}\n\n    def allow(self, user_id):\n        now = time.time()\n        q = self.log.setdefault(user_id, deque())\n        while q and now - q[0] > self.window:\n            q.popleft()\n        if len(q) < self.n:\n            q.append(now)\n            return True\n        return False',
    results:{ passed:4, total:4, runtime:'42ms', memory:'18MB' },
    timeC:'O(N)', spaceC:'O(N)',
  }],
};

// ═════════════════════════════════════════════════════════════════════════════
// USER 2 — PRIYA MENON  →  Backend Developer
// ═════════════════════════════════════════════════════════════════════════════
const USER_BACKEND = {
  id:           'user-backend-002',
  fullName:     'Priya Menon',
  email:        'priya@skillmapper.local',
  passwordHash: 'BackendDev@123',
  degree:       'B.E. in Information Technology',
  expLevel:     'Junior (0-2 Years)',
  careerGoal:   'Senior Backend Engineer',
  education:    'B.E. in IT — Anna University, Chennai (2023)',
  bio:          'Backend developer with 1.5 years building REST APIs in Node.js and Express. '
                + 'Interested in distributed systems, database performance and building reliable microservices.',
  learnStyle:   'Structured courses + building real projects',
  github:       'https://github.com/priya-menon-dev',
  linkedin:     'https://linkedin.com/in/priya-menon-dev',
  industry:     'Backend Engineering & Distributed Systems',
  location:     'Chennai, TN, India',
  targetSalary: '₹14L - ₹28L',
  targetCompany:'Razorpay / Zepto / Swiggy / Flipkart',
  timelineMonths: 12,
  readinessScore: 62,
  currentPhase:   2,
  currentPhaseProgress: 30,
  completionPct:  28,
  streak:         5,
  estimatedMonths: 12,

  skills: [
    { name:'Node.js',          category:'Backend',     proficiency:80, confidence:0.85 },
    { name:'Express.js',       category:'Backend',     proficiency:78, confidence:0.82 },
    { name:'JavaScript',       category:'Programming', proficiency:85, confidence:0.88 },
    { name:'TypeScript',       category:'Programming', proficiency:68, confidence:0.72 },
    { name:'PostgreSQL',       category:'Databases',   proficiency:70, confidence:0.75 },
    { name:'MongoDB',          category:'Databases',   proficiency:65, confidence:0.70 },
    { name:'REST API Design',  category:'Backend',     proficiency:76, confidence:0.80 },
    { name:'Git & GitHub',     category:'DevOps',      proficiency:80, confidence:0.85 },
    { name:'Docker (basics)',  category:'DevOps',      proficiency:50, confidence:0.55 },
    { name:'Redis (basics)',   category:'Backend',     proficiency:45, confidence:0.50 },
  ],

  gaps: [
    { skillName:'System Design (large scale)', priority:'High',   whyNeeded:'Critical for senior backend roles at product companies.' },
    { skillName:'Kafka & Message Queues',      priority:'High',   whyNeeded:'Required for building event-driven, decoupled microservices.' },
    { skillName:'Advanced PostgreSQL (indexing, query planning)', priority:'Medium', whyNeeded:'Performance tuning is a key differentiator for backend engineers.' },
    { skillName:'Kubernetes & Docker Compose', priority:'Medium', whyNeeded:'Modern backend teams deploy on k8s — basic knowledge is expected.' },
    { skillName:'GraphQL',                     priority:'Low',    whyNeeded:'Many product companies are migrating APIs to GraphQL.' },
  ],

  careerPaths: [
    { title:'Senior Backend Engineer',    matchScore:80, salaryRange:'₹18L - ₹35L', marketDemand:'Very High' },
    { title:'Platform / Infra Engineer',  matchScore:65, salaryRange:'₹16L - ₹30L', marketDemand:'High' },
    { title:'Full Stack Engineer',        matchScore:70, salaryRange:'₹14L - ₹28L', marketDemand:'High' },
  ],

  resumeAnalysis: {
    atsScore:65, readabilityScore:78, keywordScore:62, strength:'Average',
    missingKeywords:['Kafka','gRPC','Redis advanced','Kubernetes','System design','Load testing'],
    improvements:[
      'Quantify API performance: "Reduced API p95 latency from 800ms to 120ms via Redis caching".',
      'Add system design project (e.g., URL shortener clone) to GitHub.',
      'Highlight TypeScript migration experience if applicable.',
    ],
  },

  interviewAnalytics: {
    technical:68, communication:80, coding:72, confidence:65, overall:70,
    weakTopics:['System design basics','SQL query optimisation','Async patterns in Node.js'],
  },

  marketPrefs: {
    domains:['Backend Engineering','FinTech','E-Commerce'],
    locations:['Chennai','Bangalore','Remote'],
    remote:true,
  },

  roadmap: [
    {
      phaseNumber:1, title:'Phase 1: Core Backend & JavaScript Mastery',
      description:'Deepen Node.js async patterns and build production-grade REST APIs.',
      topics:[
        { name:'Node.js event loop & async/await deep dive',    type:'Topic', difficulty:'Medium', time:'1 week', status:'Completed' },
        { name:'Express.js middleware, routing & error handling',type:'Lab',   difficulty:'Medium', time:'1 week', status:'Completed' },
        { name:'TypeScript strict mode & type utilities',        type:'Topic', difficulty:'Medium', time:'1 week', status:'Completed' },
        { name:'REST API design: versioning, pagination, auth',  type:'Lab',   difficulty:'Medium', time:'1 week', status:'Completed' },
      ],
      courses:[
        { skill:'Node.js',     name:'Node.js: The Complete Guide', provider:'Udemy (Maximilian Schwarzmüller)', difficulty:'Medium' },
        { skill:'TypeScript',  name:'Understanding TypeScript',    provider:'Udemy',                            difficulty:'Medium' },
      ],
      projects:[
        { title:'Task Management REST API', description:'Build a full CRUD REST API with JWT auth, rate limiting, and PostgreSQL persistence.', skills:['Node.js','TypeScript','PostgreSQL','JWT','Express.js'], difficulty:'Intermediate' },
      ],
      certs:[ ],
    },
    {
      phaseNumber:2, title:'Phase 2: Databases, Caching & Distributed Patterns',
      description:'Master PostgreSQL performance, Redis caching strategies, and intro to Kafka.',
      topics:[
        { name:'PostgreSQL: indexes, EXPLAIN, query planning',    type:'Lab',   difficulty:'Hard',   time:'2 weeks', status:'In Progress' },
        { name:'Redis: caching patterns, pub/sub, rate limiting', type:'Lab',   difficulty:'Medium', time:'1 week',  status:'Pending' },
        { name:'Kafka fundamentals: topics, consumers, producers', type:'Topic', difficulty:'Hard',  time:'2 weeks', status:'Pending' },
        { name:'Docker Compose: multi-service local dev setup',   type:'Lab',   difficulty:'Medium', time:'3 days',  status:'Pending' },
      ],
      courses:[
        { skill:'PostgreSQL', name:'PostgreSQL: Up and Running',       provider:'O\'Reilly',            difficulty:'Hard' },
        { skill:'Redis',      name:'Redis University: RU101',          provider:'Redis University',     difficulty:'Medium' },
        { skill:'Kafka',      name:'Apache Kafka Series — Beginners',  provider:'Udemy (Stéphane Maarek)', difficulty:'Hard' },
      ],
      projects:[
        { title:'E-Commerce Order Processing Service', description:'Microservice with Kafka order events, Redis cart caching, and PostgreSQL order persistence.', skills:['Node.js','Kafka','Redis','PostgreSQL','Docker'], difficulty:'Advanced' },
      ],
      certs:[ ],
    },
    {
      phaseNumber:3, title:'Phase 3: System Design, Kubernetes & Senior-Level Skills',
      description:'Learn large-scale system design and Kubernetes deployment for senior readiness.',
      topics:[
        { name:'System design: URL shortener, Twitter feed, WhatsApp', type:'Topic', difficulty:'Hard', time:'3 weeks', status:'Pending' },
        { name:'gRPC & Protobuf for microservice communication',        type:'Lab',   difficulty:'Hard', time:'1 week',  status:'Pending' },
        { name:'Kubernetes: deployments, services, ingress, HPA',      type:'Lab',   difficulty:'Hard', time:'2 weeks', status:'Pending' },
        { name:'Load testing with k6 & performance analysis',          type:'Lab',   difficulty:'Medium', time:'1 week', status:'Pending' },
      ],
      courses:[
        { skill:'System Design', name:'Grokking the System Design Interview', provider:'educative.io',      difficulty:'Hard' },
        { skill:'Kubernetes',    name:'Kubernetes for Developers',            provider:'Linux Foundation',  difficulty:'Hard' },
      ],
      projects:[
        { title:'Distributed URL Shortener', description:'Build bit.ly clone: consistent hashing, Redis cache layer, PostgreSQL, Kubernetes deployment with HPA.', skills:['Node.js','Redis','PostgreSQL','Kubernetes','Docker','k6'], difficulty:'Advanced' },
      ],
      certs:[
        { skill:'Kubernetes', name:'Certified Kubernetes Application Developer (CKAD)', provider:'Linux Foundation' },
      ],
    },
  ],

  mentorConvo: {
    title:'Roadmap to Senior Backend Engineer at a product startup',
    summary:'Priya wants to crack senior backend roles at FinTech/E-Commerce startups. Focus on system design and database mastery.',
    messages:[
      ['user', 'Hi! I want to become a Senior Backend Engineer at Razorpay or Zepto. I have 1.5 years of Node.js experience. Where should I focus?'],
      ['assistant', 'Great target, Priya! Razorpay and Zepto both run high-throughput, low-latency systems. '
        + 'For senior roles there, you need three things:\n\n'
        + '1️⃣ System Design — be able to design a payments ledger, order routing engine or a rate limiter.\n'
        + '2️⃣ Database Depth — PostgreSQL query plans, index strategies, and connection pooling.\n'
        + '3️⃣ Kafka basics — event-driven architecture is standard at both companies.\n\n'
        + 'Your Node.js + REST API experience is the right foundation. What databases are you using daily?'],
      ['user', 'I use PostgreSQL and MongoDB. I know basic queries but I have not done query optimisation or indexing deeply.'],
      ['assistant', 'That is the #1 skill gap I see in junior-to-mid backend transitions. '
        + 'Here is a focused exercise: take any slow query in your current project, run EXPLAIN ANALYSE on it, and add an index. '
        + 'Measure the before/after. This single exercise teaches you more than any course. '
        + 'After that, tackle the "design a URL shortener" problem — it naturally forces you to think about caching, hashing and database choice.'],
      ['user', 'What about Kafka? I have never used it.'],
      ['assistant', 'Kafka is the right next step after your DB work. '
        + 'Start with the core concept: producers write to topics, consumer groups read from them. '
        + 'Build a simple project: an order-placed event triggers an inventory-update consumer and an email-notification consumer. '
        + 'This pattern is used verbatim at Zepto, Swiggy and Razorpay. Stéphane Maarek\'s Kafka course on Udemy will get you there in 2 weeks.'],
    ],
  },

  mentorMemory:[
    ['weak_skill',         'System Design',          'Large-scale system design gaps',          8.5],
    ['weak_skill',         'Kafka',                  'No Kafka / event-driven experience yet',  8.0],
    ['weak_skill',         'PostgreSQL Advanced',    'Needs deep indexing & query plan work',   7.8],
    ['career_goal',        'Senior Backend Engineer','Senior Backend at FinTech startup',       9.8],
    ['preferred_learning', 'structured_courses',     'Structured course + project style',       9.0],
    ['strength',           'Node.js & REST APIs',    'Solid Node.js REST API background',       8.5],
  ],

  mentorRecs:[
    ['skill',   'PostgreSQL Query Optimisation',    'Run EXPLAIN ANALYSE on slow queries, add composite indexes, measure impact.',         'High',   'Skill Analyzer'],
    ['project', 'E-Commerce Order Processing Service','Kafka + Redis + PostgreSQL microservice to demonstrate event-driven architecture.',  'High',   'AI Mentor'],
    ['skill',   'Apache Kafka Fundamentals',         'Complete Stéphane Maarek Kafka Beginners course and build a producer/consumer demo.', 'High',   'Career Coach'],
    ['course',  'Grokking System Design Interview',  'educative.io — covers URL shortener, Twitter, chat, and more.',                      'High',   'Learning Path'],
    ['certification','CKAD (Kubernetes Dev)',        'Validates Kubernetes skills valued by product startups.',                            'Medium', 'Market Intelligence'],
  ],

  mentorActions:[
    ['Generate Roadmap',   { path:'Senior Backend Engineer', phases:3 },  'completed'],
    ['Analyze Resume',     { doc:'Priya_Backend_Resume.pdf' },             'completed'],
    ['Identify Skill Gaps',{ skills:['Kafka','System Design','Postgres'] },'completed'],
    ['Interview Prep',     { domain:'Backend Developer' },                 'pending'],
  ],

  mockInterviews:[{
    id:'mock-backend-001', domain:'Backend Developer', goal:'Senior Backend Engineer',
    answers:{
      '1':'Node.js uses a single-threaded event loop. Sync operations block the loop; async I/O is delegated to libuv thread pool. Microtasks (Promise.then, queueMicrotask) run before the next event loop tick, before macrotasks (setTimeout, setInterval). This is why a resolved Promise logs before a zero-delay setTimeout.',
      '2':'REST uses fixed endpoints and returns full resources. GraphQL uses a single endpoint where the client specifies exactly which fields to return, avoiding over-fetching. I would choose REST for simple CRUD services and GraphQL for complex, nested data graphs like social feeds.',
    },
    evaluation:{ overallReadiness:70, technicalAccuracy:68, communicationScore:80, confidenceScore:65, weakTopics:['System design','SQL optimisation','Async deep dive'] },
    duration:290,
  }],

  codingAssessments:[{
    id:'code-backend-001', title:'LRU Cache O(1)',
    lang:'JavaScript',
    code:'class LRUCache {\n  constructor(cap) {\n    this.cap = cap;\n    this.map = new Map();\n  }\n  get(k) {\n    if (!this.map.has(k)) return -1;\n    const v = this.map.get(k);\n    this.map.delete(k);\n    this.map.set(k, v);\n    return v;\n  }\n  put(k, v) {\n    this.map.delete(k);\n    this.map.set(k, v);\n    if (this.map.size > this.cap)\n      this.map.delete(this.map.keys().next().value);\n  }\n}',
    results:{ passed:3, total:3, runtime:'55ms', memory:'44MB' },
    timeC:'O(1)', spaceC:'O(N)',
  }],
};

// ═════════════════════════════════════════════════════════════════════════════
// USER 3 — ROHAN VERMA  →  Cloud / DevOps Engineer
// ═════════════════════════════════════════════════════════════════════════════
const USER_CLOUD = {
  id:           'user-cloud-003',
  fullName:     'Rohan Verma',
  email:        'rohan@skillmapper.local',
  passwordHash: 'CloudEngineer@123',
  degree:       'B.Tech in Electronics & Communication Engineering',
  expLevel:     'Senior (4-6 Years)',
  careerGoal:   'Lead Cloud / DevOps Architect',
  education:    'B.Tech in ECE — NIT Trichy (2019)',
  bio:          'Cloud & DevOps engineer with 5 years managing AWS infrastructure, Kubernetes clusters, '
                + 'and building CI/CD pipelines. Aiming to move from hands-on DevOps into a Cloud Architect leadership role.',
  learnStyle:   'Certification-driven learning + on-the-job experimentation',
  github:       'https://github.com/rohan-verma-cloud',
  linkedin:     'https://linkedin.com/in/rohan-verma-cloud',
  industry:     'Cloud Infrastructure & DevOps',
  location:     'Delhi NCR, India',
  targetSalary: '₹28L - ₹48L',
  targetCompany:'AWS / Google Cloud / Thoughtworks / Infosys Cloud',
  timelineMonths: 8,
  readinessScore: 82,
  currentPhase:   3,
  currentPhaseProgress: 60,
  completionPct:  68,
  streak:         22,
  estimatedMonths: 8,

  skills: [
    { name:'AWS (EC2/S3/RDS/Lambda)',  category:'Cloud',      proficiency:88, confidence:0.92 },
    { name:'Kubernetes',               category:'DevOps',     proficiency:85, confidence:0.90 },
    { name:'Docker',                   category:'DevOps',     proficiency:90, confidence:0.93 },
    { name:'Terraform',                category:'DevOps',     proficiency:82, confidence:0.85 },
    { name:'GitHub Actions (CI/CD)',   category:'DevOps',     proficiency:80, confidence:0.84 },
    { name:'Prometheus & Grafana',     category:'DevOps',     proficiency:75, confidence:0.78 },
    { name:'Linux & Bash Scripting',   category:'DevOps',     proficiency:88, confidence:0.90 },
    { name:'Python (scripting)',       category:'Programming', proficiency:72, confidence:0.75 },
    { name:'Helm Charts',              category:'DevOps',     proficiency:70, confidence:0.74 },
    { name:'Nginx & Load Balancing',   category:'Backend',    proficiency:76, confidence:0.80 },
  ],

  gaps: [
    { skillName:'Multi-Region Cloud Architecture', priority:'High',   whyNeeded:'Required for Cloud Architect role — designing globally distributed, HA systems.' },
    { skillName:'ArgoCD & GitOps',                 priority:'High',   whyNeeded:'GitOps is the standard for enterprise Kubernetes fleet management.' },
    { skillName:'FinOps & Cloud Cost Optimisation',priority:'Medium', whyNeeded:'Architects are expected to own cloud spend and optimise for cost-efficiency.' },
    { skillName:'Service Mesh (Istio)',             priority:'Medium', whyNeeded:'Needed for zero-trust networking between microservices in large k8s clusters.' },
    { skillName:'Azure / GCP (multi-cloud)',        priority:'Medium', whyNeeded:'Senior architect roles often require multi-cloud strategy knowledge.' },
  ],

  careerPaths: [
    { title:'Lead Cloud / DevOps Architect',    matchScore:88, salaryRange:'₹28L - ₹48L', marketDemand:'Very High' },
    { title:'Principal Site Reliability Engineer', matchScore:80, salaryRange:'₹30L - ₹50L', marketDemand:'High' },
    { title:'Cloud Infrastructure Manager',     matchScore:75, salaryRange:'₹25L - ₹42L', marketDemand:'High' },
  ],

  resumeAnalysis: {
    atsScore:84, readabilityScore:88, keywordScore:82, strength:'Strong',
    missingKeywords:['ArgoCD','Istio','FinOps','Multi-region design','Service mesh','Chaos engineering'],
    improvements:[
      'Quantify infrastructure impact: "Reduced AWS monthly bill by ₹12L via Reserved Instances + Spot strategy".',
      'Add multi-cloud experience (even personal GCP/Azure projects count).',
      'Mention Chaos Engineering experiments (Gremlin / Chaos Monkey) for SRE credibility.',
    ],
  },

  interviewAnalytics: {
    technical:85, communication:82, coding:78, confidence:84, overall:84,
    weakTopics:['Multi-region failover design','Service mesh configuration','FinOps strategies'],
  },

  marketPrefs: {
    domains:['Cloud Infrastructure','DevOps','SRE'],
    locations:['Delhi NCR','Bangalore','Remote'],
    remote:true,
  },

  roadmap: [
    {
      phaseNumber:1, title:'Phase 1: Kubernetes Advanced & Helm Mastery',
      description:'Move from basic k8s to advanced cluster management, Helm, and RBAC.',
      topics:[
        { name:'Kubernetes RBAC, NetworkPolicy & PodSecurityPolicy', type:'Topic', difficulty:'Hard',   time:'2 weeks', status:'Completed' },
        { name:'Helm: chart authoring, templating & lifecycle hooks',type:'Lab',   difficulty:'Medium', time:'1 week',  status:'Completed' },
        { name:'Kubernetes HPA, VPA & Cluster Autoscaler',           type:'Lab',   difficulty:'Hard',   time:'1 week',  status:'Completed' },
        { name:'Phase 1 Checkpoint: Deploy a production-grade k8s cluster', type:'Checkpoint', difficulty:'Hard', time:'3 days', status:'Completed' },
      ],
      courses:[
        { skill:'Kubernetes', name:'Certified Kubernetes Administrator (CKA)',        provider:'Linux Foundation',     difficulty:'Hard' },
        { skill:'Helm',       name:'Helm Deep Dive',                                  provider:'Cloud Native Computing Foundation', difficulty:'Medium' },
      ],
      projects:[
        { title:'Production-Grade K8s Cluster', description:'Deploy a 3-node k8s cluster with RBAC, network policies, Helm releases and Prometheus monitoring.', skills:['Kubernetes','Helm','Prometheus','Terraform','Linux'], difficulty:'Advanced' },
      ],
      certs:[
        { skill:'Kubernetes', name:'Certified Kubernetes Administrator (CKA)', provider:'Linux Foundation' },
      ],
    },
    {
      phaseNumber:2, title:'Phase 2: GitOps, ArgoCD & Service Mesh',
      description:'Implement GitOps workflows with ArgoCD and introduce Istio service mesh.',
      topics:[
        { name:'GitOps principles & ArgoCD application sets', type:'Lab',   difficulty:'Hard',   time:'2 weeks', status:'Completed' },
        { name:'Istio service mesh: traffic management & mTLS', type:'Lab', difficulty:'Hard',   time:'2 weeks', status:'Completed' },
        { name:'Secrets management: Vault + External Secrets Operator', type:'Lab', difficulty:'Hard', time:'1 week', status:'Completed' },
        { name:'Chaos Engineering with Chaos Monkey / Litmus',  type:'Lab', difficulty:'Medium', time:'1 week',  status:'Completed' },
      ],
      courses:[
        { skill:'GitOps',  name:'GitOps with ArgoCD',        provider:'Codefresh',    difficulty:'Hard' },
        { skill:'Istio',   name:'Istio Service Mesh Deep Dive', provider:'O\'Reilly',  difficulty:'Hard' },
        { skill:'Vault',   name:'HashiCorp Vault Operations', provider:'HashiCorp',   difficulty:'Medium' },
      ],
      projects:[
        { title:'GitOps Multi-Env Pipeline', description:'ArgoCD-managed GitOps pipeline: dev → staging → prod with automated canary releases and Vault secret injection.', skills:['ArgoCD','Kubernetes','Helm','Vault','Istio','GitHub Actions'], difficulty:'Advanced' },
      ],
      certs:[
        { skill:'GitOps', name:'GitOps Fundamentals Certificate', provider:'Codefresh / Argo Project' },
      ],
    },
    {
      phaseNumber:3, title:'Phase 3: Multi-Region Architecture & FinOps',
      description:'Design globally distributed cloud systems and master cloud cost optimisation.',
      topics:[
        { name:'Multi-region AWS: Route53 failover, RDS Multi-AZ, S3 replication', type:'Topic', difficulty:'Hard', time:'2 weeks', status:'In Progress' },
        { name:'FinOps: Reserved Instances, Spot Fleets, cost dashboards',          type:'Lab',   difficulty:'Medium', time:'1 week', status:'In Progress' },
        { name:'AWS Well-Architected Framework review',                             type:'Topic', difficulty:'Medium', time:'1 week', status:'Pending' },
        { name:'GCP Fundamentals: GKE, Cloud Run, BigQuery',                       type:'Topic', difficulty:'Medium', time:'2 weeks', status:'Pending' },
      ],
      courses:[
        { skill:'AWS Architecture', name:'AWS Solutions Architect Professional',  provider:'AWS / A Cloud Guru',   difficulty:'Hard' },
        { skill:'FinOps',           name:'FinOps Certified Practitioner',         provider:'FinOps Foundation',    difficulty:'Medium' },
        { skill:'GCP',              name:'Google Cloud Professional Cloud Architect', provider:'Google Cloud',     difficulty:'Hard' },
      ],
      projects:[
        { title:'Multi-Region SaaS Infrastructure', description:'Deploy a SaaS app across us-east-1 + eu-west-1 with Route53 failover, RDS Multi-AZ, and automated DR runbooks.', skills:['AWS','Terraform','Route53','RDS','GitHub Actions','Prometheus'], difficulty:'Advanced' },
      ],
      certs:[
        { skill:'AWS',    name:'AWS Certified Solutions Architect — Professional', provider:'Amazon Web Services' },
        { skill:'FinOps', name:'FinOps Certified Practitioner',                   provider:'FinOps Foundation' },
        { skill:'GCP',    name:'Google Cloud Professional Cloud Architect',       provider:'Google Cloud' },
      ],
    },
  ],

  mentorConvo: {
    title:'Transitioning from Senior DevOps to Cloud Architect',
    summary:'Rohan targets Cloud Architect leadership. Focus areas: multi-region design, FinOps, and Architect-level communication.',
    messages:[
      ['user', 'Hi Coach! I am a Senior DevOps Engineer with 5 years of AWS + K8s experience. How do I move into a Cloud Architect role?'],
      ['assistant', 'Excellent positioning, Rohan! With your AWS + Kubernetes depth you are closer than most. '
        + 'The architect role shift requires two things beyond technical skills:\n\n'
        + '1️⃣ Multi-region, multi-account design — can you design a 99.99% SLA system across two AWS regions?\n'
        + '2️⃣ Business language — architects must translate cloud decisions into cost and risk terms for leadership.\n\n'
        + 'Technically, your gaps are ArgoCD/GitOps (for fleet management at scale) and FinOps. What certifications do you currently hold?'],
      ['user', 'I have AWS Solutions Architect Associate and CKA. I am preparing for SAP (Professional) now.'],
      ['assistant', 'SAP is the right next cert — it is the gold standard signal for architect-level AWS roles. '
        + 'Pair it with FinOps Certified Practitioner (FCP) and you will have a very strong certification portfolio. '
        + 'For the portfolio project, I strongly recommend building a multi-region deployment on AWS: '
        + 'Route53 health checks → active-active ALBs → RDS Multi-AZ with read replicas → S3 CRR. '
        + 'Document your design decisions and trade-offs — that writeup IS your architect portfolio.'],
      ['user', 'What about the non-technical side? How do I show leadership readiness?'],
      ['assistant', 'Great question. Start documenting your infrastructure decisions as Architecture Decision Records (ADRs). '
        + 'Write one for every major infrastructure choice (why Postgres over MySQL, why Istio over Linkerd). '
        + 'Share them with your team. This builds your reputation as a technical leader before you have the title. '
        + 'Also volunteer to lead the next AWS cost review — nothing signals Architect readiness faster than FinOps ownership.'],
    ],
  },

  mentorMemory:[
    ['weak_skill',         'Multi-Region Architecture',  'No hands-on multi-region AWS design yet',        8.0],
    ['weak_skill',         'FinOps',                     'Cloud cost optimisation knowledge gap',           7.5],
    ['career_goal',        'Cloud Architect',            'Lead Cloud / DevOps Architect transition',        9.8],
    ['preferred_learning', 'certification_driven',       'Certification-driven with hands-on labs',         9.2],
    ['strength',           'AWS + Kubernetes',           'Deep AWS and Kubernetes production experience',   9.5],
    ['strength',           'Terraform IaC',              'Strong Terraform infrastructure-as-code skills',  9.0],
  ],

  mentorRecs:[
    ['certification','AWS Solutions Architect Professional', 'Complete SAP-C02 — gold standard for cloud architect roles at AWS/GCP.',                'High',   'Market Intelligence'],
    ['certification','FinOps Certified Practitioner',        'FCP demonstrates cloud cost strategy — critical for architect-level credibility.',       'High',   'Career Coach'],
    ['project',      'Multi-Region SaaS on AWS',            'Deploy active-active multi-region setup with Route53 failover, RDS Multi-AZ, and CRR.',  'High',   'AI Mentor'],
    ['skill',        'ArgoCD GitOps Fleet Management',       'Implement ArgoCD ApplicationSets for managing dev/staging/prod across multiple clusters.','Medium', 'Skill Analyzer'],
    ['skill',        'Architecture Decision Records (ADRs)', 'Document infrastructure decisions as ADRs to demonstrate technical leadership.',         'Medium', 'Career Coach'],
  ],

  mentorActions:[
    ['Generate Roadmap',   { path:'Lead Cloud Architect', phases:3 },   'completed'],
    ['Analyze Resume',     { doc:'Rohan_Cloud_Resume.pdf' },             'completed'],
    ['Identify Skill Gaps',{ skills:['Multi-region','FinOps','ArgoCD']},'completed'],
    ['Interview Prep',     { domain:'Cloud Engineer' },                  'pending'],
  ],

  mockInterviews:[{
    id:'mock-cloud-001', domain:'Cloud Engineer', goal:'Lead Cloud / DevOps Architect',
    answers:{
      '1':'Blue-Green: two identical environments; traffic switches 0/100 between them. Zero risk of partial rollout. Canary: incremental traffic shift (e.g. 5% → 25% → 100%) using Nginx Ingress canary annotations. Canary reduces blast radius but requires good observability to catch issues early.',
      '2':'GitOps with ArgoCD: all cluster state lives in Git. ArgoCD continuously syncs desired state (Git) to actual state (cluster). For secrets I use External Secrets Operator + AWS Secrets Manager. Rollbacks are a git revert — ArgoCD detects the change and re-syncs automatically. Env promotion uses ApplicationSets with cluster generators.',
    },
    evaluation:{ overallReadiness:84, technicalAccuracy:85, communicationScore:82, confidenceScore:84, weakTopics:['Multi-region failover design','FinOps quantification'] },
    duration:410,
  }],

  codingAssessments:[{
    id:'code-cloud-001', title:'Kubernetes Health Check Bash Script',
    lang:'Bash',
    code:'#!/bin/bash\n# Check all deployments in a namespace are healthy\nNAMESPACE=${1:-default}\necho "Checking deployments in namespace: $NAMESPACE"\nkubectl get deployments -n "$NAMESPACE" -o json | \\\n  jq -r \'.items[] | "\\(.metadata.name): desired=\\(.spec.replicas) ready=\\(.status.readyReplicas // 0)"\' | \\\n  while read line; do\n    name=$(echo "$line" | cut -d: -f1)\n    desired=$(echo "$line" | grep -oP "desired=\\K[0-9]+")\n    ready=$(echo "$line" | grep -oP "ready=\\K[0-9]+")\n    if [ "$desired" != "$ready" ]; then\n      echo "⚠️  UNHEALTHY: $line"\n    else\n      echo "✅  OK: $line"\n    fi\n  done',
    results:{ passed:3, total:3, runtime:'N/A', memory:'N/A' },
    timeC:'O(N)', spaceC:'O(1)',
  }],
};

// ─────────────────────────────────────────────────────────────────────────────
// Main — run everything
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║   AI Powered Skill Mapper — DB Reset & 3-User Full Seed         ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  if (fs.existsSync(DB_PATH)) { fs.unlinkSync(DB_PATH); console.log('🗑️   Removed old local.db\n'); }

  const db = await openDb(DB_PATH);
  console.log(`📂  Database: ${DB_PATH}\n`);

  await run(db, 'PRAGMA journal_mode = WAL');
  await run(db, 'PRAGMA foreign_keys = ON');
  await run(db, 'PRAGMA synchronous = NORMAL');

  await applySchema(db);
  await seedReferenceData(db);

  await seedUser(db, USER_AI);
  await seedUser(db, USER_BACKEND);
  await seedUser(db, USER_CLOUD);

  /* ── final row count verification ── */
  const tables = await all(db, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const counts = await Promise.all(
    tables
      .filter(t => !t.name.startsWith('sqlite_'))
      .map(async t => {
        const [r] = await all(db, `SELECT COUNT(*) as c FROM "${t.name}"`);
        return `  ${t.name.padEnd(30)} ${String(r.c).padStart(4)} rows`;
      })
  );

  console.log('\n📊  Final database row counts:');
  console.log(counts.join('\n'));

  db.close();

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                   ✅  DATABASE READY                             ║
╠══════════════════════════════════════════════════════════════════╣
║  USER 1 — AI / ML Engineer                                       ║
║    Name  : Arjun Sharma                                          ║
║    Email : arjun@skillmapper.local                               ║
║    Pass  : AIEngineer@123                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  USER 2 — Backend Developer                                      ║
║    Name  : Priya Menon                                           ║
║    Email : priya@skillmapper.local                               ║
║    Pass  : BackendDev@123                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  USER 3 — Cloud / DevOps Engineer                                ║
║    Name  : Rohan Verma                                           ║
║    Email : rohan@skillmapper.local                               ║
║    Pass  : CloudEngineer@123                                     ║
╚══════════════════════════════════════════════════════════════════╝
`);
}

main().catch(err => { console.error('\n❌ Fatal:', err.message); process.exit(1); });
