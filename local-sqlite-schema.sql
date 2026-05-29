-- ============================================================================
-- AI POWERED SKILL MAPPER — UNIFIED LOCAL SQLITE SCHEMA
-- PRD-Aligned | All 26 tables | WAL-mode ready
-- ============================================================================

-- ── 1. USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       TEXT PRIMARY KEY,
    full_name     TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    auth_provider TEXT    DEFAULT 'local',   -- 'local' | 'google' | 'github'
    is_active     INTEGER DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. USER_PROFILES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
    id                      TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    degree                  TEXT,
    experience_level        TEXT,             -- 'Fresher' | 'Junior' | 'Mid' | 'Senior'
    career_goal             TEXT,
    known_skills            TEXT DEFAULT '[]',  -- JSON array
    education               TEXT,
    bio                     TEXT,
    preferred_learning_style TEXT,
    github_url              TEXT,
    linkedin_url            TEXT,
    target_industry         TEXT,
    location                TEXT,
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. MAPPING_RESULTS ────────────────────────────────────────────────────────
-- Stores the aggregated AI engine output per user (skills, gaps, roadmap, etc.)
CREATE TABLE IF NOT EXISTS mapping_results (
    user_id         TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    skills          TEXT DEFAULT '[]',  -- JSON
    skill_gaps      TEXT DEFAULT '[]',  -- JSON
    career_paths    TEXT DEFAULT '[]',  -- JSON
    resume_analysis TEXT DEFAULT '{}',  -- JSON
    learning_roadmap TEXT DEFAULT '[]', -- JSON
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. USER_SKILLS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_skills (
    user_skill_id    TEXT PRIMARY KEY,
    user_id          TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    skill_name       TEXT NOT NULL,
    category         TEXT,               -- 'Programming' | 'AI/ML' | 'DevOps' | 'Databases' | 'Frontend'
    proficiency_score REAL DEFAULT 0.0,  -- 0–100
    confidence_score  REAL DEFAULT 0.0,  -- 0–1.0
    source           TEXT,               -- 'Resume' | 'Self-declared' | 'AI Skill Engine'
    last_updated     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 5. CAREER_GOALS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_goals (
    goal_id                TEXT PRIMARY KEY,
    user_id                TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    target_role            TEXT NOT NULL,
    target_salary          TEXT,
    target_company         TEXT,
    target_timeline_months INTEGER DEFAULT 12,
    readiness_score        REAL DEFAULT 0.0,  -- 0–100
    created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. RESUME_ANALYSIS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_analysis (
    analysis_id             TEXT PRIMARY KEY,
    user_id                 TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    ats_score               REAL DEFAULT 0.0,
    readability_score       REAL DEFAULT 0.0,
    keyword_score           REAL DEFAULT 0.0,
    resume_strength         TEXT,              -- 'Weak' | 'Average' | 'Strong' | 'Excellent'
    missing_keywords        TEXT DEFAULT '[]', -- JSON array
    improvement_suggestions TEXT DEFAULT '[]', -- JSON array
    file_path               TEXT,              -- Path to uploaded resume
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 7. CAREER_MATCHES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_matches (
    match_id            TEXT PRIMARY KEY,
    user_id             TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    career_role         TEXT NOT NULL,
    compatibility_score REAL DEFAULT 0.0,  -- 0–100
    salary_range        TEXT,
    market_demand       TEXT,
    notes               TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. LEARNING_PATHS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_paths (
    path_id                    TEXT PRIMARY KEY,
    user_id                    TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    target_role                TEXT NOT NULL,
    current_phase              INTEGER DEFAULT 1,
    completion_percentage      REAL DEFAULT 0.0,
    streak                     INTEGER DEFAULT 0,
    estimated_completion_months INTEGER DEFAULT 6,
    created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                 DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 9. LEARNING_PHASES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_phases (
    phase_id         TEXT PRIMARY KEY,
    path_id          TEXT REFERENCES learning_paths(path_id) ON DELETE CASCADE,
    phase_name       TEXT NOT NULL,
    phase_order      INTEGER NOT NULL,
    phase_description TEXT,
    progress         INTEGER DEFAULT 0,   -- 0–100
    is_completed     INTEGER DEFAULT 0,   -- 0 | 1
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(path_id, phase_order)
);

-- ── 10. LEARNING_TASKS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_tasks (
    task_id        TEXT PRIMARY KEY,
    phase_id       TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    task_title     TEXT NOT NULL,
    task_type      TEXT DEFAULT 'Topic',   -- 'Topic' | 'Lab' | 'Checkpoint'
    resource_url   TEXT,
    difficulty     TEXT DEFAULT 'Medium',  -- 'Beginner' | 'Medium' | 'Hard'
    estimated_time TEXT DEFAULT '1 week',
    status         TEXT DEFAULT 'Pending', -- 'Pending' | 'In Progress' | 'Completed'
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 11. COURSES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    course_id    TEXT PRIMARY KEY,
    phase_id     TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    skill_name   TEXT NOT NULL,
    course_name  TEXT NOT NULL,
    provider     TEXT NOT NULL,
    difficulty   TEXT DEFAULT 'Medium',
    course_url   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 12. PROJECTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    project_id      TEXT PRIMARY KEY,
    phase_id        TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    project_title   TEXT NOT NULL,
    description     TEXT NOT NULL,
    required_skills TEXT DEFAULT '[]',   -- JSON array
    difficulty      TEXT DEFAULT 'Intermediate',
    github_url      TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 13. CERTIFICATIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certifications (
    certification_id   TEXT PRIMARY KEY,
    phase_id           TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    skill_name         TEXT NOT NULL,
    certification_name TEXT NOT NULL,
    provider           TEXT NOT NULL,
    cert_url           TEXT,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 14. MARKET_TRENDS (Technologies) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS technologies (
    technology_id   TEXT PRIMARY KEY,
    technology_name TEXT NOT NULL UNIQUE,
    growth_score    INTEGER DEFAULT 0,  -- Relative demand index
    category        TEXT,               -- 'AI/ML' | 'Backend' | 'DevOps' | 'Frontend'
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 15. SKILL_TRENDS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_trends (
    skill_id      TEXT PRIMARY KEY,
    skill_name    TEXT NOT NULL UNIQUE,
    market_demand INTEGER DEFAULT 0,   -- 0–100
    salary_impact INTEGER DEFAULT 0,   -- Percentage salary premium
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 16. SALARY_ANALYTICS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_analytics (
    role_id      TEXT PRIMARY KEY,
    role_name    TEXT NOT NULL,
    salary_range TEXT NOT NULL,
    region       TEXT DEFAULT 'Global',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 17. HIRING_TRENDS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hiring_trends (
    role_id      TEXT PRIMARY KEY,
    role_name    TEXT NOT NULL UNIQUE,
    job_openings INTEGER DEFAULT 0,
    growth_rate  INTEGER DEFAULT 0,  -- YoY % growth
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 18. INTERVIEW_QUESTIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_questions (
    question_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    domain            TEXT NOT NULL,         -- 'AI Systems Engineer' | 'Full Stack Developer' etc.
    difficulty        TEXT NOT NULL DEFAULT 'Medium',  -- 'Easy' | 'Medium' | 'Hard'
    question_type     TEXT NOT NULL,          -- 'Technical core' | 'Technical gap' | 'Practical coding'
    question_text     TEXT NOT NULL,
    solution_template TEXT,
    rationale         TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 19. MOCK_INTERVIEWS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mock_interviews (
    interview_id      TEXT PRIMARY KEY,
    user_id           TEXT DEFAULT 'anonymous_user',
    domain            TEXT NOT NULL,
    target_goal       TEXT NOT NULL,
    submitted_answers TEXT DEFAULT '{}',   -- JSON
    evaluation        TEXT DEFAULT '{}',   -- JSON
    duration_seconds  INTEGER DEFAULT 0,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 20. CODING_ASSESSMENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_assessments (
    assessment_id    TEXT PRIMARY KEY,
    user_id          TEXT DEFAULT 'anonymous_user',
    problem_title    TEXT NOT NULL,
    language         TEXT NOT NULL,
    code_submitted   TEXT NOT NULL,
    test_results     TEXT DEFAULT '[]',   -- JSON
    time_complexity  TEXT,
    space_complexity TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 21. INTERVIEW_ANALYTICS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_analytics (
    analytics_id       TEXT PRIMARY KEY,
    user_id            TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    technical_score    REAL DEFAULT 0.0,
    communication_score REAL DEFAULT 0.0,
    coding_score       REAL DEFAULT 0.0,
    confidence_score   REAL DEFAULT 0.0,
    overall_readiness  INTEGER DEFAULT 0,  -- 0–100
    weak_topics        TEXT DEFAULT '[]',  -- JSON array
    session_count      INTEGER DEFAULT 1,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 22. MENTOR_CONVERSATIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_conversations (
    conversation_id TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    conversation_title TEXT NOT NULL,
    context_summary TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 23. MENTOR_MESSAGES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_messages (
    message_id           TEXT PRIMARY KEY,
    conversation_id      TEXT REFERENCES mentor_conversations(conversation_id) ON DELETE CASCADE,
    sender_type          TEXT NOT NULL,  -- 'user' | 'assistant' | 'system'
    message_content      TEXT NOT NULL,
    message_embedding_id TEXT,           -- ChromaDB vector ID (optional)
    token_count          INTEGER DEFAULT 0,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 24. MENTOR_MEMORY ────────────────────────────────────────────────────────
-- Long-term persistent AI context per user
CREATE TABLE IF NOT EXISTS mentor_memory (
    memory_id       TEXT PRIMARY KEY,
    user_id         TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    memory_type     TEXT NOT NULL,   -- 'weak_skill' | 'career_goal' | 'preferred_learning' | 'strength'
    memory_key      TEXT NOT NULL,
    memory_value    TEXT NOT NULL,
    importance_score REAL DEFAULT 0.0,  -- 0–10
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 25. MENTOR_RECOMMENDATIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_recommendations (
    recommendation_id   TEXT PRIMARY KEY,
    user_id             TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,     -- 'skill' | 'project' | 'course' | 'certification'
    title               TEXT NOT NULL,
    description         TEXT,
    priority            TEXT DEFAULT 'Medium',  -- 'High' | 'Medium' | 'Low'
    status              TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'completed' | 'dismissed'
    source_module       TEXT,              -- Which module generated this recommendation
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 26. MENTOR_ACTIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_actions (
    action_id      TEXT PRIMARY KEY,
    user_id        TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    action_type    TEXT NOT NULL,      -- 'Generate Roadmap' | 'Analyze Resume' | 'Interview Prep'
    action_payload TEXT DEFAULT '{}', -- JSON
    status         TEXT DEFAULT 'pending',  -- 'pending' | 'running' | 'completed' | 'failed'
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 27. MARKET_PREFERENCES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_preferences (
    preference_id       TEXT PRIMARY KEY,
    user_id             TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_domains   TEXT DEFAULT '[]',    -- JSON array
    preferred_locations TEXT DEFAULT '[]',    -- JSON array
    remote_preference   INTEGER DEFAULT 0,    -- 0 | 1
    salary_expectation  TEXT,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── 28. RECOMMENDATIONS ──────────────────────────────────────────────────────
-- Generic cross-module recommendation store (as per PRD schema)
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id   TEXT PRIMARY KEY,
    user_id             TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,  -- 'skill' | 'course' | 'project' | 'career' | 'interview'
    priority            TEXT DEFAULT 'Medium',
    title               TEXT NOT NULL,
    content             TEXT,
    is_actioned         INTEGER DEFAULT 0,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_goal       ON user_profiles(career_goal);
CREATE INDEX IF NOT EXISTS idx_user_skills_user         ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_name         ON user_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_career_goals_user        ON career_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_career_matches_user      ON career_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_mapping_results_user     ON mapping_results(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user     ON resume_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user      ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_phases_path     ON learning_phases(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_tasks_phase     ON learning_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_learning_tasks_status    ON learning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_courses_phase            ON courses(phase_id);
CREATE INDEX IF NOT EXISTS idx_projects_phase           ON projects(phase_id);
CREATE INDEX IF NOT EXISTS idx_certifications_phase     ON certifications(phase_id);
CREATE INDEX IF NOT EXISTS idx_technologies_trend       ON technologies(growth_score DESC);
CREATE INDEX IF NOT EXISTS idx_skill_trends_demand      ON skill_trends(market_demand DESC);
CREATE INDEX IF NOT EXISTS idx_hiring_trends_openings   ON hiring_trends(job_openings DESC);
CREATE INDEX IF NOT EXISTS idx_interview_questions_dom  ON interview_questions(domain);
CREATE INDEX IF NOT EXISTS idx_interview_questions_diff ON interview_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user     ON mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_assessments_user  ON coding_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_analytics_user ON interview_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_convos_user       ON mentor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_convo    ON mentor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mentor_memory_user       ON mentor_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_memory_type       ON mentor_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_mentor_recs_user         ON mentor_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_recs_priority     ON mentor_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_mentor_actions_user      ON mentor_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_market_prefs_user        ON market_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user     ON recommendations(user_id);
