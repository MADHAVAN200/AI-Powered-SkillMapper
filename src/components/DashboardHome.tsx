import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  FileText,
  Cpu,
  Award,
  TrendingUp,
  ArrowRight,
  Clock,
  Star,
  AlertCircle,
  Briefcase,
  LayoutDashboard,
  BookOpen,
  LineChart,
  Terminal,
  MessageSquare,
  Compass,
  Database,
  Bookmark,
  Activity,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Zap,
  CheckCircle2,
  ListTodo
} from "lucide-react";
import { ProfileMappingResults, SkillItem } from "../types";

interface DashboardHomeProps {
  results: ProfileMappingResults | null;
  onNavigate: (tab: string) => void;
  isDarkMode?: boolean;
}

export default function DashboardHome({ results, onNavigate, isDarkMode }: DashboardHomeProps) {
  const getUserId = () => {
    try {
      const uStr = localStorage.getItem("skill_mapper_guest_user");
      if (uStr) {
        const u = JSON.parse(uStr);
        return u.id || "guest-user";
      }
    } catch (e) {}
    return "guest-user";
  };

  const userId = getUserId();

  // 1. Dynamic states fetched from localStorage for true synchronization
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTabPanel, setActiveTabPanel] = useState<"system" | "comparative" | "gaps">("system");

  // Load live, dynamic metrics on start & on state update
  useEffect(() => {
    // Completed topics count
    const completedSaved = localStorage.getItem("skill_mapper_completed_topics");
    if (completedSaved) {
      try { setCompletedTopics(JSON.parse(completedSaved)); } catch (e) {}
    }

    // Interview assessments history
    const historyKey = `skill_mapper_interviews_${userId}`;
    const historySaved = localStorage.getItem(historyKey);
    if (historySaved) {
      try { setInterviewHistory(JSON.parse(historySaved)); } catch (e) {}
    }

    // AI Mentor Memory records count
    const memoSaved = localStorage.getItem(`skill_mapper_mentor_memory_${userId}`);
    if (memoSaved) {
      try { setMemoryCount(JSON.parse(memoSaved).length); } catch (e) {}
    } else {
      setMemoryCount(2); // Fallback to seed
    }

    // Saved analytical insights
    const insightSaved = localStorage.getItem(`skill_mapper_mentor_insights_${userId}`);
    if (insightSaved) {
      try { setInsightCount(JSON.parse(insightSaved).length); } catch (e) {}
    } else {
      setInsightCount(1); // Fallback to seed
    }
  }, [userId]);

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-slate-900/50 text-indigo-500 mb-5 border border-indigo-100 dark:border-slate-800">
          <AlertCircle className="w-12 h-12 text-indigo-500 animate-pulse" />
        </div>
        <h3 className={`text-xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          No Active Mapping File Found
        </h3>
        <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-slate-600"} max-w-md mt-2 leading-relaxed`}>
          Please complete the initial launchpad portfolio onboard mapping, or seed a simulated sandbox profile context to visualize telemetry reports dynamically.
        </p>
        <button
          onClick={() => onNavigate("landing")}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-indigo-550/25 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Return to Launchpad</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const { skills, skillGaps, careerPaths, resumeAnalysis, learningRoadmap } = results;

  // 2. Compute dynamic scores and telemetry
  const totalSkillsCount = skills?.length || 0;
  const highPriorityGaps = skillGaps?.filter((g) => g.priority === "High") || [];
  const mediumPriorityGaps = skillGaps?.filter((g) => g.priority === "Medium") || [];
  const primaryCareerTarget = careerPaths?.[0] || { title: "Target Specialist", matchScore: 80, salaryRange: "$120,000 - $160,000", marketDemand: "High" };

  // Calculate dynamic average readiness index
  // Component scores are: ATS resume score (35%), skills coverage (35%), target career match (30%)
  const calculatedReadinessIndex = Math.round(
    (resumeAnalysis.atsScore || 75) * 0.35 +
    Math.min(100, (totalSkillsCount / (totalSkillsCount + skillGaps?.length || 5)) * 100) * 0.35 +
    (primaryCareerTarget.matchScore || 80) * 0.30
  );

  // Completed content percentages
  const totalRoadmapTopicsCount = learningRoadmap?.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0) || 12;
  const completedTopicsCount = completedTopics.length;
  const dynamicLearningProgressPercent = Math.min(
    100,
    Math.round((completedTopicsCount / totalRoadmapTopicsCount) * 100)
  );

  // Latest mock interview evaluation
  const latestInterview = interviewHistory?.[0] || null;
  const latestMockScore = latestInterview?.evaluation?.overallReadiness || latestInterview?.score || null;

  // Categories Distribution for SVG visual matrix
  const categoryCounts = skills?.reduce((acc: Record<string, number>, s: SkillItem) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const maxCategoryCount = Math.max(...Object.values(categoryCounts || { Other: 1 }));

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* 1. Header Hero Panel (Control Hub Banner) */}
      <div className={`relative p-6 rounded-2xl border backdrop-blur overflow-hidden ${
        isDarkMode 
          ? "border-slate-800 bg-[#111827]/40" 
          : "border-slate-200 bg-white shadow-sm text-slate-900"
      }`}>
        <div className="absolute top-0 right-0 p-12 bg-gradient-to-bl from-indigo-500/5 via-transparent to-transparent rounded-full blur-2xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${
              isDarkMode ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/40" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
            }`}>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>DYNAMIC CENTRAL CO-ORDINATOR ACTIVE</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Targeting: <span className={isDarkMode ? "text-indigo-400" : "text-indigo-600"}>{primaryCareerTarget.title}</span>
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
              Telemetry sensors analyze active skill portfolios, ATS keyword profiles, interview readiness metrics, and dynamic learning milestones to compile real-time compatibility algorithms.
            </p>
          </div>

          <div className={`px-5 py-4 rounded-xl border flex items-center gap-4 shrink-0 ${
            isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="relative flex items-center justify-center">
              {/* SVG Ring for calculated overall readiness score */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" strokeLinecap="round" strokeWidth="6" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} fill="transparent" />
                <circle cx="32" cy="32" r="28" strokeLinecap="round" strokeWidth="6" 
                  stroke={calculatedReadinessIndex >= 80 ? "#10b981" : calculatedReadinessIndex >= 65 ? "#f59e0b" : "#ef4444"} 
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - calculatedReadinessIndex / 100)}
                  fill="transparent" 
                />
              </svg>
              <div className="absolute font-mono text-sm font-black text-white flex flex-col items-center">
                <span className={isDarkMode ? "text-white" : "text-slate-900"}>{calculatedReadinessIndex}%</span>
              </div>
            </div>

            <div className="text-left">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${isDarkMode ? "text-gray-550" : "text-slate-400"}`}>
                READINESS SCORE
              </span>
              <span className="text-xs text-emerald-400 font-bold block">
                {calculatedReadinessIndex >= 85 ? "Deploy-Ready Status" : calculatedReadinessIndex >= 70 ? "Pipeline Warming" : "Deficits Outlined"}
              </span>
              <span className="text-[10px] text-gray-500 block">Combined telemetry weights</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric A: Validated Skills */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-250 shadow-sm"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">VALIDATED SKILLS</span>
            <span className={`p-1.5 rounded-lg ${isDarkMode ? "bg-cyan-950/30 text-cyan-400" : "bg-cyan-50 text-cyan-700"}`}><Cpu className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h4 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{totalSkillsCount}</h4>
            <p className="text-[10px] text-gray-550 mt-1">Acquired & validated topics</p>
          </div>
        </div>

        {/* Metric B: ATS Score Rating */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-250 shadow-sm"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">ATS MATCH SCORE</span>
            <span className={`p-1.5 rounded-lg ${isDarkMode ? "bg-indigo-950/30 text-indigo-400" : "bg-indigo-50 text-indigo-700"}`}><FileText className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h4 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{resumeAnalysis.atsScore}%</h4>
            <p className="text-[10px] text-gray-550 mt-1">Formatting rate: {resumeAnalysis.formattingScore}%</p>
          </div>
        </div>

        {/* Metric C: Active Studies Roadmaps */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-250 shadow-sm"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">STUDY TIMELINE</span>
            <span className={`p-1.5 rounded-lg ${isDarkMode ? "bg-violet-950/30 text-violet-400" : "bg-violet-50 text-violet-750"}`}><BookOpen className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h4 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>{dynamicLearningProgressPercent}%</h4>
            <p className="text-[10px] text-gray-550 mt-1">{completedTopicsCount} of {totalRoadmapTopicsCount} topics saved</p>
          </div>
        </div>

        {/* Metric D: Interview Readiness Score */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-250 shadow-sm"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">MOCK EVALUATIONS</span>
            <span className={`p-1.5 rounded-lg ${isDarkMode ? "bg-emerald-950/30 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}><Award className="w-3.5 h-3.5" /></span>
          </div>
          <div className="mt-3">
            <h4 className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {latestMockScore ? `${latestMockScore}%` : "Inact."}
            </h4>
            <p className="text-[10px] text-gray-550 mt-1">
              {interviewHistory.length > 0 ? `${interviewHistory.length} mock attempts parsed` : "No sessions conducted yet"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Core Redesigned Interactive Integration Panels (The 8 Pillars Dashboard Grid) */}
      <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest pt-2">
        Core System Intelligence Modules
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Resume Scorer Hub card */}
        <div
          onMouseEnter={() => setHoveredCard("resume")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] relative ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-indigo-950/40 text-indigo-400 border-indigo-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 1 • Resume
              </span>
              <FileText className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Resume Intelligence Opt.</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Analyze ATS format completeness, score key density, and identify critical missing trigger phrases.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white font-mono">{resumeAnalysis.atsScore}%</span>
                <span className="text-[10px] text-gray-550 font-mono">ATS Fit Score</span>
              </div>
              <p className="text-[10px] text-amber-400/90 font-mono truncate mt-1">
                ⚠️ Need word rewrite: {resumeAnalysis.improvements?.[0] || "Target industry keywords list"}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("resume")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-cyan-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-cyan-500/25 cursor-pointer block text-left"
          >
            <span>Scan & Edit Raw Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: Technical Skill Analytics card */}
        <div
          onMouseEnter={() => setHoveredCard("skills")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-cyan-950/40 text-cyan-400 border-cyan-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 2 • Skill Matrix
              </span>
              <Cpu className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Tech Skill Analyzer</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Review verified technical competencies across categories like AI/ML, Programming, and Database design.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-gray-550 block uppercase">VERIFIED</span>
                <span className="text-sm font-extrabold text-white font-mono">{totalSkillsCount} Tools</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-gray-550 block uppercase">ACTIVE GAPS</span>
                <span className="text-sm font-extrabold text-red-400 font-mono">{skillGaps?.length || 0} Topics</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("skills")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-cyan-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-cyan-500/25 cursor-pointer block text-left"
          >
            <span>Audit Technical Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: Career Mapping Engine */}
        <div
          onMouseEnter={() => setHoveredCard("career")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-violet-950/40 text-violet-400 border-violet-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 3 • Career Map
              </span>
              <Compass className="w-4 h-4 text-violet-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Career Compatibility Hub</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Examine role similarity factors and salary ranges configured according to industrial specifications.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-850/50 mt-1">
              <span className="text-[10px] text-gray-400 truncate max-w-[150px] font-mono leading-none">
                🎯 {primaryCareerTarget.title}
              </span>
              <span className="text-[10px] font-mono bg-violet-950/35 text-violet-400 px-1.5 py-0.5 rounded leading-none shrink-0 font-extrabold uppercase ring-1 ring-violet-850">
                Fit: {primaryCareerTarget.matchScore}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("career")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-violet-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-violet-500/25 cursor-pointer block text-left"
          >
            <span>Compare Roles & Paths</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 4: Learning Roadmaps & Milestones card */}
        <div
          onMouseEnter={() => setHoveredCard("roadmaps")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-amber-950/40 text-amber-400 border-amber-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 4 • Roadmaps
              </span>
              <BookOpen className="w-4 h-4 text-amber-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Adaptive Learning Milestones</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Track self-study sequences, check off topics, and review step-by-step capstone building templates.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                <span>Progress: {dynamicLearningProgressPercent}% Completed</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${dynamicLearningProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("learning")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-amber-500/25 cursor-pointer block text-left"
          >
            <span>Learn & View Lessons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 5: Market Intelligence info card */}
        <div
          onMouseEnter={() => setHoveredCard("trends")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-rose-950/40 text-rose-400 border-rose-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 5 • Market
              </span>
              <LineChart className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Market Intel & Demand</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Review regional employment hotspots, real aggregate salaries, and emerging tech growth velocity metrics.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[9px] font-mono bg-rose-950/30 text-rose-300 px-2 py-0.5 rounded border border-rose-900/32">
                GenAI: Active Growth
              </span>
              <span className="text-[9px] font-mono bg-rose-950/30 text-rose-300 px-2 py-0.5 rounded border border-rose-900/32">
                Hiring: Strong
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("trends")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-rose-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-rose-500/25 cursor-pointer block text-left"
          >
            <span>Inspect Industry Metrics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 6: Interview Prep & Mock simulator card */}
        <div
          onMouseEnter={() => setHoveredCard("interview")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 6 • Interview
              </span>
              <Terminal className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Active Mock Assessment</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Participate in Gemini-powered technical mock interviews containing system scoring reports and verbal speech analysis.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2 text-[10px] text-gray-400 font-mono">
              {latestInterview ? (
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Latest scoring index: {latestMockScore}%</span>
                </div>
              ) : (
                <span className="text-gray-500">No telemetry parsed yet</span>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate("interview")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-emerald-500/25 cursor-pointer block text-left"
          >
            <span>Trigger Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 7: AI Career Mentor Hub */}
        <div
          onMouseEnter={() => setHoveredCard("mentor")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-teal-950/40 text-teal-400 border-teal-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 7 • AI Advisor
              </span>
              <MessageSquare className="w-4 h-4 text-teal-400 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Intel Career Mentor</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Converse with a smart advisor synchronized with live database parameters, memory registers, and sandbox insights.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2 flex items-center gap-2.5">
              <div className="text-[10px] text-gray-450 font-mono">
                🧠 Context: <span className="text-teal-400">{memoryCount} Memories</span>
              </div>
              <div className="text-[10px] text-gray-450 font-mono">
                📂 Vault: <span className="text-teal-400">{insightCount} Cards</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("mentor")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-teal-400 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-teal-500/25 cursor-pointer block text-left"
          >
            <span>Open Mentorship Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 8: Onboarding Settings Launcher */}
        <div
          onMouseEnter={() => setHoveredCard("onboarding")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group min-h-[250px] ${
            isDarkMode 
              ? "bg-[#111827]/40 border-slate-800 hover:border-cyan-500/35" 
              : "bg-white border-slate-200 hover:border-indigo-500/35 shadow-sm"
          }`}
        >
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border ${
                isDarkMode ? "bg-slate-950/40 text-gray-400 border-gray-800" : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                Pillar 8 • Launchpad Settings
              </span>
              <Activity className="w-4 h-4 text-gray-450 transition-transform group-hover:scale-110" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Onboard Profile Context</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Refresh database caches, upload a brand new resume document, or alter targeted goal specifications.
              </p>
            </div>

            {/* Dynamic content */}
            <div className="pt-2 text-[10px] text-gray-400 font-mono">
              <span>Status: Synchronized Live</span>
              <div className="flex items-center gap-1 mt-0.5 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Sandbox secure session</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("landing")}
            className="w-full mt-4 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-gray-400 hover:text-white rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer block text-left"
          >
            <span>Re-launch Profile Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Comparative Analysis and Gaps Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Comparative Career Affinity Matches graph */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          isDarkMode ? "bg-[#111827]/40 border-slate-800" : "bg-white border-slate-250 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h3 className={`text-base font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>Target Career Affinity Comparison</h3>
              <p className="text-gray-400 text-xs">Dynamic alignment percentage computed across matching career choices.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {careerPaths?.map((path, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span className={`font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{path.title}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-gray-500 text-[10px]">{path.salaryRange}</span>
                    <span className={`font-extrabold ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>{path.matchScore}%</span>
                  </div>
                </div>
                {/* Responsive SVG bar */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden relative border border-gray-850">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${path.matchScore}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      idx === 0 
                        ? "from-indigo-500 to-cyan-450" 
                        : "from-purple-600 to-indigo-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Gaps Advisory Block */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? "bg-[#111827]/40 border-slate-800" : "bg-white border-slate-250 shadow-sm"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-5 h-5 text-amber-400 shrink-0" />
            <h4 className={`font-black text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>Priority Deficit Alert</h4>
          </div>

          <div className="space-y-3.5">
            {highPriorityGaps.length > 0 ? (
              highPriorityGaps.slice(0, 3).map((gap, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl space-y-1 text-left border border-red-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 font-mono text-left">{gap.skillName}</span>
                    <span className="text-[9px] font-mono text-red-400 uppercase font-black bg-red-950/40 px-1 py-0.5 rounded">High Priority</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{gap.whyNeeded}</p>
                </div>
              ))
            ) : mediumPriorityGaps.length > 0 ? (
              mediumPriorityGaps.slice(0, 3).map((gap, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl space-y-1 text-left border border-amber-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono text-left">{gap.skillName}</span>
                    <span className="text-[9px] font-mono text-amber-400 uppercase font-bold bg-amber-950/40 px-1 py-0.5 rounded">Medium Priority</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{gap.whyNeeded}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 font-mono italic border border-dashed border-slate-800 rounded-xl">
                No active gaps flagged. Your career readiness scores are outstanding!
              </div>
            )}
          </div>

          {skillGaps && skillGaps.length > 3 && (
            <button
              onClick={() => onNavigate("skills")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold tracking-wide text-center w-full block mt-3"
            >
              Examine All {skillGaps.length} Skill Gaps ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
