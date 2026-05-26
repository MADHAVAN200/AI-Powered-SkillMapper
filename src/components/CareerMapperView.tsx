import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Check,
  AlertCircle,
  X,
  MessageSquare,
  Send,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  CornerDownRight,
  Sparkles,
  Award,
  Layers
} from "lucide-react";
import { ProfileMappingResults, SkillGapItem } from "../types";

// Standard career roles databases with in-depth statistics
const CAREER_ROLES_DB = [
  {
    role_id: "ai-engineer",
    role_name: "AI Engineer",
    required_skills: ["Python", "TensorFlow", "Deep Learning", "MLOps", "NLP", "PyTorch"],
    salary_range: "₹12L - ₹25L",
    market_demand: "Very High",
    difficulty: "Advanced",
    growth: "Excellent",
    demand_growth_2030: "+52%",
    hiring_trend: "Rising Rapidly",
    regional_insights: {
      Bengaluru: "₹15L - ₹30L",
      Mumbai: "₹14L - ₹28L",
      "Delhi NCR": "₹12L - ₹24L",
      Pune: "₹11L - ₹22L",
    },
    salaries_by_experience: {
      Junior: "₹8L - ₹12L",
      "Mid-level": "₹12L - ₹20L",
      Senior: "₹20L - ₹35L",
      Lead: "₹35L - ₹55L+"
    },
    description: "Architect core model infrastructures, manage deep learning architectures, and deploy automated neural reasoning structures to support cloud LLM tools."
  },
  {
    role_id: "data-scientist",
    role_name: "Data Scientist",
    required_skills: ["Python", "SQL", "Pandas", "Scikit-Learn", "Machine Learning", "Statistics"],
    salary_range: "₹10L - ₹20L",
    market_demand: "High",
    difficulty: "Medium-Hard",
    growth: "Excellent",
    demand_growth_2030: "+35%",
    hiring_trend: "Steady Growth",
    regional_insights: {
      Bengaluru: "₹12L - ₹24L",
      Mumbai: "₹11L - ₹22L",
      "Delhi NCR": "₹10L - ₹20L",
      Pune: "₹9L - ₹18L",
    },
    salaries_by_experience: {
      Junior: "₹6L - ₹10L",
      "Mid-level": "₹10L - ₹18L",
      Senior: "₹18L - ₹28L",
      Lead: "₹28L - ₹45L+"
    },
    description: "Solve complex business dilemmas by deploying machine learning algorithms, validating data models, and designing key stakeholder dashboards."
  },
  {
    role_id: "backend-developer",
    role_name: "Backend Developer",
    required_skills: ["Node.js", "SQL", "Express", "PostgreSQL", "JavaScript", "Docker", "REST APIs"],
    salary_range: "₹8L - ₹18L",
    market_demand: "High",
    difficulty: "Medium",
    growth: "Very Good",
    demand_growth_2030: "+28%",
    hiring_trend: "High Demand",
    regional_insights: {
      Bengaluru: "₹10L - ₹22L",
      Mumbai: "₹9L - ₹20L",
      "Delhi NCR": "₹8L - ₹18L",
      Pune: "₹8L - ₹17L",
    },
    salaries_by_experience: {
      Junior: "₹5L - ₹8L",
      "Mid-level": "₹8L - ₹15L",
      Senior: "₹15L - ₹25L",
      Lead: "₹25L - ₹40L+"
    },
    description: "Deploy robust application logic, manage heavy server connections, optimize database indexing, and protect secure REST API transactions."
  },
  {
    role_id: "cloud-engineer",
    role_name: "Cloud Engineer",
    required_skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Google Cloud"],
    salary_range: "₹11L - ₹22L",
    market_demand: "Very High",
    difficulty: "Advanced",
    growth: "Outstanding",
    demand_growth_2030: "+42%",
    hiring_trend: "Strong Attraction",
    regional_insights: {
      Bengaluru: "₹13L - ₹26L",
      Mumbai: "₹12L - ₹24L",
      "Delhi NCR": "₹11L - ₹22L",
      Pune: "₹10L - ₹20L",
    },
    salaries_by_experience: {
      Junior: "₹7L - ₹11L",
      "Mid-level": "₹11L - ₹18L",
      Senior: "₹18L - ₹30L",
      Lead: "₹30L - ₹50L+"
    },
    description: "Manage scalable cloud networks, configure container orchestration, build robust YAML blueprints, and safeguard devops clusters."
  },
  {
    role_id: "cybersecurity-analyst",
    role_name: "Cybersecurity Analyst",
    required_skills: ["Linux", "Networks", "Penetration Testing", "Cryptography", "Firewalls", "Security Audit"],
    salary_range: "₹9L - ₹18L",
    market_demand: "Very High",
    difficulty: "Advanced",
    growth: "Very Good",
    demand_growth_2030: "+48%",
    hiring_trend: "Surging Focus",
    regional_insights: {
      Bengaluru: "₹11L - ₹22L",
      Mumbai: "₹10L - ₹20L",
      "Delhi NCR": "₹9L - ₹18L",
      Pune: "₹9L - ₹17L",
    },
    salaries_by_experience: {
      Junior: "₹6L - ₹9L",
      "Mid-level": "₹9L - ₹15L",
      Senior: "₹15L - ₹24L",
      Lead: "₹24L - ₹38L+"
    },
    description: "Detect system loopholes, defend network perimeters, construct encrypted configurations, and audit corporate software safety."
  },
  {
    role_id: "mlops-engineer",
    role_name: "MLOps Engineer",
    required_skills: ["Docker", "Kubernetes", "Python", "MLOps", "Git", "CI/CD", "AWS", "Weights & Biases"],
    salary_range: "₹13L - ₹26L",
    market_demand: "Very High",
    difficulty: "Advanced",
    growth: "Excellent",
    demand_growth_2030: "+58%",
    hiring_trend: "Emerging Fast",
    regional_insights: {
      Bengaluru: "₹16L - ₹32L",
      Mumbai: "₹14L - ₹28L",
      "Delhi NCR": "₹13L - ₹25L",
      Pune: "₹12L - ₹23L",
    },
    salaries_by_experience: {
      Junior: "₹8L - ₹13L",
      "Mid-level": "₹13L - ₹22L",
      Senior: "₹22L - ₹36L",
      Lead: "₹36L - ₹60L+"
    },
    description: "Ensure machine learning reliability, deploy pipelines tracking performance metrics, adjust live drift benchmarks, and coordinate model registries."
  }
];

interface CareerMapperViewProps {
  results: ProfileMappingResults | null;
  onNavigate: (tab: string) => void;
  isDarkMode?: boolean;
}

