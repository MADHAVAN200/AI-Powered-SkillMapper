-- ============================================================================
-- AI POWERED SKILL MAPPER - UNIFIED LOCAL PORTABLE SQLITE SCHEMA
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    auth_provider TEXT DEFAULT 'local',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- 2. USER PROFILES TABLE (Unified with existing schema for backward compatibility)
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree TEXT,
    experience_level TEXT,
    career_goal TEXT,
    known_skills TEXT DEFAULT '[]', -- JSON string list
    education TEXT,
    bio TEXT,
    preferred_learning_style TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    target_industry TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. MAPPING RESULTS TABLE (Main mapping engine output)
CREATE TABLE IF NOT EXISTS mapping_results (
    user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    skills TEXT DEFAULT '[]', -- JSON string
    skill_gaps TEXT DEFAULT '[]', -- JSON string
    career_paths TEXT DEFAULT '[]', -- JSON string
    resume_analysis TEXT DEFAULT '{}', -- JSON string
    learning_roadmap TEXT DEFAULT '[]', -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER SKILLS TABLE (Extracted discrete capability values)
CREATE TABLE IF NOT EXISTS user_skills (
    user_skill_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT,
    proficiency_score REAL DEFAULT 0.00,
    confidence_score REAL DEFAULT 0.00,
    source TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. CAREER GOALS TABLE
CREATE TABLE IF NOT EXISTS career_goals (
    goal_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    target_salary TEXT,
    target_company TEXT,
    target_timeline_months INTEGER DEFAULT 12,
    readiness_score REAL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. MENTOR CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS mentor_conversations (
    conversation_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    conversation_title TEXT NOT NULL,
    context_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. MENTOR MESSAGES TABLE
CREATE TABLE IF NOT EXISTS mentor_messages (
    message_id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES mentor_conversations(conversation_id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'user', 'assistant', 'system'
    message_content TEXT NOT NULL,
    message_embedding_id TEXT,
    token_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. MENTOR MEMORY TABLE (Long-term persistent AI Context)
CREATE TABLE IF NOT EXISTS mentor_memory (
    memory_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL, -- 'weak_skill', 'career_preference', etc.
    memory_key TEXT NOT NULL,
    memory_value TEXT NOT NULL,
    importance_score REAL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. MENTOR RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS mentor_recommendations (
    recommendation_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'skill', 'project', 'course', 'certification'
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'completed'
    source_module TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. LEARNING PATHS TABLE (Roadmap dashboard structure)
CREATE TABLE IF NOT EXISTS learning_paths (
    path_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    current_phase INTEGER DEFAULT 1,
    completion_percentage REAL DEFAULT 0.00,
    streak INTEGER DEFAULT 0,
    estimated_completion_months INTEGER DEFAULT 6,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. LEARNING PHASES TABLE (Roadmap phases)
CREATE TABLE IF NOT EXISTS learning_phases (
    phase_id TEXT PRIMARY KEY,
    path_id TEXT REFERENCES learning_paths(path_id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    phase_order INTEGER NOT NULL,
    phase_description TEXT,
    progress INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0, -- 0 = false, 1 = true
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(path_id, phase_order)
);

-- 12. LEARNING TASKS TABLE (Roadmap step checklists)
CREATE TABLE IF NOT EXISTS learning_tasks (
    task_id TEXT PRIMARY KEY,
    phase_id TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    task_type TEXT DEFAULT 'Topic', -- 'Topic', 'Lab', 'Checkpoint'
    resource_url TEXT,
    difficulty TEXT DEFAULT 'Medium', -- 'Beginner', 'Medium', 'Hard'
    estimated_time TEXT DEFAULT '1 week',
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. RESUME ANALYSIS TABLE (ATS Optimizer intelligence data)
CREATE TABLE IF NOT EXISTS resume_analysis (
    analysis_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    ats_score REAL DEFAULT 0.00,
    readability_score REAL DEFAULT 0.00,
    keyword_score REAL DEFAULT 0.00,
    resume_strength TEXT,
    missing_keywords TEXT DEFAULT '[]', -- JSON string
    improvement_suggestions TEXT DEFAULT '[]', -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. INTERVIEW ANALYTICS TABLE (Unified Aggregate mock prep scoring)
CREATE TABLE IF NOT EXISTS interview_analytics (
    analytics_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    technical_score REAL DEFAULT 0.00,
    communication_score REAL DEFAULT 0.00,
    coding_score REAL DEFAULT 0.00,
    confidence_score REAL DEFAULT 0.00,
    overall_readiness INTEGER DEFAULT 0,
    weak_topics TEXT DEFAULT '[]', -- JSON string array
    session_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. MARKET PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS market_preferences (
    preference_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_domains TEXT DEFAULT '[]', -- JSON string
    preferred_locations TEXT DEFAULT '[]', -- JSON string
    remote_preference INTEGER DEFAULT 0,
    salary_expectation TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. MENTOR ACTIONS TABLE
CREATE TABLE IF NOT EXISTS mentor_actions (
    action_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'Generate Roadmap', 'Analyze Resume', etc.
    action_payload TEXT DEFAULT '{}', -- JSON string
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. TECHNOLOGIES TABLE (Market Intelligence Trends)
CREATE TABLE IF NOT EXISTS technologies (
    technology_id TEXT PRIMARY KEY,
    technology_name TEXT NOT NULL UNIQUE,
    growth_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. SKILL TRENDS TABLE (Market Demand Profiles)
CREATE TABLE IF NOT EXISTS skill_trends (
    skill_id TEXT PRIMARY KEY,
    skill_name TEXT NOT NULL UNIQUE,
    market_demand INTEGER DEFAULT 0,
    salary_impact INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. SALARY ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS salary_analytics (
    role_id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL,
    salary_range TEXT NOT NULL,
    region TEXT DEFAULT 'Global',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 20. HIRING TRENDS TABLE
CREATE TABLE IF NOT EXISTS hiring_trends (
    role_id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    job_openings INTEGER DEFAULT 0,
    growth_rate INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    course_id TEXT PRIMARY KEY,
    phase_id TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    phase_id TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT DEFAULT '[]', -- JSON string array
    difficulty TEXT DEFAULT 'Intermediate',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS certifications (
    certification_id TEXT PRIMARY KEY,
    phase_id TEXT REFERENCES learning_phases(phase_id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    certification_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 24. INTERVIEW QUESTIONS TABLE (Mock Prep Bank)
CREATE TABLE IF NOT EXISTS interview_questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Medium',
    question_type TEXT NOT NULL, -- 'Technical core', 'Technical gap', etc.
    question_text TEXT NOT NULL,
    solution_template TEXT,
    rationale TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 25. MOCK INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS mock_interviews (
    interview_id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous_user',
    domain TEXT NOT NULL,
    target_goal TEXT NOT NULL,
    submitted_answers TEXT DEFAULT '{}', -- JSON string
    evaluation TEXT DEFAULT '{}', -- JSON string
    duration_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 26. CODING ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS coding_assessments (
    assessment_id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous_user',
    problem_title TEXT NOT NULL,
    language TEXT NOT NULL,
    code_submitted TEXT NOT NULL,
    test_results TEXT DEFAULT '[]', -- JSON string
    time_complexity TEXT,
    space_complexity TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CREATE ROBUST DATABASE INDEXES FOR ACCELERATED DATA ACCESS
CREATE INDEX IF NOT EXISTS idx_user_profiles_goal ON user_profiles(career_goal);
CREATE INDEX IF NOT EXISTS idx_mapping_results_user ON mapping_results(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_convo ON mentor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mentor_memory_user ON mentor_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_phases_path ON learning_phases(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_tasks_phase ON learning_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_technologies_trend ON technologies(technology_name);
CREATE INDEX IF NOT EXISTS idx_skill_trends_demand ON skill_trends(skill_name);
CREATE INDEX IF NOT EXISTS idx_interview_questions_domain ON interview_questions(domain);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user ON mock_interviews(user_id);
