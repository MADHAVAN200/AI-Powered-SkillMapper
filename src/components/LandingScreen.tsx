import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Terminal, FileText, Cpu, Compass, BookOpen, LineChart, MessageSquare, Briefcase, ChevronRight, Play, Sun, Moon, Database } from "lucide-react";
import { ProfileMappingResults } from "../types";
import { supabase } from "../lib/supabase";

interface LandingScreenProps {
  onStartOnboarding: () => void;
  onLoadDemo: (presetType: "student" | "switcher" | "fresher") => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function LandingScreen({ onStartOnboarding, onLoadDemo, isDarkMode, onToggleTheme }: LandingScreenProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
      } else {
        const guestUserJson = localStorage.getItem("skill_mapper_guest_user");
        if (guestUserJson) {
          setSupabaseUser(JSON.parse(guestUserJson));
        } else {
          setSupabaseUser(null);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
      } else {
        const guestUserJson = localStorage.getItem("skill_mapper_guest_user");
        if (guestUserJson) {
          setSupabaseUser(JSON.parse(guestUserJson));
        } else {
          setSupabaseUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-cyan-500" />,
      title: "Resume Intelligence",
      description: "Comprehensive ATS analysis. Deep-scans text structure to extract strengths and optimize missing key-terms."
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
      title: "Skill Competency Mapping",
      description: "Identifies precise coding capability tiers. Visualizes strengths and localizes technical knowledge gaps instantly."
    },
    {
      icon: <Compass className="w-6 h-6 text-emerald-500" />,
      title: "Career Path Recommendations",
      description: "Matches user profiles with actual market-demand expectations. Displays real salary insights and role demands."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-sky-550" />,
      title: "Adaptive Roadmaps",
      description: "Generates tailored study plans, project suggestions, and platforms-integrated certifications lists."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-rose-500" />,
      title: "AI Mentor Guidance",
      description: "Interactive conversation agent assisting with study plan generation, code optimization and career advice."
    },
    {
      icon: <LineChart className="w-6 h-6 text-amber-500" />,
      title: "Market Tech Analytics",
      description: "Aggregates tech industry trends and emerging titles like RAG, Generative AI or Cloud GPU Architectures."
    }
  ];

  return (
    <div id="landing-root" className={`min-h-screen flex flex-col justify-between overflow-x-hidden relative transition-colors duration-300 ${
      isDarkMode ? "bg-[#0D1117] text-[#C9D1D9] theme-dark" : "bg-[#F8FAFC] text-slate-800 theme-light"
    }`}>
      {/* Background Neon Gradients */}
      {isDarkMode ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-950/20 rounded-full blur-[150px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50/60 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-50/50 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Top Header */}
      <header className={`border-b sticky top-0 z-50 px-6 py-4 backdrop-blur-xl transition-colors duration-300 ${
        isDarkMode ? "border-slate-800/80 bg-slate-950/40" : "border-slate-200 bg-white/75"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg shadow-lg shadow-cyan-500/10">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight bg-gradient-to-r ${
                isDarkMode ? "from-cyan-400 via-purple-300 to-indigo-200" : "from-cyan-600 via-purple-650 to-indigo-850"
              } bg-clip-text text-transparent`}>
                Skill Mapper
              </h1>
              <p className="text-[10px] font-mono tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">AI-Powered Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title="Toggle Light/Dark Theme"
              className={`p-2 rounded-lg transition-colors duration-155 ${
                isDarkMode ? "hover:bg-slate-800 text-amber-400" : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {supabaseUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-indigo-500/20 bg-indigo-950/20 text-indigo-400 font-mono text-[10px] rounded-lg tracking-tight">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-0.5" />
                <span className="hidden sm:inline">Active:</span>
                <span className="font-semibold text-white max-w-[120px] truncate">
                  {supabaseUser.guest
                    ? (supabaseUser.raw_user_meta_data?.name || "GUEST")
                    : supabaseUser.email?.endsWith("@skillmapper.local")
                      ? supabaseUser.email.split("@")[0].toUpperCase()
                      : supabaseUser.email}
                </span>
              </div>
            ) : (
              <button
                onClick={() => onLoadDemo("student")}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-gray-800"
                    : "text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-slate-205"
                }`}
              >
                Interactive Demo
              </button>
            )}
            <button
              onClick={onStartOnboarding}
              id="get-started-top-btn"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {supabaseUser ? "Launch Map" : "Get Started"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow flex flex-col items-center justify-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          {/* Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            isDarkMode ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300" : "bg-cyan-50 border border-cyan-200 text-cyan-700"
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-550 dark:text-cyan-400 animate-pulse" />
            <span>Next-Gen Career Intelligence Platform</span>
          </div>

          {/* Heading */}
          <h2 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight transition-colors ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}>
            Map Your Skills. <br />
            <span className="bg-gradient-to-r from-cyan-550 via-blue-550 to-purple-650 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
              Build Your Career with AI.
            </span>
          </h2>

          <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed transition-colors ${
            isDarkMode ? "text-gray-400" : "text-slate-600"
          }`}>
            The AI-Powered Skill Mapper analyses your coding repositories, parses your resume for ATS optimization, identifies market-demand gaps, and maps customized learning roadmaps for modern job ecosystems.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <button
              onClick={onStartOnboarding}
              id="start-onboard-btn"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold shadow-xl shadow-purple-900/20 hover:shadow-cyan-500/10 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Build Real Profile</span>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
            <div className="relative group w-full sm:w-auto">
              {/* Dropdown presets */}
              <button
                className={`w-full sm:w-auto px-8 py-4 border rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? "bg-[#111827]/80 backdrop-blur border-slate-850 text-gray-200 hover:text-white hover:bg-[#1f2937]"
                    : "bg-white border-slate-205 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Play className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Try Preset Sandbox</span>
              </button>
              <div className={`absolute top-full left-0 right-0 mt-2 border rounded-xl overflow-hidden hidden group-hover:block transition-all shadow-2xl z-20 ${
                isDarkMode ? "bg-slate-900/95 border-gray-800" : "bg-white border-slate-200"
              }`}>
                <button
                  onClick={() => onLoadDemo("student")}
                  className={`w-full text-left px-4 py-3 text-xs transition-colors border-b ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-cyan-950/30 hover:text-cyan-400 border-gray-800/50"
                      : "text-slate-750 hover:bg-slate-50 hover:text-cyan-700 border-slate-100"
                  }`}
                >
                  🎓 CS Sophomore Presets (AI Switcher)
                </button>
                <button
                  onClick={() => onLoadDemo("fresher")}
                  className={`w-full text-left px-4 py-3 text-xs transition-colors border-b ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-cyan-950/30 hover:text-cyan-400 border-gray-800/50"
                      : "text-slate-750 hover:bg-slate-50 hover:text-cyan-700 border-slate-100"
                  }`}
                >
                  💻 Web Developer Presets (Junior Full Stack)
                </button>
                <button
                  onClick={() => onLoadDemo("switcher")}
                  className={`w-full text-left px-4 py-3 text-xs transition-colors ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-cyan-950/30 hover:text-cyan-400"
                      : "text-slate-750 hover:bg-slate-50 hover:text-cyan-700"
                  }`}
                >
                  🔄 Career Switcher Presets (to Data Science)
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Animated Glass Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className={`mt-16 w-full max-w-5xl rounded-2xl border p-2 shadow-2xl relative overflow-hidden group transition-colors duration-300 ${
            isDarkMode ? "border-slate-800 bg-slate-950/75" : "border-slate-205 bg-white shadow-lg"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-600/5 opacity-100 transition-opacity pointer-events-none" />
          {/* Mock Window bar */}
          <div className={`flex items-center justify-between px-4 py-2.5 border-b transition-colors duration-300 ${
            isDarkMode ? "border-slate-800 bg-slate-950/90" : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-gray-500">skill-mapper-dashboard.ai</span>
            <div className="w-10" />
          </div>

          <div className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left transition-colors duration-300 ${isDarkMode ? "bg-slate-900/40" : "bg-slate-50/20"}`}>
            {/* Widget 1 */}
            <div className={`p-4 rounded-xl border relative transition-colors duration-300 ${isDarkMode ? "border-slate-850 bg-[#111827]/80" : "border-slate-200 bg-white"}`}>
              <div className="absolute top-4 right-4 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-100 dark:bg-cyan-950/30 px-2 py-0.5 rounded">
                ATS Pass
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">RESUME SCORE</p>
              <h4 className={`text-3xl font-extrabold mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>84%</h4>
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-cyan-500 h-full w-[84%] rounded-full shadow-lg shadow-cyan-450/50" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-2">
                🌟 Missing: <span className="text-cyan-600 dark:text-cyan-300 font-medium">Terraform, Core AWS</span>
              </p>
            </div>
            
            {/* Widget 2 */}
            <div className={`p-4 rounded-xl border relative transition-colors duration-300 ${isDarkMode ? "border-slate-850 bg-[#111827]/80" : "border-slate-200 bg-white"}`}>
              <div className="absolute top-4 right-4 text-xs font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-950/30 px-2 py-0.5 rounded">
                High Demand
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">CAREER STRENGTH MATCH</p>
              <h4 className={`text-3xl font-extrabold mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>AI Architect</h4>
              <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-300 mt-2">
                <span>Compatibility: </span>
                <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-905"}`}>91%</span>
              </div>
            </div>

            {/* Widget 3 */}
            <div className={`p-4 rounded-xl border transition-colors duration-300 ${isDarkMode ? "border-slate-850 bg-[#111827]/80" : "border-slate-200 bg-white"}`}>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">DAILY ROADMAP TIMELINE</p>
              <h4 className={`text-lg font-bold mt-2 ${isDarkMode ? "text-white" : "text-slate-905"}`}>Phase 1: Advanced APIs</h4>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                <span>Streak Track</span>
                <span className="text-emerald-500 font-mono font-bold">14 Days 🔥</span>
              </div>
              <div className="mt-2 text-[10px] font-mono p-1.5 rounded text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-800/80 bg-slate-50 dark:bg-slate-950/60">
                ➔ Recommend DeepLearning Course (Andrew Ng)
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Capabilities Matrix */}
        <section className="mt-24 w-full">
          <div className="text-center space-y-3 mb-12">
            <h3 className={`text-2xl md:text-4xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              End-To-End Core Modules
            </h3>
            <p className={`text-sm md:text-base max-w-xl mx-auto ${isDarkMode ? "text-gray-400" : "text-slate-650"}`}>
              Your predictive analytics model built to evaluate, expand, and structure your engineering journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  isDarkMode
                    ? "bg-slate-900/40 border-slate-850"
                    : "bg-white border-slate-200 shadow-sm"
                } ${
                  hoveredFeature === index
                    ? "border-cyan-500/40 shadow-xl dark:shadow-cyan-950/20 translate-y-[-4px]"
                    : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className={`p-3 rounded-xl border w-fit mb-4 transition-colors duration-300 ${
                  isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  {feat.icon}
                </div>
                <h4 className={`text-lg font-bold mb-2 transition-colors ${
                  isDarkMode ? "text-white group-hover:text-cyan-400" : "text-slate-900 group-hover:text-cyan-600"
                }`}>
                  {feat.title}
                </h4>
                <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 px-6 text-center text-xs relative z-10 transition-colors duration-300 ${
        isDarkMode ? "border-slate-900 bg-slate-950/40 text-gray-500" : "border-slate-200 bg-white text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}>AI Powered Skill Mapper</span>
          </div>
          <p>© 2026 AI-SaaS Platform. Powered by Google Gemini AI & Adaptive Roadmaps.</p>
        </div>
      </footer>
    </div>
  );
}