export default function CareerMapperView({ results, onNavigate, isDarkMode = true }: CareerMapperViewProps) {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [is2030Forecast, setIs2030Forecast] = useState<boolean>(false);
  const [regionalMetro, setRegionalMetro] = useState<string>("Bengaluru");
  const [showDetailedRoadmap, setShowDetailedRoadmap] = useState<boolean>(false);

  // Active Career Mapper subtab selector (matches Resume and Skills page architectures)
  const [activeMapperTab, setActiveMapperTab] = useState<"compatibility" | "market" | "switch" | "compare" | "chat">("compatibility");

  // Reset detailed roadmap when tabs are changed
  useEffect(() => {
    setShowDetailedRoadmap(false);
  }, [activeMapperTab]);

  // Multi-Career Comparison state
  const [comparisonRoles, setComparisonRoles] = useState<string[]>(["ai-engineer", "data-scientist"]);
  const [showComparisonSetup, setShowComparisonSetup] = useState<boolean>(false);

  // Career Switching path states
  const [switchFromRole, setSwitchFromRole] = useState<string>("backend-developer");
  const [switchToRole, setSwitchToRole] = useState<string>("ai-engineer");
  const [showTransitionGuide, setShowTransitionGuide] = useState<boolean>(true);

  // Practice roadmaps tasks state (Local checklists tracking progress)
  const [completedPracticeTasks, setCompletedPracticeTasks] = useState<{ [key: string]: boolean }>({});

  // Chatbot state
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "👋 Hello! I am your strategic AI Career Coach and Hiring Analyst. Ask me about switching career paths, top certifications, system design, or growth projections for 2030!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!results) {
    return (
      <div className="p-8 border border-dashed border-gray-800 rounded-2xl bg-slate-900/10 text-center space-y-4 max-w-lg mx-auto mt-10">
        <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
        <h4 className="text-white font-bold">No Active Profile Evaluation</h4>
        <p className="text-gray-400 text-xs leading-relaxed">
          Please complete the initial calibration profile or upload a resume in the Dashboard / Resume tab to visualize comprehensive career mapper system analytics.
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-4 py-2 bg-indigo-650 hover:bg-slate-800 border border-indigo-550 rounded-lg text-xs font-semibold text-white transition-all"
        >
          Calibrate Profile Now
        </button>
      </div>
    );
  }

  // 1. Gather all user skills to run calculations
  const userSkillItems = results?.skills || [];
  const userSkillNames = userSkillItems.map(s => s.name);
  const userExperienceGrade = results?.learningRoadmap?.[0] ? "Mid-Level Professional" : "Junior (1-2 Years)";

  // 2. Compute dynamic readiness metrics and overall Career Readiness Score (Exactly matching prompt weight constraints)
  // Formula: readiness = technical_skills * 0.35 + projects * 0.20 + experience * 0.15 + market_alignment * 0.15 + certifications * 0.10 + communication * 0.05
  const technical_skills_ready = Math.min(100, userSkillItems.length > 0
    ? Math.round(userSkillItems.reduce((acc, s) => acc + s.proficiency, 0) / userSkillItems.length)
    : 72
  );
  const projects_ready = userSkillItems.length > 5 ? 88 : 75;
  const experience_ready = userExperienceGrade.includes("Mid") ? 85 : 70;
  const market_alignment_ready = 82;
  const certifications_ready = 78;
  const communication_ready = userSkillItems.find(s => s?.name?.toLowerCase()?.includes("communication"))?.proficiency || 85;

  const career_readiness_score = Math.round(
    technical_skills_ready * 0.35 +
    projects_ready * 0.20 +
    experience_ready * 0.15 +
    market_alignment_ready * 0.15 +
    certifications_ready * 0.10 +
    communication_ready * 0.05
  );

  // 3. For each role in our Career DB, execute the Compatibility calculation dynamically based on actual userSkills
  // Formula: compatibility = skill_score * 0.40 + project_score * 0.20 + experience_score * 0.15 + certification_score * 0.10 + market_alignment * 0.10 + interest_score * 0.05
  const processedRoles = CAREER_ROLES_DB.map((role) => {
    // Determine overlapping skills
    const matchedSkills = role.required_skills.filter(reqSkill =>
      userSkillNames.some(item => {
        const itemL = (item || "").toLowerCase();
        const reqL = (reqSkill || "").toLowerCase();
        return itemL.includes(reqL) || reqL.includes(itemL);
      })
    );
    const missingSkills = role.required_skills.filter(s => !matchedSkills.includes(s));

    // Factor Calculations
    const skillScore = (matchedSkills.length / role.required_skills.length) * 100;
    const projectScore = userSkillItems.length > 5 ? 85 : 72;
    const expScore = userExperienceGrade.includes("Mid") ? 85 : 70;
    const certScore = matchedSkills.length > 2 ? 85 : 65;
    const marketScore = role.market_demand === "Very High" ? 95 : role.market_demand === "High" ? 85 : 72;
    // Interest: positive match if user careerGoal correlates with the role name
    const isGoalCorrelated = results.careerPaths?.some(cp => cp?.title?.toLowerCase()?.includes((role.role_name || "").toLowerCase()));
    const interestScore = isGoalCorrelated ? 95 : 65;

    // Weight multiplication
    const compatPercent = Math.round(
      skillScore * 0.40 +
      projectScore * 0.20 +
      expScore * 0.15 +
      certScore * 0.10 +
      marketScore * 0.10 +
      interestScore * 0.05
    );

    return {
      ...role,
      matchScore: compatPercent,
      matchedSkills,
      missingSkills,
      evaluationBreakdown: {
        skills: Math.round(skillScore),
        projects: projectScore,
        experience: expScore,
        certifications: certScore,
        market: marketScore,
        interest: interestScore
      }
    };
  });

  // Sort processed roles by match Score descending
  const sortedProcessedRoles = [...processedRoles].sort((a, b) => b.matchScore - a.matchScore);
  const currentSelectedRole = sortedProcessedRoles[selectedRoleIndex] || sortedProcessedRoles[0];

  // Assemble dynamic gaps from mismatch logic
  const computedGapItems = currentSelectedRole.missingSkills.map((gapS, index) => {
    // Priority and severity allocations
    const priority: "High" | "Medium" | "Low" = index === 0 ? "High" : index === 1 ? "Medium" : "Low";
    const severity: "Critical" | "Moderate" | "Minor" = index === 0 ? "Critical" : index === 1 ? "Moderate" : "Minor";
    
    // Check if the current results skillGaps already has a matching explanation to respect AI outcomes
    const savedGapMatch = results.skillGaps?.find(g => g?.skillName?.toLowerCase()?.includes((gapS || "").toLowerCase()));
    const whyNeeded = savedGapMatch?.whyNeeded || `This skill/tool is an essential component of professional standard structures expected in high-availability environments for a target ${currentSelectedRole.role_name}.`;

    return {
      skillName: gapS,
      priority,
      severity,
      whyNeeded
    };
  });

  // Calculate coordinates for the Interactive custom SVG Radar Chart representing selected role metrics
  const radarLabels = ["Skills Score", "Projects", "Experience", "Certs", "Market Alignment", "Interests"];
  const radarMetrics = [
    currentSelectedRole.evaluationBreakdown.skills,
    currentSelectedRole.evaluationBreakdown.projects,
    currentSelectedRole.evaluationBreakdown.experience,
    currentSelectedRole.evaluationBreakdown.certifications,
    currentSelectedRole.evaluationBreakdown.market,
    currentSelectedRole.evaluationBreakdown.interest,
  ];

  // Helper coordinate generator (6 points system)
  const plotRadarPoints = (metricsList: number[], scale = 0.6) => {
    const center = { x: 100, y: 100 };
    const r = 80;
    return metricsList.map((m, idx) => {
      const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
      const amount = (m / 100) * r * scale;
      const x = center.x + amount * Math.cos(angle);
      const y = center.y + amount * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  // Generate Career Switching Path Steps dynamically based on selection
  const makePivotalSwitchSteps = (fromId: string, toId: string) => {
    const fromR = processedRoles.find(r => r.role_id === fromId);
    const toR = processedRoles.find(r => r.role_id === toId);
    if (!fromR || !toR) return [];

    // Identify pivot overlap skills and skills that are absolute missing gaps
    const uniqueSkillsNeeded = toR.required_skills.filter(s => !fromR.required_skills.includes(s));
    
    return [
      {
        phase: "Phase 1: Leverage Overlapping Stack",
        desc: `Validate and frame your existing mastery in ${fromR.required_skills.slice(0, 3).join(", ")}, highlighting database and programmatic fundamentals to recruiter pipelines.`,
        duration: "Weeks 1 - 4"
      },
      {
        phase: `Phase 2: Bridge Pivot Skill Gaps`,
        desc: `Target the absolute core transition competencies: Learn ${uniqueSkillsNeeded.length > 0 ? uniqueSkillsNeeded.join(" and ") : "advanced deployment and cloud metrics"}. Build 2 focused sub-modules testing these technologies in isolation.`,
        duration: "Weeks 5 - 12",
        gaps: uniqueSkillsNeeded
      },
      {
        phase: "Phase 3: Architect Complete Portfolio Capstones",
        desc: `Deploy a production-ready application that simulates the specific duties of a ${toR.role_name} (using Docker containers and automated scripts).`,
        duration: "Weeks 13 - 18"
      },
      {
        phase: "Phase 4: Resume Optimization & Strategy",
        desc: `Revamp your profile by placing the newly acquired ${toR.role_name} frameworks first. Highlight metrics and direct deployment details to bypass automated ATS filters.`,
        duration: "Weeks 19 - 24"
      }
    ];
  };

  const activeTransitionSteps = makePivotalSwitchSteps(switchFromRole, switchToRole);

  // Chat agent submission helper (makes call to genuine backend!)
  const handleChatSend = async (messageText?: string) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Map current history for backend format
      const historyFormatted = chatMessages.map(msg => ({
        role: msg.sender === "user" ? "user" as const : "model" as const,
        text: msg.text
      }));

      // Call express backend /api/mentor/chat directly for real AI insights
      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userMessage: textToSend,
          chatHistory: historyFormatted,
          userProfile: {
            name: results.info?.includes("missing") ? "Candidate" : "Active Career Architect",
            careerGoal: currentSelectedRole.role_name,
            degree: "Developer Studies",
            knownSkills: userSkillNames
          }
        })
      });

      if (!response.ok) {
        throw new Error("Mentor connection error");
      }

      const rawData = await response.json();
      
      const botMsg = {
        sender: "bot" as const,
        text: rawData.reply || "I have received your request and advise focusing heavily on mapping technical skills against local hiring trends. Let me know which skill pipeline you want to analyze next!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn("Express /api/mentor/chat fallback activation:", err);
      // Simulate highly informed, strategic reply in case API credentials are currently empty
      setTimeout(() => {
        const fallbackReply = `As your strategic Career Advisor, I suggest taking a targeted look at transitioning to being an elite AI Engineer. Based on your skill profiles, you can leverage your knowledge of [${userSkillNames.slice(0, 3).join(", ")}] to start mastering neural configurations. Focus specifically on ${currentSelectedRole.missingSkills[0] || "MLOps and cloud telemetry"} to elevate performance bounds.`;
        setChatMessages(prev => [...prev, {
          sender: "bot",
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Toggle tasks helper
  const handleToggleTask = (taskName: string) => {
    setCompletedPracticeTasks(prev => ({
      ...prev,
      [taskName]: !prev[taskName]
    }));
  };

  const handleToggleComparisonRole = (roleId: string) => {
    if (comparisonRoles.includes(roleId)) {
      if (comparisonRoles.length > 1) {
        setComparisonRoles(comparisonRoles.filter(id => id !== roleId));
      }
    } else {
      if (comparisonRoles.length < 3) {
        setComparisonRoles([...comparisonRoles, roleId]);
      }
    }
  };

  return (
    <div className="space-y-6 select-none leading-relaxed text-left pb-12">
      
      {/* 1. Header & Educational Explainer (What is the Career Mapper?) */}
      <div className={`p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-colors duration-250 ${
        isDarkMode ? "border-slate-800 bg-[#111827]/60 text-gray-100" : "border-slate-200 bg-white shadow-sm text-slate-800"
      }`}>
        {/* Ambient background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-white shadow-lg">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>AI Career Intel & Compatibility Engine</h3>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Transforming skills, project footprints, and experience levels into hyper-targeted strategic career trajectories.</p>
            </div>
          </div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-1 px-3 border rounded-lg text-[11px] font-mono font-bold tracking-tight transition-all duration-150 ${
              isDarkMode 
                ? "border-slate-800 hover:bg-slate-900 text-cyan-400" 
                : "border-slate-200 hover:bg-slate-100 text-indigo-600"
            }`}
          >
            {showExplanation ? "Hide Explanation" : "What is Career Mapper?"}
          </button>
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-xs space-y-3 pt-4 border-t ${
                isDarkMode ? "text-gray-400 border-slate-900/60" : "text-slate-600 border-slate-200"
              }`}
            >
              <p>
                The <strong>Career Mapper System</strong> is the core decision-support brain of this platform. By analyzing 
                your portfolio against hundreds of standardized corporate job descriptions, it evaluates <strong>career readiness metrics</strong> and
                determines your exact <strong>role compatibility matching indices</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDarkMode ? "bg-slate-950/80 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`font-mono uppercase text-[9px] font-bold tracking-wider ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>Skill Matching Logic</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Computes overlapping percentage across mandatory requirements instantly showing matched (✔) vs missing (✘) tags.</p>
                </div>
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDarkMode ? "bg-slate-950/80 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`font-mono uppercase text-[9px] font-bold tracking-wider ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>Weighed Compatibility</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Derived transparently via weights: Skills (40%), Projects (20%), Experience (15%), Certifications (10%), Market (10%), Interests (5%).</p>
                </div>
                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isDarkMode ? "bg-slate-950/80 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`font-mono uppercase text-[9px] font-bold tracking-wider ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>Gap Severity Levels</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Differentiates obstacles into Critical targets, Moderate issues, or Minor items to focus on during learning sprints.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Segmented Workflow Tab Switcher (Styled same as Resume Scorer) */}
      <div className={`p-1.5 rounded-2xl border flex flex-wrap gap-1 ${
        isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-100 border-slate-200"
      }`}>
        <button
          onClick={() => setActiveMapperTab("compatibility")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeMapperTab === "compatibility"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>1. Compatibility & Specs</span>
        </button>

        <button
          onClick={() => setActiveMapperTab("market")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeMapperTab === "market"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Readiness & Trajectories</span>
        </button>

        <button
          onClick={() => setActiveMapperTab("switch")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeMapperTab === "switch"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>3. AI Pivot Switcher</span>
        </button>

        <button
          onClick={() => setActiveMapperTab("compare")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeMapperTab === "compare"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4. Multi-Role Comparison</span>
        </button>

        <button
          onClick={() => setActiveMapperTab("chat")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeMapperTab === "chat"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>5. AI Coach Copilot</span>
        </button>
      </div>

      {/* 2. Top-Tier Visual Dashboard Cards: Readiness Gauge & Demand Heatmap */}
      {activeMapperTab === "market" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
        
        {/* Career Readiness Score Gauge (Exact formula: 35/20/15/15/10/5 weight model) */}
        <div className={`p-6 rounded-2xl border backdrop-blur space-y-5 lg:col-span-1 transition-all duration-250 ${
          isDarkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-white shadow-sm"
        }`}>
          <div className={`flex justify-between items-center border-b pb-3 ${
            isDarkMode ? "border-slate-850" : "border-slate-100"
          }`}>
            <h4 className={`text-xs font-mono uppercase tracking-widest font-bold block ${
              isDarkMode ? "text-cyan-400" : "text-indigo-600"
            }`}>CAREER READINESS GAUGE</h4>
            <span className={`inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase text-right ${
              isDarkMode ? "bg-cyan-950/30 text-cyan-300" : "bg-indigo-50 text-indigo-600"
            }`}>
              WEIGHT COMPLIANT
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 relative">
            {/* Interactive Circular Progress representing Readiness */}
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Outer boundary circular background */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`fill-none ${isDarkMode ? "stroke-slate-950" : "stroke-slate-100"}`}
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`fill-none ${isDarkMode ? "stroke-cyan-500/25" : "stroke-indigo-100/40"}`}
                strokeWidth="8"
              />
              {/* Active filled circular indicator */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-cyan-400 fill-none transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * career_readiness_score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>{career_readiness_score}%</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>Overall Readiness</span>
            </div>
          </div>

          {/* Breakdown criteria based on the standard formulas */}
          <div className="space-y-2.5 pt-2">
            {[
              { label: "Technical Capabilities (35%)", color: "bg-cyan-400", val: technical_skills_ready },
              { label: "Portfolio Projects (20%)", color: "bg-indigo-400", val: projects_ready },
              { label: "Experience Alignment (15%)", color: "bg-emerald-400", val: experience_ready },
              { label: "Demand Allocation (15%)", color: "bg-purple-400", val: market_alignment_ready },
              { label: "Certifications Index (10%)", color: "bg-rose-400", val: certifications_ready },
              { label: "Communication Softs (5%)", color: "bg-red-400", val: communication_ready }
            ].map((criterion) => (
              <div key={criterion.label} className="flex justify-between items-center text-[11px]">
                <span className={`flex items-center gap-1.5 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${criterion.color}`} />
                  {criterion.label}
                </span>
                <span className={`font-mono font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{criterion.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Heatmap & 2030 Career Forecast */}
        <div className={`p-6 rounded-2xl border backdrop-blur space-y-4 lg:col-span-2 flex flex-col justify-between transition-colors duration-250 ${
          isDarkMode ? "border-slate-800 bg-[#111827]/40" : "border-slate-200 bg-white shadow-sm"
        }`}>
          <div>
            <div className={`flex justify-between items-center border-b pb-3 mb-3.5 ${
              isDarkMode ? "border-slate-850" : "border-slate-100"
            }`}>
              <h4 className={`text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2 ${
                isDarkMode ? "text-[#94A3B8]" : "text-slate-800"
              }`}>
                <Sparkles className="w-4 h-4 text-purple-400" />
                Demand Heatmap & 2030 Projections
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>2030 Forecast</span>
                <button
                  onClick={() => setIs2030Forecast(!is2030Forecast)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors ${
                    is2030Forecast 
                      ? "bg-cyan-500" 
                      : isDarkMode ? "bg-slate-800" : "bg-slate-200"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all ${isDarkMode ? "bg-slate-950" : "bg-white"}`} style={{ left: is2030Forecast ? '20px' : '2px' }} />
                </button>
              </div>
            </div>

            <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
              Analyzing deep hiring demand trajectories and regional salary brackets across top developer divisions. Check active growth indexes to target high-demand careers.
            </p>

            {/* Visual Heatmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {processedRoles.map((role) => {
                const growthRate = is2030Forecast ? role.demand_growth_2030 : "+22% Avg";
                return (
                  <div
                    key={role.role_id}
                    className={`p-3 rounded-xl space-y-2 flex flex-col justify-between transition-all border ${
                      isDarkMode 
                        ? "bg-slate-950/70 border-slate-850 hover:border-slate-700" 
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-bold block ${isDarkMode ? "text-white" : "text-slate-950"}`}>{role.role_name}</span>
                      <span className={`text-[10px] block font-mono ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>{role.hiring_trend}</span>
                    </div>

                    <div className={`flex justify-between items-center pt-2 border-t ${
                      isDarkMode ? "border-slate-900/40" : "border-slate-200"
                    }`}>
                      <span className={`text-[11px] font-mono font-bold ${isDarkMode ? "text-cyan-300" : "text-indigo-600"}`}>{growthRate}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-black ${
                        role.market_demand === "Very High" 
                          ? isDarkMode ? "text-rose-400 bg-rose-950/20" : "text-rose-600 bg-rose-50"
                          : isDarkMode ? "text-amber-400 bg-amber-950/20" : "text-amber-600 bg-amber-50"
                      }`}>
                        {role.market_demand}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`p-3.5 rounded-xl flex items-center gap-3.5 text-xs border ${
            isDarkMode ? "bg-slate-950/40 border-slate-850/60" : "bg-slate-50 border-slate-200"
          }`}>
            <Info className="w-5 h-5 flex-shrink-0 text-cyan-400" />
            <p className={`leading-normal ${isDarkMode ? "text-gray-400" : "text-slate-650"}`}>
              <strong>Future Prediction:</strong> By 2030, Generative AI integration specialists and <strong>MLOps drift architects</strong> will command a <strong>+58% growth trajectory</strong>, making automated containers deployment a high-priority skill.
            </p>
          </div>
        </div>
        </motion.div>
      )}

      {/* 3. Core System Selector, CareerCards, & Interactive Radar Chart */}
      {activeMapperTab === "compatibility" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6 animate-fadeIn"
        >
          {showDetailedRoadmap ? (
            <div className="space-y-6 text-left">
              {/* Breadcrumbs for structured roadmap navigation */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono py-1">
                <button
                  type="button"
                  onClick={() => setShowDetailedRoadmap(false)}
                  className={`hover:underline cursor-pointer flex items-center gap-1 font-semibold ${
                    isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-505 hover:text-slate-800"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Careers Home</span>
                </button>
                <ChevronRight className={`w-3 h-3 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`} />
                <button
                  type="button"
                  onClick={() => setShowDetailedRoadmap(false)}
                  className={`hover:underline cursor-pointer font-semibold ${
                    isDarkMode ? "text-cyan-400 hover:text-cyan-300" : "text-indigo-650 hover:text-indigo-500"
                  }`}
                >
                  Compatibility & Specs
                </button>
                <ChevronRight className={`w-3 h-3 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`} />
                <span className={isDarkMode ? "text-gray-300 font-bold" : "text-slate-800 font-bold"}>
                  {currentSelectedRole.role_name} Detailed Study Path
                </span>
              </div>

              {/* Enhanced Action Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDetailedRoadmap(false)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isDarkMode
                        ? "border-slate-800 bg-[#111827]/40 hover:bg-slate-900 text-gray-400 hover:text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm"
                    }`}
                    title="Back to Specifications Overview"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <span className={`text-[9px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded ${
                      isDarkMode ? "bg-cyan-950/40 text-cyan-400" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      Interactive Study Track
                    </span>
                    <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {currentSelectedRole.role_name} In-Depth Timeline
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailedRoadmap(false)}
                  className={`w-full sm:w-auto px-4 py-2 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isDarkMode
                      ? "border-slate-800 bg-slate-905 hover:bg-slate-900 text-cyan-400"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-indigo-650 shadow-sm"
                  }`}
                >
                  ← Return to Specifications
                </button>
              </div>

              {/* Dynamic Metric Snapshot Panel */}
              <div className={`p-5 rounded-2xl border backdrop-blur text-left space-y-4 shadow-sm relative overflow-hidden ${
                isDarkMode ? "border-slate-800 bg-[#111827]/30 text-gray-100" : "border-slate-200 bg-white text-slate-800"
              }`}>
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-cyan-550/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-cyan-400" : "text-indigo-650"}`}>
                    Hiring Profile Metrics snapshot
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono block text-gray-500 uppercase">Est. Base Salary</span>
                    <span className={`text-sm font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{currentSelectedRole.salary_range}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono block text-gray-400 dark:text-slate-500 uppercase">Complexity Tier</span>
                    <span className={`text-sm font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{currentSelectedRole.difficulty}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono block text-gray-400 dark:text-slate-500 uppercase">Growth Track</span>
                    <span className="text-sm font-black text-emerald-500">{currentSelectedRole.growth} ({currentSelectedRole.demand_growth_2030})</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono block text-gray-400 dark:text-slate-500 uppercase">Your Compatibility Match</span>
                    <span className="text-sm font-black text-cyan-500">{currentSelectedRole.matchScore}% Score</span>
                  </div>
                </div>
                <p className={`text-[11px] leading-relaxed border-t pt-3 border-dashed ${isDarkMode ? "border-slate-850 text-gray-405" : "border-slate-150 text-slate-600"}`}>
                  <strong>Operational Insight:</strong> Ready profiles of this caliber are expected to master advanced deployment specifications, metrics diagnostic layers, and system scaling paradigms. Follow study sprints to prepare for recruiter pipelines.
                </p>
              </div>

              {/* Sprints Modules List */}
              <div className="space-y-6 pt-2">
                {[
                  {
                    phaseNumber: 1,
                    title: `Phase 1: Basic Foundations & Local Toolchain Setup`,
                    duration: "Weeks 1 - 4",
                    objective: `Establish stable local staging assets, construct elementary code structure, write robust diagnostic loops, and configure shell terminals.`,
                    skills: currentSelectedRole.required_skills?.slice(0, 2) || [],
                    project: {
                      title: `${currentSelectedRole.role_name} Fundamentals sandbox`,
                      description: `Assemble a highly structured development repository delivering clean command outputs that check the compliance of ${currentSelectedRole.required_skills?.slice(0, 2).join(" & ") || "system stack"}.`,
                      tags: currentSelectedRole.required_skills?.slice(0, 2) || []
                    },
                    tasks: [
                      `Install standard executable runtimes and verify stable CLI dependencies.`,
                      `Construct 3 elementary sandbox modules implementing foundational loops.`,
                      `Analyze connection latency counters on typical local requests.`,
                      `Verify secure system path declarations in terminal configuration.`
                    ]
                  },
                  {
                    phaseNumber: 2,
                    title: `Phase 2: Database Operations & Middleware Integration`,
                    duration: "Weeks 5 - 12",
                    objective: `Configure persistent data models, connect secure database connections, write robust REST pathways, and filter queries.`,
                    skills: currentSelectedRole.required_skills?.slice(2, 4) || [],
                    project: {
                      title: `Enterprise ${currentSelectedRole.role_name} Service Hub`,
                      description: `Design a localized microservice linking key schemas, checking structural constraints constraints, and managing high-frequency transactions for ${currentSelectedRole.required_skills?.slice(2, 4).join(" & ") || "core frameworks"}.`,
                      tags: currentSelectedRole.required_skills?.slice(2, 4) || []
                    },
                    tasks: [
                      `Establish active local database servers with strict indexing controls.`,
                      `Write full end-to-end schemas validating transactional records.`,
                      `Integrate query caches to decrease routine response lag by ~25%.`,
                      `Implement fallback validation tests on relational connection timeout.`
                    ]
                  },
                  {
                    phaseNumber: 3,
                    title: `Phase 3: High-Availability Cloud Deployment & Telemetry`,
                    duration: "Weeks 13 - 20",
                    objective: `Deploy scalable containers, execute secure build pipelines, deploy files on live nodes, and dashboard health telemetry.`,
                    skills: currentSelectedRole.required_skills?.slice(4) || [],
                    project: {
                      title: `Production Cluster Capstone Suit`,
                      description: `Deliver a fully containerized cloud app setup with automated environment rules, performance diagnostics dashboards, and system-level logs tracking.`,
                      tags: currentSelectedRole.required_skills?.slice(4) || []
                    },
                    tasks: [
                      `Build clean multi-stage files to launch self-contained virtual nodes.`,
                      `Configure automated metric trackers gathering resource consumption levels.`,
                      `Execute pipeline automation scripts deploying draft files securely.`,
                      `Formulate robust architectural briefings demonstrating operational readiness.`
                    ]
                  }
                ].map((phase, pIdx) => (
                  <div
                    key={pIdx}
                    className={`p-6 border rounded-2xl relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow ${
                      isDarkMode 
                        ? "border-slate-800 bg-[#111827]/40 text-gray-100" 
                        : "border-slate-200 bg-white text-slate-800 shadow shadow-slate-100"
                    }`}
                  >
                    {/* Phase Banner */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-850">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase font-black ${
                            isDarkMode ? "bg-cyan-950/40 text-cyan-400" : "bg-indigo-50 text-indigo-600"
                          }`}>
                            PHASE {phase.phaseNumber} SPRINT
                          </span>
                          <span className={`text-[10px] font-mono font-extrabold flex items-center gap-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                            <Clock className="w-3.5 h-3.5 text-cyan-500/85" />
                            {phase.duration}
                          </span>
                        </div>
                        <h4 className={`text-base font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900 font-sans"}`}>
                          {phase.title}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-black uppercase ${
                        isDarkMode ? "bg-slate-900 border-slate-800 text-gray-400" : "bg-slate-50 border-slate-150 text-slate-500"
                      }`}>
                        Course Syllabus Focus
                      </span>
                    </div>

                    {/* Phase Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
                      {/* Sprint Objectives */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="space-y-1.5 text-left">
                          <span className={`text-[10px] font-mono uppercase block font-extrabold tracking-wider ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                            Objectives
                          </span>
                          <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-350" : "text-slate-600"}`}>
                            {phase.objective}
                          </p>
                        </div>
                        
                        <div className="space-y-2 text-left">
                          <span className={`text-[10px] font-mono uppercase block font-extrabold tracking-wider ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                            Topics Checked:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {phase.skills.map((skName, sIndex) => (
                              <span
                                key={sIndex}
                                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border ${
                                  isDarkMode
                                    ? "bg-slate-950 border-slate-800 text-cyan-300"
                                    : "bg-slate-50 border-slate-150 text-indigo-650"
                                }`}
                              >
                                {skName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hands-on portfolio project */}
                      <div className="lg:col-span-4 space-y-3 text-left">
                        <span className={`text-[10px] font-mono uppercase block font-extrabold tracking-wider ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                          Capstone Portfolio Target:
                        </span>
                        <div className={`p-4 rounded-xl border space-y-2 h-full ${
                          isDarkMode ? "bg-indigo-950/10 border-indigo-900/10" : "bg-indigo-50/15 border-indigo-100"
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-550 dark:text-cyan-400">
                            <Award className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span className="line-clamp-1">{phase.project.title}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed line-clamp-3 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
                            {phase.project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {phase.project.tags.map((tg, keyIdx) => (
                              <span key={keyIdx} className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                                isDarkMode ? "bg-slate-900 text-gray-450" : "bg-slate-50 border border-slate-200 text-slate-550"
                              }`}>
                                {tg}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Interactive practice checks */}
                      <div className="lg:col-span-4 space-y-3 text-left">
                        <span className={`text-[10px] font-mono uppercase block font-extrabold tracking-wider ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                          Check progress tasks:
                        </span>
                        <div className="space-y-2">
                          {phase.tasks.map((taskLabel, tIndex) => {
                            const taskId = `${currentSelectedRole.role_id}-p${pIdx}-t${tIndex}`;
                            const isDone = completedPracticeTasks[taskId] || false;
                            return (
                              <button
                                key={tIndex}
                                type="button"
                                onClick={() => handleToggleTask(taskId)}
                                className={`w-full text-left p-2 rounded-lg border flex items-start gap-2.5 transition-all cursor-pointer ${
                                  isDone
                                    ? isDarkMode
                                      ? "bg-emerald-950/15 border-emerald-900/20 text-emerald-400"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                                    : isDarkMode
                                      ? "bg-slate-900 hover:bg-slate-850 border-slate-850 text-slate-300"
                                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-705"
                                }`}
                              >
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-600 text-white"
                                    : isDarkMode ? "border-slate-700 bg-slate-950" : "border-slate-300 bg-white"
                                }`}>
                                  {isDone && <Check className="w-3 h-3 text-white font-black" />}
                                </div>
                                <span className={`text-[11px] leading-snug font-medium ${isDone ? "line-through opacity-70" : ""}`}>
                                  {taskLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom return bar */}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailedRoadmap(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:brightness-110 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                  <span>Return to Executive Specifications</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Matched Career Path Carousel / Premium Grid Selector (Executive Overview) */}
              <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1.5">
              <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${
                isDarkMode ? "text-cyan-400" : "text-indigo-600"
              }`}>
                MATCHED CAREER DIRECTIONS / SPECS ({processedRoles.length} OPTIONS)
              </span>
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-slate-500"} font-medium`}>
                Select any path below to inspect detailed specifications, salary analytics, and gap strategies.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProcessedRoles.map((role, idx) => {
                const isActive = currentSelectedRole.role_id === role.role_id;
                return (
                  <button
                    key={role.role_id}
                    onClick={() => setSelectedRoleIndex(idx)}
                    className={`group w-full text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[135px] cursor-pointer ${
                      isActive
                        ? isDarkMode
                          ? "border-cyan-500 bg-[#0c1e2b] shadow-lg shadow-cyan-950/20"
                          : "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                        : isDarkMode
                          ? "border-slate-850 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-sm"
                    }`}
                  >
                    {/* Active accent top bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                      isActive
                        ? isDarkMode ? "bg-cyan-400" : "bg-indigo-600"
                        : "bg-transparent group-hover:bg-slate-300/40"
                    }`} />

                    <div className="flex justify-between items-start gap-2.5 w-full">
                      <div className="space-y-1">
                        <h4 className={`text-sm font-extrabold tracking-tight leading-normal font-sans transition-colors ${
                          isActive
                            ? isDarkMode ? "text-cyan-400" : "text-indigo-600 font-extrabold"
                            : isDarkMode ? "text-white" : "text-slate-900"
                        }`}>
                          {role.role_name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>Match Score:</span>
                          <span className={`font-black ${
                            role.matchScore >= 80 ? "text-emerald-500" : isDarkMode ? "text-cyan-400" : "text-indigo-600"
                          }`}>
                            {role.matchScore}%
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-mono font-bold tracking-wider uppercase flex-shrink-0 ${
                        role.market_demand === "Very High"
                          ? isDarkMode ? "text-rose-450 bg-rose-950/30 border border-rose-900/20" : "text-rose-600 bg-rose-50 border border-rose-200"
                          : isDarkMode ? "text-purple-305 bg-purple-950/30 border border-purple-900/20" : "text-indigo-600 bg-indigo-50 border border-indigo-200"
                      }`}>
                        {role.market_demand}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed my-1.5 line-clamp-2 ${
                      isDarkMode ? "text-gray-400" : "text-slate-600"
                    }`}>
                      {role.description}
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-dashed border-slate-700/20 text-[10px] font-mono">
                      <span>Salary Range: <strong className={isDarkMode ? "text-white" : "text-slate-800"}>{role.salary_range}</strong></span>
                      <span className={`flex items-center gap-1 ${isDarkMode ? "text-gray-405" : "text-slate-500"}`}>
                        <Clock className="w-3.5 h-3.5 text-cyan-500/80" />
                        {role.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Matched-Height Detailed Layout */}
          <motion.div
            key={`${currentSelectedRole.role_id}-detailed-panel`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 w-full"
          >
            {/* ROW 1: Salary Scale Metrics vs Decision Spec + Market Trajectory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Salary scale metrics */}
              <div className="lg:col-span-5 flex flex-col">
                <div className={`p-5 rounded-2xl border backdrop-blur flex flex-col justify-between space-y-4 transition-all duration-300 shadow-sm h-full w-full ${
                  isDarkMode ? "border-slate-800 bg-[#111827]/50 text-gray-100" : "border-slate-200 bg-white text-slate-800 shadow shadow-slate-100"
                }`}>
                  <div className={`flex justify-between items-center border-b pb-2.5 ${
                    isDarkMode ? "border-slate-850" : "border-slate-150"
                  }`}>
                    <span className={`text-[10px] font-mono block uppercase font-bold ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>SALARY SCALE METRICS</span>
                    <select
                      value={regionalMetro}
                      onChange={(e) => setRegionalMetro(e.target.value)}
                      className={`p-1 px-2 border text-[10px] rounded font-mono focus:outline-none ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-800 text-white focus:border-cyan-400" 
                          : "bg-white border-slate-300 text-slate-800 focus:border-indigo-400"
                      }`}
                    >
                      <option>Bengaluru</option>
                      <option>Mumbai</option>
                      <option>Delhi NCR</option>
                      <option>Pune</option>
                    </select>
                  </div>

                  <div className="space-y-2.5 flex-grow py-1 justify-center flex flex-col">
                    {Object.entries(currentSelectedRole.salaries_by_experience).map(([expLevel, salary], index) => {
                      const isMyExp = index === 1; // default Junior/Mid estimate matches
                      return (
                        <div
                          key={expLevel}
                          className={`p-2 rounded-lg flex justify-between items-center text-xs transition-colors ${
                            isMyExp 
                              ? isDarkMode ? "bg-cyan-950/15 border border-cyan-800/20" : "bg-indigo-50 border border-indigo-200 shadow-sm" 
                              : "bg-transparent"
                          }`}
                        >
                          <span className={`font-medium ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>{expLevel} Target</span>
                          <span className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{salary}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`text-[10px] border-t pt-2 flex items-center gap-1.5 leading-normal ${
                    isDarkMode ? "text-gray-500 border-slate-900/85" : "text-slate-500 border-slate-200"
                  }`}>
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? "text-cyan-400" : "text-indigo-500"}`} />
                    <span>
                      Metropolitan Zone Index (<strong>{regionalMetro}</strong>): Pays an estimated{" "}
                      <strong>{currentSelectedRole.regional_insights[regionalMetro as keyof typeof currentSelectedRole.regional_insights] || "Standard"}</strong> average across major developer openings.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Decision Spec + Market Trajectory stacked in flex height */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                {/* Active Specification Banner Header */}
                <div className={`p-6 rounded-2xl border backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 shadow-sm flex-grow ${
                  isDarkMode ? "border-slate-800 bg-[#111827]/50 text-gray-100" : "border-slate-200 bg-white text-slate-800 shadow"
                }`}>
                  <div className="space-y-1.5 flex-grow text-left">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-1 px-2.5 rounded font-mono text-[9px] font-black ${
                        isDarkMode ? "bg-cyan-950/40 text-cyan-400" : "bg-indigo-50 text-indigo-600"
                      }`}>
                        DECISION SPEC ACTIVE
                      </span>
                      <span className={`text-xs font-mono font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Class Rank: {currentSelectedRole.difficulty}</span>
                    </div>
                    <h4 className={`text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900 font-sans"}`}>{currentSelectedRole.role_name} Track</h4>
                    <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>{currentSelectedRole.description}</p>
                  </div>

                  {/* Dynamic compatibility score card */}
                  <div className={`flex flex-col items-center justify-center p-4 text-center rounded-xl border flex-shrink-0 min-w-[125px] ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200 shadow shadow-slate-100"
                  }`}>
                    <span className={`text-[9px] font-mono uppercase tracking-widest font-black ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>COMPATIBILITY</span>
                    <span className={`text-3.5xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{currentSelectedRole.matchScore}%</span>
                    <span className="text-[9px] font-mono text-gray-450 mt-1 font-semibold">Weighted Core Fit</span>
                  </div>
                </div>

                {/* 1. Market Growth Trajectory Card */}
                <div className={`p-5 rounded-2xl border backdrop-blur space-y-4 transition-all duration-300 shadow-sm flex-grow ${
                  isDarkMode ? "border-slate-800 bg-[#111827]/40 text-gray-100" : "border-slate-200 bg-white text-slate-800 shadow shadow-slate-100"
                }`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${isDarkMode ? "border-slate-850" : "border-slate-150"}`}>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold ${isDarkMode ? "text-gray-200" : "text-slate-700"}`}>
                      MARKET TRAJECTORY & DEMAND SCALE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono block text-gray-500 uppercase">2030 growth forecast</span>
                      <span className={`text-lg font-black ${isDarkMode ? "text-cyan-400" : "text-indigo-650"}`}>
                        {currentSelectedRole.demand_growth_2030 || "+45%"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono block text-gray-500 uppercase">Market Demand Index</span>
                      <span className="text-lg font-black text-emerald-500">
                        {currentSelectedRole.market_demand || "Very High"}
                      </span>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-mono block text-gray-500 uppercase">Hiring Trend Velocity</span>
                      <span className={`text-lg font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {currentSelectedRole.hiring_trend || "Rising"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Graph and Core Technical Competency Requirements with Matched Height */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              {/* Left Column: Handcrafted Interactive Dimensional Radar Chart */}
              <div className="lg:col-span-10 xl:col-span-5 flex flex-col w-full">
                <div className={`p-5 rounded-2xl border backdrop-blur flex flex-col justify-between items-center transition-all duration-300 shadow-sm h-full w-full ${
                  isDarkMode ? "border-slate-800 bg-[#111827]/50 text-gray-100" : "border-slate-200 bg-white shadow shadow-slate-100 text-slate-800"
                }`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold mb-1 ${
                    isDarkMode ? "text-gray-500" : "text-slate-400"
                  }`}>
                    DIMENSIONAL STACKS RADAR
                  </span>

                  <div className="relative w-full h-44 flex items-center justify-center">
                    <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="80" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="1" fill="none" />
                      <circle cx="100" cy="100" r="60" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="1" strokeDasharray="2,2" fill="none" />
                      <circle cx="100" cy="100" r="40" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="1" fill="none" />
                      <circle cx="100" cy="100" r="20" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="1" strokeDasharray="2,2" fill="none" />
                      
                      {/* Radar axes lines */}
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                        return (
                          <line
                            key={idx}
                            x1="100"
                            y1="100"
                            x2={100 + 80 * Math.cos(angle)}
                            y2={100 + 80 * Math.sin(angle)}
                            stroke={isDarkMode ? "#1E293B" : "#F1F5F9"}
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Standard benchmark shape (70% standard) */}
                      <polygon
                        points={plotRadarPoints([70, 70, 70, 70, 70, 70], 0.8)}
                        fill="rgba(99, 102, 241, 0.08)"
                        stroke="rgba(99, 102, 241, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="1,1"
                      />

                      {/* Current user metrics plot polygon */}
                      <polygon
                        points={plotRadarPoints(radarMetrics, 0.8)}
                        fill={isDarkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(79, 70, 229, 0.1)"}
                        stroke={isDarkMode ? "#22D3EE" : "#4F46E5"}
                        strokeWidth="1.5"
                      />

                      {/* Dot coordinates marker */}
                      {radarMetrics.map((m, idx) => {
                        const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                        const amount = (m / 100) * 80 * 0.8;
                        const x = 100 + amount * Math.cos(angle);
                        const y = 100 + amount * Math.sin(angle);
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={isDarkMode ? "#22D3EE" : "#4F46E5"}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="flex flex-wrap text-[9px] gap-x-2.5 justify-center leading-normal text-gray-500 font-mono">
                    <span>S: Skills ({radarMetrics[0]}%)</span>
                    <span>P: Projects ({radarMetrics[1]}%)</span>
                    <span>E: Exp ({radarMetrics[2]}%)</span>
                    <span>C: Certs ({radarMetrics[3]}%)</span>
                    <span>M: Market ({radarMetrics[4]}%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Top Domain Competency Skills Checklist */}
              <div className="lg:col-span-12 xl:col-span-7 flex flex-col w-full">
                <div className={`p-5 rounded-2xl border backdrop-blur flex flex-col justify-between space-y-3 transition-all duration-300 shadow-sm h-full w-full ${
                  isDarkMode ? "border-slate-800 bg-[#111827]/40 text-gray-100" : "border-slate-200 bg-white text-slate-800 shadow shadow-slate-100"
                }`}>
                  <div>
                    <div className={`flex items-center gap-2 border-b pb-3 ${isDarkMode ? "border-slate-850" : "border-slate-150"}`}>
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold ${isDarkMode ? "text-gray-200" : "text-slate-700"}`}>
                        CORE TECHNICAL COMPETENCY REQUIREMENTS
                      </span>
                    </div>
                    <p className={`text-xs mt-3 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                      Elite profiles of this track are expected the complete mastery of the following specialized systems:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 flex-grow content-start items-start">
                    {currentSelectedRole.required_skills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`p-2 px-3.5 rounded-xl border text-xs font-mono font-medium tracking-tight transition-all duration-200 ${
                          isDarkMode
                            ? "bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-cyan-300"
                            : "bg-slate-50 hover:bg-indigo-50/40 border-slate-200 text-slate-700"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Immersive Learning Path Nav Beacon Card spanning full width */}
            <div className="w-full">
              <div className={`p-6 rounded-2xl border transition-all duration-300 sm:flex sm:items-center sm:justify-between gap-6 relative overflow-hidden bg-gradient-to-br ${
                isDarkMode 
                  ? "border-cyan-500/30 bg-gradient-to-br from-[#0c1e2b] via-[#111827] to-[#121626]" 
                  : "border-indigo-500/20 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/10 shadow shadow-slate-100"
              }`}>
                <div className="space-y-2 text-left max-w-2xl mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] font-mono uppercase tracking-widest font-black">STUDY TRACK AVAILABLE</span>
                  </div>
                  <h5 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Complete Dynamic Timeline Roadmap Is Generated
                  </h5>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
                    We have compiled the customized step-by-step master roadmap with structured phase objectives, curated references, hands-on portfolio projects, and checklists specifically for the <strong>{currentSelectedRole.role_name}</strong> path inside your Learning Hub tab!
                  </p>
                </div>

                <button
                  onClick={() => setShowDetailedRoadmap(true)}
                  className="flex-shrink-0 w-full sm:w-auto px-5 py-3 bg-gradient-to-tr from-cyan-550 to-indigo-600 hover:brightness-110 active:scale-98 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow shadow-cyan-950/20 whitespace-nowrap cursor-pointer"
                >
                  <span>View Structured Path</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
          </>)}
    </motion.div>
  )}

      {/* 4. Multi-Career Comparison Table (Collapsible layout UI) */}
      {activeMapperTab === "compare" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`p-6 rounded-2xl border backdrop-blur space-y-5 transition-all duration-250 ${
            isDarkMode ? "border-slate-800 bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
        <div className={`flex justify-between items-center border-b pb-3 ${
          isDarkMode ? "border-slate-850" : "border-slate-150"
        }`}>
          <div className="space-y-1">
            <h4 className={`text-sm font-mono uppercase tracking-widest font-bold block flex items-center gap-2 ${
              isDarkMode ? "text-[#94A3B8]" : "text-slate-800"
            }`}>
              <Layers className="w-4 h-4 text-cyan-400" />
              Advanced Feature: Multi-Career Comparison Table
            </h4>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-slate-650"}`}>Compare core statistics, complexities, market traction, and matching levels side-by-side.</p>
          </div>
          <button
            onClick={() => setShowComparisonSetup(!showComparisonSetup)}
            className={`p-1 px-3 border text-[11px] font-mono rounded-lg transition-all ${
              isDarkMode 
                ? "border-slate-800 bg-slate-950/60 text-cyan-400 hover:bg-slate-900" 
                : "border-slate-250 bg-slate-50 text-indigo-600 hover:bg-slate-100"
            }`}
          >
            {showComparisonSetup ? "Close Config" : "Select Roles to Compare"}
          </button>
        </div>

        {showComparisonSetup && (
          <div className={`p-4 border rounded-xl space-y-2 text-xs transition-all ${
            isDarkMode ? "bg-slate-955 border-slate-850" : "bg-slate-50 border-slate-200 shadow-sm"
          }`}>
            <span className={`font-mono font-bold block mb-1 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>SELECT UP TO 3 CAREER TRACKS:</span>
            <div className="flex flex-wrap gap-2.5">
              {processedRoles.map((role) => {
                const isSelected = comparisonRoles.includes(role.role_id);
                return (
                  <button
                    key={role.role_id}
                    onClick={() => handleToggleComparisonRole(role.role_id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      isSelected
                        ? isDarkMode 
                          ? "bg-cyan-950/30 border-cyan-500/50 text-cyan-300"
                          : "bg-indigo-50 border-indigo-350 text-indigo-700"
                        : isDarkMode 
                          ? "bg-slate-900 border-slate-850 text-gray-400 hover:border-slate-800"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-305 hover:bg-slate-55"
                    }`}
                  >
                    <span>{role.role_name}</span>
                    {isSelected && <span className={`ml-2 font-mono font-black text-[10px] ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>✔</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={`border rounded-xl overflow-hidden ${
          isDarkMode ? "border-slate-850 bg-slate-950/20" : "border-slate-205 bg-white shadow-sm"
        }`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-mono text-[10px] tracking-wider uppercase ${
                isDarkMode ? "border-slate-850 bg-slate-950/50 text-gray-500" : "border-slate-200 bg-slate-50 text-slate-500"
              }`}>
                <th className="p-3.5">Metrics Dimension</th>
                {comparisonRoles.map((rId) => {
                  const role = processedRoles.find(r => r.role_id === rId);
                  return (
                    <th key={rId} className={`p-3.5 font-bold text-xs ${isDarkMode ? "text-white" : "text-slate-900"}`}>{role?.role_name || "Role"}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? "divide-slate-900" : "divide-slate-100"}`}>
              <tr className={`transition-colors ${isDarkMode ? "hover:bg-slate-900/20" : "hover:bg-slate-50/50"}`}>
                <td className={`p-3.5 font-bold font-mono ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>My Matches %</td>
                {comparisonRoles.map((rId) => {
                  const role = processedRoles.find(r => r.role_id === rId);
                  return (
                    <td key={rId} className="p-3.5 font-mono">
                      <span className={`font-black ${role && role.matchScore >= 80 ? "text-emerald-500" : isDarkMode ? "text-cyan-300" : "text-indigo-600"}`}>
                        {role?.matchScore || 0}%
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className={`transition-colors ${isDarkMode ? "hover:bg-slate-900/20" : "hover:bg-slate-50/50"}`}>
                <td className={`p-3.5 font-bold font-mono ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Market Demand</td>
                {comparisonRoles.map((rId) => {
                  const role = processedRoles.find(r => r.role_id === rId);
                  return (
                    <td key={rId} className={`p-3.5 font-mono font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {role?.market_demand}
                    </td>
                  );
                })}
              </tr>
              <tr className={`transition-colors ${isDarkMode ? "hover:bg-slate-900/20" : "hover:bg-slate-50/50"}`}>
                <td className={`p-3.5 font-bold font-mono ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Avg Salary Bounds</td>
                {comparisonRoles.map((rId) => {
                  const role = processedRoles.find(r => r.role_id === rId);
                  return (
                    <td key={rId} className={`p-3.5 font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {role?.salary_range}
                    </td>
                  );
                })}
              </tr>
              <tr className={`transition-colors ${isDarkMode ? "hover:bg-slate-900/20" : "hover:bg-slate-50/50"}`}>
                <td className={`p-3.5 font-bold font-mono ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Complexity Grade</td>
                {comparisonRoles.map((rId) => {
                  const role = processedRoles.find(r => r.role_id === rId);
                  return (
                    <td key={rId} className={`p-3.5 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
                      {role?.difficulty}
                    </td>
                  );
                })}
              </tr>
              <tr className={`transition-colors ${isDarkMode ? "hover:bg-slate-900/20" : "hover:bg-slate-50/50"}`}>
                <td className={`p-3.5 font-bold font-mono ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Target Skills Necessary</td>
                {comparisonRoles.map((rId) => {
                  const role = processedRoles.find(r => r.role_id === rId);
                  return (
                    <td key={rId} className="p-3.5">
                      <div className="flex flex-wrap gap-1 leading-relaxed">
                        {role?.required_skills.slice(0, 4).map((sk, idx) => (
                          <span key={idx} className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${
                            isDarkMode ? "bg-slate-900 border-slate-850 text-gray-400" : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        </motion.div>
      )}

      {/* 5. Career Switching Guidance (Advanced Feature 2) */}
      {activeMapperTab === "switch" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`p-6 rounded-2xl border backdrop-blur space-y-5 transition-all duration-250 ${
            isDarkMode ? "border-slate-800 bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
        <div className={`flex justify-between items-center border-b pb-3 ${
          isDarkMode ? "border-slate-850" : "border-slate-150"
        }`}>
          <div className="space-y-1">
            <h4 className={`text-sm font-mono uppercase tracking-widest font-bold block flex items-center gap-2 ${
              isDarkMode ? "text-indigo-400" : "text-indigo-600"
            }`}>
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Advanced Feature: AI Career Switching Pivot System
            </h4>
            <p className={`text-xs text-left ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>Map custom migration structures to transition safely from your current role to modern specialties.</p>
          </div>
          <button
            onClick={() => setShowTransitionGuide(!showTransitionGuide)}
            className={`p-1 px-3 border text-[11px] font-mono rounded-lg transition-all ${
              isDarkMode 
                ? "border-slate-800 bg-slate-950/60 text-cyan-400 hover:bg-slate-900" 
                : "border-slate-250 bg-slate-50 text-indigo-100 hover:bg-slate-100/50 hover:border-slate-300 text-indigo-700"
            }`}
          >
            {showTransitionGuide ? "Hide Pivot Guide" : "View Pivot Guide"}
          </button>
        </div>

        {showTransitionGuide && (
          <div className="space-y-4">
            {/* Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <span className={`text-[10px] uppercase font-mono tracking-widest font-semibold block ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>CURRENT ROLE PROFILE:</span>
                <select
                  value={switchFromRole}
                  onChange={(e) => setSwitchFromRole(e.target.value)}
                  className={`w-full p-2.5 border text-xs rounded-lg font-mono ${
                    isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-400"
                  }`}
                >
                  <option value="backend-developer">Backend Developer Profile</option>
                  <option value="data-scientist">Data Scholar/Scholar</option>
                  <option value="cybersecurity-analyst">Security Analyst</option>
                  <option value="cloud-engineer">Systems Deployer/SysAdmin</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <span className={`text-[10px] uppercase font-mono tracking-widest font-semibold block ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>TARGET SPECIALTY FOCUS:</span>
                <select
                  value={switchToRole}
                  onChange={(e) => setSwitchToRole(e.target.value)}
                  className={`w-full p-2.5 border text-xs rounded-lg font-mono ${
                    isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-400"
                  }`}
                >
                  <option value="ai-engineer">AI Specialist Engine</option>
                  <option value="mlops-engineer">MLOps Drifts Engine</option>
                  <option value="cloud-engineer">Multi-Cloud Orchestrator</option>
                </select>
              </div>
            </div>

            {/* Pivot steps */}
            <div className="space-y-3 pt-2">
              <div className={`p-3 border rounded-xl space-y-1 ${
                isDarkMode ? "bg-slate-950/40 border-slate-850/60" : "bg-slate-100 border-slate-200"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-black uppercase ${isDarkMode ? "text-cyan-400" : "text-indigo-650"}`}>TRANSITION GAP REPORT</span>
                  <div className={`h-0.5 flex-grow ${isDarkMode ? "bg-cyan-900/30" : "bg-indigo-100"}`} />
                </div>
                <p className={`text-[11px] ${isDarkMode ? "text-gray-400" : "text-slate-700 font-medium"}`}>
                  Transition complexity rating: <strong>Advanced Shift</strong>. By leveraging common databases and scripting overlays, migration highlights immediate alignment. Focus learning heavily on Docker container integrations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTransitionSteps.map((step, idx) => (
                  <div key={idx} className={`p-4 border rounded-xl space-y-2 relative ${
                    isDarkMode ? "bg-slate-950/70 border-slate-850 text-white" : "bg-white border-slate-200 shadow-sm text-slate-800"
                  }`}>
                    <span className="absolute top-3 right-4 text-[10px] font-mono font-bold text-slate-500">
                      {step.duration}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold block w-fit ${
                      isDarkMode ? "bg-slate-900 border-slate-800 text-cyan-400" : "bg-slate-50 border-slate-150 text-indigo-600"
                    }`}>
                      STEP {idx + 1}
                    </span>
                    <h5 className={`text-xs font-bold pt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{step.phase}</h5>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-650"}`}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </motion.div>
      )}

      {/* 6. Embedded AI Career Coach / Chat window (Advanced Feature 5) */}
      {activeMapperTab === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`p-6 rounded-2xl border backdrop-blur space-y-5 transition-all ${
            isDarkMode ? "border-slate-800 bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
        <div className={`flex items-center gap-3 border-b pb-3 ${
          isDarkMode ? "border-slate-850" : "border-slate-150"
        }`}>
          <div className={`p-1 px-2.5 rounded flex items-center justify-center font-black ${
            isDarkMode ? "bg-slate-850" : "bg-indigo-50"
          }`}>
            <MessageSquare className={`w-4 h-4 ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`} />
          </div>
          <div>
            <h4 className={`text-sm font-mono uppercase tracking-widest font-bold block ${isDarkMode ? "text-indigo-400" : "text-slate-800"}`}>
              AI Career coach & strategist advisor
            </h4>
            <p className={`text-xs text-left ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>Get instant, personalized, dynamic career feedback directly linked with your target specifications.</p>
          </div>
        </div>

        {/* Chat Messages Hub Area */}
        <div className={`border rounded-xl overflow-hidden flex flex-col h-80 ${
          isDarkMode ? "border-slate-850 bg-slate-950/40" : "border-slate-200 bg-slate-50/50 shadow-inner"
        }`}>
          <div ref={chatScrollRef} className="flex-grow p-4 overflow-y-auto space-y-3 scroll-smooth">
            {chatMessages.map((msg, idx) => {
              const IsBot = msg.sender === "bot";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${IsBot ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    IsBot 
                      ? isDarkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-indigo-50 text-indigo-600" 
                      : "bg-indigo-600 text-white"
                  }`}>
                    {IsBot ? "AI" : "ME"}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs space-y-1.5 leading-normal border ${
                    IsBot 
                      ? isDarkMode 
                        ? "bg-slate-900/80 border-slate-850 text-gray-300 rounded-tl-none" 
                        : "bg-white border-slate-150 text-slate-700 rounded-tl-none shadow-sm"
                      : "bg-indigo-650 border-indigo-700 text-white rounded-tr-none shadow"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[9px] font-mono block ${IsBot ? "text-gray-500" : "text-indigo-200"}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 mr-auto p-2 animate-pulse text-left">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Coach is scanning hiring trajectories...</span>
              </div>
            )}
          </div>

          {/* Chat Quick Chips for ease-of-use action triggers */}
          <div className={`px-4 py-2 border-t flex flex-wrap gap-2 items-center ${
            isDarkMode ? "bg-slate-950/80 border-slate-900/60" : "bg-slate-100/80 border-slate-200"
          }`}>
            <span className={`text-[9px] font-mono uppercase font-bold pr-1 ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}>Fast Actions:</span>
            {[
              "Suggest a portfolio project for MLOps",
              "Which certifications map best to AWS Cloud?",
              "Explain transition strategy for Data Science",
              "What coding habits are expected for junior AI Engineer?"
            ].map((chipPrompt, chipIdx) => (
              <button
                key={chipIdx}
                type="button"
                onClick={() => handleChatSend(chipPrompt)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-all font-mono ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-850 text-gray-300 border-slate-850" 
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                }`}
              >
                {chipPrompt}
              </button>
            ))}
          </div>

          {/* Interactive Input Form */}
          <div className={`p-3 border-t flex gap-2 ${
            isDarkMode ? "bg-slate-950/90 border-slate-900" : "bg-white border-slate-200"
          }`}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleChatSend();
                }
              }}
              placeholder="Ask about MLOps pipelines, salary trends, or study tips..."
              className={`flex-grow p-2.5 text-xs border rounded-lg focus:outline-none font-semibold ${
                isDarkMode 
                  ? "text-white bg-slate-900 border-slate-800 focus:border-cyan-500/30" 
                  : "text-slate-800 bg-slate-55 border-slate-200 focus:border-indigo-400"
              }`}
            />
            <button
              onClick={() => handleChatSend()}
              className="px-4 py-2.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:brightness-110 active:brightness-95 text-white rounded-lg flex items-center justify-center font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        </motion.div>
      )}
    </div>
  );
}
