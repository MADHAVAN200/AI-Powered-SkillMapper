import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Terminal, FileText, Cpu, Compass, BookOpen, LineChart, 
  MessageSquare, Briefcase, ChevronRight, Sun, Moon, Database, X,
  Check, AlertTriangle, Copy, ChevronDown, ChevronUp, Layers, Award,
  ArrowRight, FileCode, RefreshCw, HelpCircle
} from "lucide-react";
import { supabase } from "../lib/supabase";
import SupabaseAuthView from "./SupabaseAuthView";

interface LandingScreenProps {
  onStartOnboarding: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userProfile: any;
  results: any;
  onUpdateSession: (profile: any, results: any) => void;
  onLoginAsGuest: (username: string) => void;
  onLogoutGuest: () => void;
  onNewUser: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LandingScreen({ 
  onStartOnboarding, 
  isDarkMode, 
  onToggleTheme, 
  userProfile, 
  results, 
  onUpdateSession, 
  onLoginAsGuest, 
  onLogoutGuest, 
  onNewUser,
  onLoginSuccess
}: LandingScreenProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Expanded Landing Page states
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"resume" | "skills" | "roadmaps" | "mentor">("resume");
  const [initialAuthCredentials, setInitialAuthCredentials] = useState<{username: string; password: string} | null>(null);

  // Resume interactive simulator state
  const [resumeText, setResumeText] = useState(
    "EXPERIENCE:\nFull-Stack Developer | 2 Years\n- Built web applications using React, Node.js, and Express.\n- Managed SQL databases and deployed microservices on AWS.\n\nOBJECTIVE:\nSeeking a transition to an AI Architect role to design large-scale RAG systems and deploy LLMs."
  );
  const [resumeScore, setResumeScore] = useState(74);
  const [isOptimizingResume, setIsOptimizingResume] = useState(false);
  const [resumeOptimized, setResumeOptimized] = useState(false);

  // AI Mentor Chat interactive simulator state
  const [chatMessages, setChatMessages] = useState<Array<{sender: "user" | "ai"; text: string; code?: string}>>([
    {
      sender: "ai",
      text: "👋 Hi! I am your AI Career Mentor. I have evaluated your skill gaps for 'AI Architect'. How can I help you accelerate your learning today?"
    }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // FAQs active index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Roadmap selected sub-topic description
  const [selectedRoadmapSubTopic, setSelectedRoadmapSubTopic] = useState<{title: string; resource: string; desc: string} | null>({
    title: "Vector Embeddings",
    resource: "OpenAI Embedding Guide & Cosine Math",
    desc: "Learn how texts are converted into high-dimensional numerical vectors. Master distance calculations (Cosine, Euclidean) for semantic search."
  });

  const handleChatOption = (optionText: string) => {
    if (isChatTyping) return;
    
    // Add user message
    const updatedMessages = [...chatMessages, { sender: "user" as const, text: optionText }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      let aiText = "";
      let aiCode = "";

      if (optionText.includes("Vector DBs")) {
        aiText = "To learn Vector DBs, focus on understanding indexing algorithms like HNSW (Hierarchical Navigable Small World) and IVFFlat. Start by using Qdrant or Pinecone locally, and practice indexing text chunks with embeddings from SentenceTransformers.";
        aiCode = "# Example connection & query using Pinecone client\nfrom pinecone import Pinecone\n\npc = Pinecone(api_key=\"YOUR_API_KEY\")\nindex = pc.Index(\"skills-cache\")\n\n# Query the vector database\nresults = index.query(\n    vector=[0.12, 0.45, -0.08, ...], \n    top_k=3,\n    include_metadata=True\n)";
      } else if (optionText.includes("Python mock")) {
        aiText = "Here is a common advanced interview question for AI/ML roles:\n\n**Q: What is the difference between `__init__` and `__new__` in Python classes?**\n\n*   `__new__` is the actual creator of the instance (a static method that returns a new instance of the class).\n*   `__init__` is the initializer (receives the created instance and sets up attributes).\n\nTypically, you only override `__new__` when subclassing immutable types (like `str` or `int`), or implementing a Singleton pattern.";
        aiCode = "# Singleton Pattern using __new__\nclass AIServiceLocator:\n    _instance = None\n    \n    def __new__(cls, *args, **kwargs):\n        if not cls._instance:\n            cls._instance = super().__new__(cls)\n        return cls._instance";
      } else if (optionText.includes("micro-project")) {
        aiText = "Here is a great micro-project: **'DocuChat Mini'**\n\n1. Use Python and PyPDF to parse a local PDF manual.\n2. Split it into 500-character chunks with a 50-character overlap.\n3. Embed the chunks using `sentence-transformers/all-MiniLM-L6-v2`.\n4. Save them in a local SQLite database using the sqlite-vss vector extension.\n5. Build a simple CLI where you query the doc, retrieve the top 2 chunks, and feed them into Gemini 1.5 Flash to get answers.";
      }

      setChatMessages(prev => [...prev, { sender: "ai" as const, text: aiText, code: aiCode }]);
      setIsChatTyping(false);
    }, 1200);
  };

  const handleOptimizeResume = () => {
    if (resumeOptimized) return;
    setIsOptimizingResume(true);
    setTimeout(() => {
      setResumeText(prev => 
        prev + "\n\n[AI OPTIMIZED KEYWORDS ADDED]:\n- PyTorch, Tensor Operations, RAG Orchestration, Vector Databases (Qdrant, Pinecone), LangChain Agents."
      );
      setResumeScore(96);
      setIsOptimizingResume(false);
      setResumeOptimized(true);
    }, 1500);
  };

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

  const handleStartClick = () => {
    if (supabaseUser && !supabaseUser.guest && supabaseUser.id !== "guest-user") {
      onStartOnboarding();
    } else {
      setShowAuthModal(true);
    }
  };

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
            ) : null}
            <button
              onClick={handleStartClick}
              id="get-started-top-btn"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {supabaseUser && !supabaseUser.guest && supabaseUser.id !== "guest-user" ? "Launch Map" : "Get Started"}
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
              onClick={handleStartClick}
              id="start-onboard-btn"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold shadow-xl shadow-purple-900/20 hover:shadow-cyan-500/10 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Build My Skill Map</span>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
            <a
              href="#features"
              className={`w-full sm:w-auto px-8 py-4 border rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isDarkMode
                  ? "bg-[#111827]/80 backdrop-blur border-slate-850 text-gray-200 hover:text-white hover:bg-[#1f2937]"
                  : "bg-white border-slate-205 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Briefcase className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>See How It Works</span>
            </a>
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
        <section id="features" className="mt-24 w-full">
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

        {/* Interactive Capability Deep-Dive */}
        <section id="capabilities-deepdive" className="mt-24 w-full text-left max-w-5xl">
          <div className="text-center space-y-3 mb-12">
            <h3 className={`text-2xl md:text-4xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Platform Deep-Dive & Sandbox Simulator
            </h3>
            <p className={`text-sm md:text-base max-w-xl mx-auto ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
              Experience the core analytical capabilities of the platform right here before logging in.
            </p>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-xl transition-all duration-305 ${
            isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
          }`}>
            {/* Tabs Header */}
            <div className={`flex flex-wrap border-b transition-colors duration-300 ${
              isDarkMode ? "border-slate-800 bg-slate-950/80" : "bg-slate-50 border-slate-200"
            }`}>
              <button
                onClick={() => setActiveShowcaseTab("resume")}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeShowcaseTab === "resume"
                    ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white/5"
                    : "border-transparent text-slate-555 hover:text-slate-700 dark:hover:text-gray-300"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. Resume Optimizer</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab("skills")}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeShowcaseTab === "skills"
                    ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-white/5"
                    : "border-transparent text-slate-555 hover:text-slate-700 dark:hover:text-gray-300"
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>2. Skill Gap Mapping</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab("roadmaps")}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeShowcaseTab === "roadmaps"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white/5"
                    : "border-transparent text-slate-555 hover:text-slate-700 dark:hover:text-gray-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>3. Adaptive Syllabus</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab("mentor")}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeShowcaseTab === "mentor"
                    ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-white/5"
                    : "border-transparent text-slate-555 hover:text-slate-700 dark:hover:text-gray-300"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>4. AI Mentor Chat</span>
              </button>
            </div>

            {/* Tab content wrapper */}
            <div className="p-6 md:p-8">
              {/* Tab 1: Resume Simulator */}
              {activeShowcaseTab === "resume" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-mono font-bold text-slate-400/90 tracking-wider">RAW RESUME TEXT</span>
                      <span className="text-[10px] font-mono text-gray-500">Edit content below to test</span>
                    </div>
                    <div className={`flex-grow border rounded-xl overflow-hidden flex flex-col ${
                      isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-205"
                    }`}>
                      {/* Fake code header */}
                      <div className={`px-4 py-2 border-b text-[11px] font-mono flex items-center gap-2 ${
                        isDarkMode ? "border-slate-850 bg-slate-900/60 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}>
                        <FileCode className="w-3.5 h-3.5 text-cyan-500" />
                        <span>resume_candidate_v1.txt</span>
                      </div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => {
                          setResumeText(e.target.value);
                          if (resumeOptimized) {
                            setResumeOptimized(false);
                            setResumeScore(74);
                          }
                        }}
                        disabled={isOptimizingResume}
                        className={`w-full p-4 flex-grow font-mono text-xs focus:outline-none resize-none min-h-[220px] ${
                          isDarkMode ? "bg-slate-950/80 text-[#C9D1D9]" : "bg-white text-slate-800"
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-6 border rounded-xl flex flex-col justify-between ${
                    isDarkMode ? "bg-[#111827]/80 border-slate-850" : "bg-slate-50/50 border-slate-200"
                  }`}>
                    <div className="space-y-4">
                      <h4 className={`text-base font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        ATS Evaluation Panel
                      </h4>

                      <div className="flex items-center gap-5">
                        {/* Radial progress ring */}
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className={`${isDarkMode ? "text-slate-800" : "text-slate-200"}`}
                              strokeDasharray="100, 100"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`transition-all duration-1000 ${
                                resumeScore >= 90 ? "text-emerald-500" : "text-cyan-500"
                              }`}
                              strokeDasharray={`${resumeScore}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className={`text-lg font-black tracking-tighter ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                              {resumeScore}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className={`text-xs font-mono uppercase tracking-wider font-extrabold ${
                            resumeScore >= 90 ? "text-emerald-500" : "text-cyan-500"
                          }`}>
                            {resumeScore >= 90 ? "ATS Gold Status" : "ATS Calibration Required"}
                          </p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                            {resumeScore >= 90 
                              ? "Excellent keyword alignment with 'AI Architect' role filters."
                              : "Missing core ML pipeline & vector database keywords."}
                          </p>
                        </div>
                      </div>

                      {/* Keyword tags */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-mono text-slate-400/90 uppercase tracking-widest block font-extrabold">
                          Target Core Competency Matches
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-1.5">
                            <Check className="w-3 h-3" /> React.js
                          </span>
                          <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-1.5">
                            <Check className="w-3 h-3" /> Node.js
                          </span>
                          <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-1.5">
                            <Check className="w-3 h-3" /> AWS S3
                          </span>
                          {!resumeOptimized ? (
                            <>
                              <span className="px-2 py-1 text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 rounded-md flex items-center gap-1.5 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> PyTorch
                              </span>
                              <span className="px-2 py-1 text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 rounded-md flex items-center gap-1.5 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Vector DBs
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-1.5">
                                <Check className="w-3 h-3" /> PyTorch
                              </span>
                              <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-1.5">
                                <Check className="w-3 h-3" /> Vector DBs
                              </span>
                              <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md flex items-center gap-1.5">
                                <Check className="w-3 h-3" /> RAG Agents
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleOptimizeResume}
                      disabled={isOptimizingResume || resumeOptimized}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition-all mt-6 ${
                        resumeOptimized
                          ? "bg-emerald-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-500 to-indigo-650 hover:brightness-110 active:scale-98"
                      }`}
                    >
                      {isOptimizingResume ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Resume Optimizer scanning...</span>
                        </span>
                      ) : resumeOptimized ? (
                        <span>✓ Resume Successfully Calibrated!</span>
                      ) : (
                        <span>Simulate AI Resume Optimization</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Skill Gaps */}
              {activeShowcaseTab === "skills" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Verified Stack */}
                  <div className={`p-5 rounded-xl border ${
                    isDarkMode ? "bg-slate-950/60 border-slate-850" : "bg-white border-slate-200"
                  }`}>
                    <h4 className="text-sm font-extrabold uppercase font-mono tracking-widest text-[#6366f1] mb-4 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      Verified Skill Portfolio
                    </h4>

                    <div className="space-y-4">
                      {/* Advanced */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                          Advanced / Highly Experienced (L3)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {["React.js", "TypeScript", "Node.js", "Express.js", "REST APIs"].map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Intermediate */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                          Intermediate / Competent (L2)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {["Python", "SQL Databases", "Docker", "Git Version Control", "AWS"].map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Beginner */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                          Beginner / Familiar (L1)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {["PyTorch Fundamentals", "NoSQL Docs"].map((s, idx) => (
                            <span key={idx} className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${
                              isDarkMode ? "bg-slate-900 border-slate-800 text-gray-405" : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Identified Market Gaps */}
                  <div className={`p-5 rounded-xl border ${
                    isDarkMode ? "bg-slate-950/60 border-slate-850" : "bg-white border-slate-200"
                  }`}>
                    <h4 className="text-sm font-extrabold uppercase font-mono tracking-widest text-cyan-600 dark:text-cyan-405 mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-cyan-500" />
                      Target Role Skill Gaps (AI Architect)
                    </h4>
                    
                    <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                      Our intelligence parsing engine compared this stack with hiring requirements and flagged these gaps:
                    </p>

                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        isDarkMode ? "bg-[#111827]/60 border-slate-850 hover:bg-[#111827]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}>
                        <div className="space-y-0.5">
                          <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Vector Embeddings & Cosine Similarity</span>
                          <p className="text-[10px] text-gray-500">Essential for Semantic Search & Document retrieval architectures</p>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded">
                          High Demand
                        </span>
                      </div>

                      <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        isDarkMode ? "bg-[#111827]/60 border-slate-850 hover:bg-[#111827]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}>
                        <div className="space-y-0.5">
                          <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>RAG Pipelines (LangChain / LlamaIndex)</span>
                          <p className="text-[10px] text-gray-550">Core building block for custom AI business search systems</p>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded">
                          High Demand
                        </span>
                      </div>

                      <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        isDarkMode ? "bg-[#111827]/60 border-slate-850 hover:bg-[#111827]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}>
                        <div className="space-y-0.5">
                          <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>MLOps & Containerized Model Deployment</span>
                          <p className="text-[10px] text-gray-555">Needed to orchestrate high-availability server inference loops</p>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-405 rounded">
                          Medium Demand
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Adaptive Roadmap */}
              {activeShowcaseTab === "roadmaps" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  {/* Timeline Phases */}
                  <div className="lg:col-span-2 space-y-4">
                    <span className="text-xs font-mono font-bold text-slate-400/90 tracking-wider block">
                      DYNAMIC GENERATED SYLLABUS SPRINT PLAN
                    </span>

                    <div className="space-y-3">
                      {/* Sprint 1 */}
                      <div
                        onClick={() => setSelectedRoadmapSubTopic({
                          title: "Vector Embeddings",
                          resource: "OpenAI Embedding Guide & Cosine Math",
                          desc: "Learn how texts are converted into high-dimensional numerical vectors. Master distance calculations (Cosine, Euclidean) for semantic search."
                        })}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedRoadmapSubTopic?.title === "Vector Embeddings"
                            ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                            : isDarkMode ? "border-slate-850 bg-slate-950/40 hover:bg-slate-900/60" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold">
                              1
                            </div>
                            <div>
                              <h5 className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Week 1-2: Vector Mathematics & Database Seeding</h5>
                              <p className="text-[10px] text-gray-500">Embeddings, Similarity Metrics, Database Schemas</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-500 font-semibold">Active</span>
                        </div>
                      </div>

                      {/* Sprint 2 */}
                      <div
                        onClick={() => setSelectedRoadmapSubTopic({
                          title: "RAG Orchestration",
                          resource: "LangChain API Docs & LlamaIndex Quickstart",
                          desc: "Implement document retrieval chains, context window handling, and prompt template structures with LLM feedback loops."
                        })}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedRoadmapSubTopic?.title === "RAG Orchestration"
                            ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                            : isDarkMode ? "border-slate-850 bg-slate-950/40 hover:bg-slate-900/60" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-400 text-xs font-mono font-bold">
                              2
                            </div>
                            <div>
                              <h5 className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Week 3-5: Retrieval-Augmented Generation (RAG)</h5>
                              <p className="text-[10px] text-gray-500">LangChain Framework, Vector Retrieval, Prompt Templates</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">Locked</span>
                        </div>
                      </div>

                      {/* Sprint 3 */}
                      <div
                        onClick={() => setSelectedRoadmapSubTopic({
                          title: "MLOps Deployments",
                          resource: "Docker Hub & FastAPI Inference Template",
                          desc: "Learn how to wrap PyTorch models in high-speed FastAPI endpoints, build light Docker images, and configure scaling on cloud servers."
                        })}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedRoadmapSubTopic?.title === "MLOps Deployments"
                            ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                            : isDarkMode ? "border-slate-850 bg-slate-950/40 hover:bg-slate-900/60" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-400 text-xs font-mono font-bold">
                              3
                            </div>
                            <div>
                              <h5 className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Week 6-8: Model Optimization & Scaling Inference</h5>
                              <p className="text-[10px] text-gray-555">FastAPI wrappers, Docker Containerization, GPU Pipelines</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">Locked</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target Details Card */}
                  <div className={`p-5 border rounded-xl flex flex-col justify-between ${
                    isDarkMode ? "bg-slate-950/60 border-slate-850" : "bg-white border-slate-200"
                  }`}>
                    {selectedRoadmapSubTopic ? (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <Award className="w-4.5 h-4.5 text-emerald-550" />
                          <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                            {selectedRoadmapSubTopic.title} Details
                          </h4>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                          {selectedRoadmapSubTopic.desc}
                        </p>
                        <div className={`p-3 rounded-lg border text-left ${
                          isDarkMode ? "bg-[#111827]/80 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}>
                          <span className="text-[9px] font-mono font-bold text-[#6366f1] block uppercase tracking-wide">
                            RECOMMENDED COURSE RESOURCE
                          </span>
                          <span className={`text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-slate-800"} block mt-1`}>
                            {selectedRoadmapSubTopic.resource}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-gray-500 text-xs py-8">
                        Click a Phase Sprint step on the left to show roadmap course curricula.
                      </div>
                    )}
                    <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 mt-4 text-[10px] text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-550" /> Roadmap content generated by AI.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: AI Mentor Chat */}
              {activeShowcaseTab === "mentor" && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-mono font-bold text-slate-400/90 tracking-wider">INTERACTIVE AI CAREER MENTOR CHAT</span>
                    <button
                      onClick={() => setChatMessages([
                        {
                          sender: "ai",
                          text: "👋 Hi! I am your AI Career Mentor. I have evaluated your skill gaps for 'AI Architect'. How can I help you accelerate your learning today?"
                        }
                      ])}
                      className="text-[10px] text-rose-500 font-semibold hover:underline"
                    >
                      Clear Chat
                    </button>
                  </div>

                  {/* Chat frame */}
                  <div className={`border rounded-xl flex flex-col justify-between overflow-hidden ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-205"
                  }`}>
                    {/* Frame header */}
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${
                      isDarkMode ? "border-slate-850 bg-slate-900/60" : "border-slate-200 bg-slate-100"
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>AI Mentor Engine (Active)</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-550">Model: Gemini 1.5 Pro</span>
                    </div>

                    {/* Messages list */}
                    <div className="p-4 space-y-4 min-h-[220px] max-h-[360px] overflow-y-auto font-sans text-xs">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] p-3.5 rounded-xl text-left shadow-sm ${
                            msg.sender === "user"
                              ? "bg-rose-600 text-white rounded-br-none"
                              : isDarkMode 
                                ? "bg-slate-900 border border-slate-800 text-gray-200 rounded-bl-none" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                          }`}>
                            <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                            {msg.code && (
                              <pre className={`mt-3 p-3 rounded-lg font-mono text-[10px] overflow-x-auto border ${
                                isDarkMode 
                                  ? "bg-slate-950 border-slate-800 text-cyan-400" 
                                  : "bg-slate-50 border-slate-200 text-cyan-700"
                              }`}>
                                <code>{msg.code}</code>
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}

                      {isChatTyping && (
                        <div className="flex justify-start">
                          <div className={`p-3.5 rounded-xl border flex items-center gap-1.5 ${
                            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                          }`}>
                            <span className="w-1.5 h-1.5 bg-gray-505 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-gray-505 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-gray-505 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Predefined prompt pills */}
                    <div className={`p-3.5 border-t flex flex-wrap gap-2 items-center ${
                      isDarkMode ? "border-slate-850 bg-slate-900/30" : "border-slate-200 bg-slate-100/50"
                    }`}>
                      <span className="text-[10px] text-gray-500 mr-1.5">Quick Questions:</span>
                      {[
                        "How do I start learning Vector DBs?",
                        "Ask me a Python mock interview question.",
                        "Give me a micro-project idea for RAG."
                      ].map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChatOption(opt)}
                          disabled={isChatTyping}
                          className={`px-3 py-1.5 rounded-full text-[10.5px] font-semibold border transition-all ${
                            isDarkMode 
                              ? "bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-gray-300"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-705 shadow-sm"
                          } disabled:opacity-40 disabled:pointer-events-none`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Instant Sandbox Showcase Profiles */}
        <section id="demo-profiles" className="mt-24 w-full text-left max-w-5xl">
          <div className="text-center space-y-3 mb-12">
            <h3 className={`text-2xl md:text-4xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Instant Showcase Sandbox Profiles
            </h3>
            <p className={`text-sm md:text-base max-w-xl mx-auto ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
              Test different pre-seeded candidate databases instantly without manual onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Profile 1: Arjun */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
              isDarkMode ? "bg-slate-900/50 border-slate-800 hover:border-purple-500/35" : "bg-white border-slate-200"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-550" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-450">
                    AS
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Arjun Sharma</h4>
                    <p className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">AI/ML Architect</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">VERIFIED STACK</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["Python", "PyTorch", "FastAPI", "SQLite"].map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[9.5px] font-semibold bg-purple-500/5 text-purple-400 rounded-md border border-purple-500/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">CAREER GAP</span>
                    <p className={`text-[10.5px] mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>AWS Cloud Engine, Terraform MLOps</p>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-[10px] font-mono relative mt-2 ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-55/70 border-slate-200"
                  }`}>
                    <div className="flex justify-between items-center text-[8.5px] text-gray-500 border-b border-dashed dark:border-slate-800 pb-1 mb-1">
                      <span>DEMO LOGIN CREDENTIALS</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("arjun");
                          alert("Username copied to clipboard!");
                        }}
                        className="hover:text-cyan-500"
                        title="Copy username"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div>User: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>arjun</span></div>
                    <div>Pass: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>AIEngineer@123</span></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setInitialAuthCredentials({ username: "arjun", password: "AIEngineer@123" });
                  setShowAuthModal(true);
                }}
                className="w-full mt-5 py-2.5 text-center text-xs font-bold text-white bg-purple-600 hover:brightness-110 rounded-xl transition-all shadow-md shadow-purple-950/20 active:scale-98"
              >
                Log In as Arjun
              </button>
            </div>

            {/* Profile 2: Priya */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
              isDarkMode ? "bg-slate-900/50 border-slate-800 hover:border-cyan-500/35" : "bg-white border-slate-205"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-500" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-455">
                    PM
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Priya Menon</h4>
                    <p className="text-[10px] text-cyan-500 font-semibold uppercase tracking-wider">Lead Backend Developer</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">VERIFIED STACK</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["Node.js", "Express", "PostgreSQL", "Docker"].map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[9.5px] font-semibold bg-cyan-500/5 text-cyan-400 rounded-md border border-cyan-500/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">CAREER GAP</span>
                    <p className={`text-[10.5px] mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>GraphQL APIs, Kubernetes Clusters</p>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-[10px] font-mono relative mt-2 ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-55/70 border-slate-200"
                  }`}>
                    <div className="flex justify-between items-center text-[8.5px] text-gray-500 border-b border-dashed dark:border-slate-800 pb-1 mb-1">
                      <span>DEMO LOGIN CREDENTIALS</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("priya");
                          alert("Username copied to clipboard!");
                        }}
                        className="hover:text-cyan-500"
                        title="Copy username"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div>User: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>priya</span></div>
                    <div>Pass: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>BackendDev@123</span></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setInitialAuthCredentials({ username: "priya", password: "BackendDev@123" });
                  setShowAuthModal(true);
                }}
                className="w-full mt-5 py-2.5 text-center text-xs font-bold text-white bg-cyan-600 hover:brightness-110 rounded-xl transition-all shadow-md shadow-cyan-950/20 active:scale-98"
              >
                Log In as Priya
              </button>
            </div>

            {/* Profile 3: Rohan */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
              isDarkMode ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/35" : "bg-white border-slate-205"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-450">
                    RV
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Rohan Verma</h4>
                    <p className="text-[10px] text-emerald-555 font-semibold uppercase tracking-wider">Cloud Infra Dev</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">VERIFIED STACK</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["AWS", "Terraform", "Kubernetes", "Go"].map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[9.5px] font-semibold bg-emerald-500/5 text-emerald-400 rounded-md border border-emerald-500/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">CAREER GAP</span>
                    <p className={`text-[10.5px] mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>Rust Pipelines, Apache Kafka</p>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-[10px] font-mono relative mt-2 ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-55/70 border-slate-200"
                  }`}>
                    <div className="flex justify-between items-center text-[8.5px] text-gray-500 border-b border-dashed dark:border-slate-800 pb-1 mb-1">
                      <span>DEMO LOGIN CREDENTIALS</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("rohan");
                          alert("Username copied to clipboard!");
                        }}
                        className="hover:text-cyan-500"
                        title="Copy username"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div>User: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>rohan</span></div>
                    <div>Pass: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>CloudEngineer@123</span></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setInitialAuthCredentials({ username: "rohan", password: "CloudEngineer@123" });
                  setShowAuthModal(true);
                }}
                className="w-full mt-5 py-2.5 text-center text-xs font-bold text-white bg-emerald-600 hover:brightness-110 rounded-xl transition-all shadow-md shadow-emerald-950/20 active:scale-98"
              >
                Log In as Rohan
              </button>
            </div>

            {/* Profile 4: Admin */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
              isDarkMode ? "bg-slate-900/50 border-slate-800 hover:border-indigo-500/35" : "bg-white border-slate-205"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500" />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-455">
                    AD
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>System Admin</h4>
                    <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">Full Suite Access</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">VERIFIED STACK</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["Full Access", "User Management", "SQLite Admin", "System Sync"].map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[9.5px] font-semibold bg-indigo-500/5 text-indigo-400 rounded-md border border-indigo-500/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-extrabold">SYSTEM NODE</span>
                    <p className={`text-[10.5px] mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>local.db SQLite Core Instance</p>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-[10px] font-mono relative mt-2 ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-55/70 border-slate-200"
                  }`}>
                    <div className="flex justify-between items-center text-[8.5px] text-gray-500 border-b border-dashed dark:border-slate-800 pb-1 mb-1">
                      <span>DEMO LOGIN CREDENTIALS</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("admin");
                          alert("Username copied to clipboard!");
                        }}
                        className="hover:text-cyan-500"
                        title="Copy username"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div>User: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>admin</span></div>
                    <div>Pass: <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>password123</span></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setInitialAuthCredentials({ username: "admin", password: "password123" });
                  setShowAuthModal(true);
                }}
                className="w-full mt-5 py-2.5 text-center text-xs font-bold text-white bg-indigo-600 hover:brightness-110 rounded-xl transition-all shadow-md shadow-indigo-950/20 active:scale-98"
              >
                Log In as Admin
              </button>
            </div>
          </div>
        </section>

        {/* Step-by-Step Pipeline Flow */}
        <section id="workflow" className="mt-24 w-full text-left max-w-5xl">
          <div className="text-center space-y-3 mb-12">
            <h3 className={`text-2xl md:text-4xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              How the Software Works
            </h3>
            <p className={`text-sm md:text-base max-w-xl mx-auto ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
              A streamlined overview of the backend pipeline processing.
            </p>
          </div>

          <div className="relative">
            {/* Dotted Line connector */}
            <div className="absolute top-[20px] left-8 right-8 h-0.5 border-t border-dashed border-slate-350 dark:border-slate-800 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Step 1 */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md shadow-cyan-500/20 relative z-10">
                    01
                  </div>
                  <h4 className={`text-sm font-extrabold mt-0 md:mt-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Intake & Calibration
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                  Paste your resume text or write your profile details. Select your target engineering job goal.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-400 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md shadow-purple-500/20 relative z-10">
                    02
                  </div>
                  <h4 className={`text-sm font-extrabold mt-0 md:mt-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    AI Scanning
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                  Our Gemini LLM parsing proxy extracts coding competencies, project stacks, and core strengths.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md shadow-emerald-500/20 relative z-10">
                    03
                  </div>
                  <h4 className={`text-sm font-extrabold mt-0 md:mt-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Gap Mapping
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                  Compares your extracted skills portfolio with real-world target job requirements to identify missing items.
                </p>
              </div>

              {/* Step 4 */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-505 to-rose-400 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md shadow-rose-500/20 relative z-10">
                    04
                  </div>
                  <h4 className={`text-sm font-extrabold mt-0 md:mt-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Syllabus Sprints
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                  Generates an adaptive roadmap listing step-by-step weekly sprints, coding projects, and external certifications.
                </p>
              </div>

              {/* Step 5 */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 flex items-center justify-center font-mono font-bold text-white text-sm shadow-md shadow-indigo-500/20 relative z-10">
                    05
                  </div>
                  <h4 className={`text-sm font-extrabold mt-0 md:mt-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    AI Mentor Support
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                  1-on-1 support for debugging code blocks, answering interview questions, and tailoring course recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section id="faqs" className="mt-24 w-full text-left max-w-3xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h3 className={`text-2xl md:text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Frequently Asked Questions
            </h3>
            <p className={`text-sm md:text-base max-w-xl mx-auto ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
              Get quick answers to common questions about data storage and AI processing.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Does this application require an active internet connection to run?",
                a: "No, the core engine runs in high-speed local sandbox mode using a local SQLite database proxy and localStorage. External API integrations (like Google Gemini API) are only invoked for real-time resume parsing and AI study plan generation."
              },
              {
                q: "How does the Resume Intelligence engine calculate my ATS score?",
                a: "It performs semantic text structure parsing, checking for industry-relevant keywords, technical skill hierarchies, active verbs, and target job descriptions matching modern engineering criteria."
              },
              {
                q: "What is the difference between local guest mode and a synchronized account?",
                a: "Guest mode saves all progress locally in your browser cache. Creating an account synchronizes your progress to our secure local database store (or Supabase Cloud) so you can resume on any browser session."
              },
              {
                q: "How are the learning roadmaps customized?",
                a: "When you select a career target (e.g. AI Architect), the AI analyzes your current skills, calculates missing core competencies, and dynamically structures a weekly curriculum with online resources."
              },
              {
                q: "Can I connect this to my Github profile or local source code files?",
                a: "Yes! Under the repository parsing section, you can input a local path or repository URL to scan code files and automatically verify your actual skills in action."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                    isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <span className={`text-xs md:text-sm font-bold flex items-center gap-2.5 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      <HelpCircle className="w-4 h-4 text-cyan-500" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-5 pb-5 pt-1 text-xs leading-relaxed border-t border-dashed dark:border-slate-800 ${
                      isDarkMode ? "text-gray-400 bg-slate-950/20" : "text-slate-655 bg-slate-50/20"
                    }`}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl px-4 overflow-y-auto py-10"
            onClick={() => {
              setShowAuthModal(false);
              setInitialAuthCredentials(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md border rounded-2xl relative shadow-2xl transition-all duration-300 ${
                isDarkMode ? "bg-slate-900/90 border-slate-800 text-[#C9D1D9]" : "bg-white border-slate-200 text-slate-850"
              }`}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setInitialAuthCredentials(null);
                }}
                className={`absolute top-4 right-4 p-1.5 border rounded-lg transition-colors z-25 ${
                  isDarkMode ? "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-gray-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-550"
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <SupabaseAuthView
                isDarkMode={isDarkMode}
                userProfile={userProfile}
                results={results}
                noWrapper={true}
                onUpdateSession={(profile, results) => {
                  onUpdateSession(profile, results);
                  setShowAuthModal(false);
                }}
                onLoginAsGuest={(guestName) => {
                  onLoginAsGuest(guestName);
                  setShowAuthModal(false);
                }}
                onLogoutGuest={onLogoutGuest}
                onNewUser={() => {
                  setShowAuthModal(false);
                  onNewUser();
                }}
                onLoginSuccess={(u) => {
                  onLoginSuccess(u);
                  setShowAuthModal(false);
                  setInitialAuthCredentials(null);
                }}
                initialUsername={initialAuthCredentials?.username || ""}
                initialPassword={initialAuthCredentials?.password || ""}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
