import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  ArrowRight,
  User,
  Award,
  ShieldAlert,
  Database,
  Brain,
  CheckSquare,
  PlusCircle,
  Volume2,
  Mic,
  Play,
  Settings,
  RefreshCw,
  Bookmark,
  Compass,
  HelpCircle,
  Star,
  Trash2,
  BookmarkCheck,
  Zap,
  Briefcase,
  Layers,
  Award as Diploma
} from "lucide-react";
import { MentorChatMessage, ProfileMappingResults } from "../types";

interface MentorChatViewProps {
  userProfile: {
    name: string;
    degree: string;
    experienceLevel: string;
    careerGoal: string;
    knownSkills: string[];
  } | null;
  results: ProfileMappingResults | null;
  isDarkMode?: boolean;
  onNavigate?: (tab: string) => void;
}

interface MemoryNote {
  id: string;
  note: string;
  category: "Technical Gaps" | "Career Preferences" | "Interview Targets" | "General";
}

interface SavedInsight {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}

export default function MentorChatView({ userProfile, results, isDarkMode, onNavigate }: MentorChatViewProps) {
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
  const memoryKey = `skill_mapper_mentor_memory_${userId}`;
  const insightKey = `skill_mapper_mentor_insights_${userId}`;
  const conversationKey = `skill_mapper_mentor_convo_${userId}`;

  // 1. Memory Engine States
  const [memoryNotes, setMemoryNotes] = useState<MemoryNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<MemoryNote["category"]>("General");

  // 2. Saved Insights States
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);

  // 3. active tab within the Mentor screen: "chat" | "memory" | "insights"
  const [subView, setSubView] = useState<"chat" | "memory" | "insights">("chat");

  // 4. Voice Input emulation states
  const [isRecording, setIsRecording] = useState(false);
  const [waveScale, setWaveScale] = useState(1);

  // Default Preset Recommendations if results are missing
  const defaultRecommendedSkills = [
    { name: "System Design Patterns", category: "AI/ML", priority: "High", why: "Required to design highly resilient event-driven systems requested by your career target" },
    { name: "Redis Memory Caches", category: "Databases", priority: "Medium", why: "Crucial for accelerating response latencies below 30ms in enterprise frameworks" },
    { name: "MLOps Model Version Control", category: "AI/ML", priority: "High", why: "Bridge-point to transition theoretical studies to industrial machine learning pipelines" }
  ];

  const defaultRecommendedProjects = [
    { title: "High-Throughput Distributed Rate Limiter", desc: "Build an API Rate Limiter using Redis Token Bucket filters to manage spikes of up to 12,000 requests per minute.", tech: ["Redis", "Node.js", "Docker"] },
    { title: "End-to-End Chat Summarizer Middleware", desc: "Create an offline queue scheduler using BullMQ and the Gemini API to retrieve and batch summarize interview sound transcripts.", tech: ["Gemini API", "BullMQ", "PostgreSQL"] }
  ];

  const defaultCertifications = [
    { title: "AWS Solutions Architect Affiliate", provider: "Amazon Web Services", category: "Cloud" },
    { title: "TensorFlow Developer Certification", provider: "Google DeepMind Academy", category: "AI/ML" }
  ];

  // Load Memory & Saved Insights on start
  useEffect(() => {
    // Memory Notes
    const savedMemo = localStorage.getItem(memoryKey);
    if (savedMemo) {
      try {
        setMemoryNotes(JSON.parse(savedMemo));
      } catch (e) {
        setMemoryNotes([]);
      }
    } else {
      // Default initial seeds
      const initialSeed: MemoryNote[] = [
        { id: "seed-1", note: `Highly focused on mastering the role of a professional "${userProfile?.careerGoal || "Software Developer"}".`, category: "Career Preferences" },
        { id: "seed-2", note: "Developing deeper intuition for big-O trade-offs and multi-tier scalable APIs.", category: "General" }
      ];
      setMemoryNotes(initialSeed);
      localStorage.setItem(memoryKey, JSON.stringify(initialSeed));
    }

    // Saved Insights
    const savedIns = localStorage.getItem(insightKey);
    if (savedIns) {
      try {
        setSavedInsights(JSON.parse(savedIns));
      } catch (e) {
        setSavedInsights([]);
      }
    } else {
      const initialInsights: SavedInsight[] = [
        {
          id: "ins-seed",
          title: "Senior Career Blueprint",
          content: "Always design system backbones prior to drafting code. Isolate core state logic in unified, modular models. Never consolidate extensive helper loops in main controller files.",
          savedAt: new Date(Date.now() - 36000000).toLocaleString()
        }
      ];
      setSavedInsights(initialInsights);
      localStorage.setItem(insightKey, JSON.stringify(initialInsights));
    }
  }, [userId, userProfile?.careerGoal]);

  // Voice wave emulation effect
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setWaveScale(0.8 + Math.random() * 0.7);
      }, 150);
    } else {
      setWaveScale(1);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // 5. Chat messages setup
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hydrate or Seed chat history
  useEffect(() => {
    const savedConvo = localStorage.getItem(conversationKey);
    if (savedConvo) {
      try {
        setMessages(JSON.parse(savedConvo));
      } catch (e) {
        // Fallback seed
        setMessages([
          {
            role: "mentor",
            text: `Hello ${userProfile?.name || "Ambassador"}! I am your AI Career Mentor synchronized with your live portfolio database metrics. Ask me queries like "Review my ATS Score", "How can I study System Design?", or click "Draft 7-Day Study Plan"!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } else {
      setMessages([
        {
          role: "mentor",
          text: `Hello ${userProfile?.name || "Ambassador"}! I am your AI Career Mentor synchronized with your live portfolio database metrics. Ask me queries like "Review my ATS Score", "How can I study System Design?", or click "Draft 7-Day Study Plan"!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, subView]);

  // Handle messages submit
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim()) return;

    const userMsg: MentorChatMessage = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedConvo = [...messages, userMsg];
    setMessages(updatedConvo);
    localStorage.setItem(conversationKey, JSON.stringify(updatedConvo));
    
    if (!customPrompt) setUserInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSend,
          chatHistory: updatedConvo.map(m => ({ role: m.role, text: m.text })),
          userProfile: userProfile || {},
          results: results || {},
          storedMemory: memoryNotes
        })
      });
      const data = await response.json();
      
      const mentorMsg: MentorChatMessage = {
        role: "mentor",
        text: data.reply || "I am analyzing your career roadmap metrics. Keep filling validated tech skills designed on the main dashboard.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPlan: data.isPlanSuggested,
        planHtml: data.studyPlanHTMLSnippet
      };
      
      const finalConvo = [...updatedConvo, mentorMsg];
      setMessages(finalConvo);
      localStorage.setItem(conversationKey, JSON.stringify(finalConvo));
    } catch (err) {
      console.error(err);
      const mentorMsg: MentorChatMessage = {
        role: "mentor",
        text: "I experienced a minor server synchronization gap, but here is my primary advice: configure your profile parameters cleanly on your resume and allocate 30 minutes daily to practical mock interview assignments.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      const finalConvo = [...updatedConvo, mentorMsg];
      setMessages(finalConvo);
      localStorage.setItem(conversationKey, JSON.stringify(finalConvo));
    } finally {
      setIsSending(false);
    }
  };

  // Trigger custom preset triggers
  const handleQuickStudyPlan = () => {
    setSubView("chat");
    handleSendMessage("Please generate a detailed, highly structured 7-Day Study Plan focused on filling my current engineering goals.");
  };

  // Add Memory Note
  const addMemoryNote = () => {
    if (!newNoteText.trim()) return;
    const newMemo: MemoryNote = {
      id: `memo-${Date.now()}`,
      note: newNoteText.trim(),
      category: newNoteCategory
    };
    const updated = [newMemo, ...memoryNotes];
    setMemoryNotes(updated);
    localStorage.setItem(memoryKey, JSON.stringify(updated));
    setNewNoteText("");
  };

  // Delete Memory Note
  const deleteMemoryNote = (id: string) => {
    const filtered = memoryNotes.filter(m => m.id !== id);
    setMemoryNotes(filtered);
    localStorage.setItem(memoryKey, JSON.stringify(filtered));
  };

  // Save selected advice or system plan to Insights Vault
  const handleSaveInsight = (text: string, customTitle?: string) => {
    const newIns: SavedInsight = {
      id: `ins-${Date.now()}`,
      title: customTitle || "Saved Mentor Advisory",
      content: text,
      savedAt: new Date().toLocaleString()
    };
    const updated = [newIns, ...savedInsights];
    setSavedInsights(updated);
    localStorage.setItem(insightKey, JSON.stringify(updated));
  };

  // Delete Insight
  const deleteInsight = (id: string) => {
    const filtered = savedInsights.filter(i => i.id !== id);
    setSavedInsights(filtered);
    localStorage.setItem(insightKey, JSON.stringify(filtered));
  };

  // Voice recording emulator
  const triggerVoiceEmulation = () => {
    if (isRecording) {
      setIsRecording(false);
      // Automatically send simulated prompt
      const vocalPrompts = [
        "How can I bolster my resume score in backend topics?", 
        "What system design methodologies should I learn?", 
        "Give me project building ideas focused on MLOps queue schemas."
      ];
      const randomPrompt = vocalPrompts[Math.floor(Math.random() * vocalPrompts.length)];
      handleSendMessage(randomPrompt);
    } else {
      setIsRecording(true);
    }
  };

  // Helper variables for visual rendering
  const mappedResumeScore = results?.resumeAnalysis?.atsScore ?? 75;
  const mappedSkillsCount = userProfile?.knownSkills?.length ?? 3;
  const mappedGaps = results?.skillGaps ?? [];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Hero Panel with glowing elements */}
      <div className={`p-6 rounded-2xl border backdrop-blur flex flex-col md:flex-row items-center justify-between gap-6 ${
        isDarkMode 
          ? "border-gray-800 bg-[#111827]/60 text-white" 
          : "border-slate-200 bg-white text-slate-900 shadow-sm"
      }`}>
        <div className="space-y-1 md:max-w-2xl text-left">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDarkMode ? "bg-cyan-950/40 text-cyan-400" : "bg-indigo-50 text-indigo-600"}`}>
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans tracking-tight">AI Career Mentor System</h3>
              <p className={`text-[10px] font-mono uppercase tracking-wider font-extrabold ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>
                INTELLIGENT INTEGRATION • CENTRAL ORCHESTRATOR
              </p>
            </div>
          </div>
          <p className={`text-xs md:text-sm mt-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
            Your AI Mentor actively cross-analyzes ATS Resume ratings, technical skill deficits, mock interview analytics, and current memory contexts to formulate high-impact career progression frameworks.
          </p>
        </div>

        {/* Quick action triggers widget */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onNavigate && onNavigate("profile")}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-gray-800 hover:border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Analyze Resume</span>
          </button>
          <button 
            onClick={() => onNavigate && onNavigate("interview")}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-gray-800 hover:border-cyan-500/30 text-emerald-400 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Start Interview</span>
          </button>
          <button 
            onClick={handleQuickStudyPlan}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-gray-800 hover:border-cyan-500/30 text-amber-400 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Generate Study Path</span>
          </button>
        </div>
      </div>

      {/* 2. Context Integration Engine Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDarkMode ? "bg-slate-950/40 border-gray-850" : "bg-slate-50/70 border-slate-200"
        }`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
            TARGET ROLE GOAL
          </span>
          <span className="text-sm font-extrabold text-white line-clamp-1 mt-2">
            {userProfile?.careerGoal || "Elite Developer"}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono mt-1">Goal Status Active</span>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDarkMode ? "bg-slate-950/40 border-gray-850" : "bg-slate-50/70 border-slate-200"
        }`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
            RESUME ATS SCORE
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-rose-400">{mappedResumeScore}%</span>
            <span className="text-[10px] text-gray-400 font-mono">CRITICAL RATINGS</span>
          </div>
          <span className="text-[10px] text-gray-500 font-sans mt-1 line-clamp-1">Missing key target focus words</span>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDarkMode ? "bg-slate-950/40 border-gray-850" : "bg-slate-50/70 border-slate-200"
        }`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
            VALIDATED SKILLS
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-emerald-400">{mappedSkillsCount}</span>
            <span className="text-[10px] text-gray-400 font-mono">TECHNOLOGIES</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-mono mt-1">Live telemetry maps</span>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isDarkMode ? "bg-slate-950/40 border-gray-850" : "bg-slate-50/70 border-slate-200"
        }`}>
          <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
            DETECTED DEFICITS / GAPS
          </span>
          <span className="text-xs font-bold text-amber-400 truncate mt-2">
            {mappedGaps.length > 0 ? mappedGaps.map(g => g.skillName).join(", ") : "System Design Gaps"}
          </span>
          <span className="text-[10px] text-amber-500 font-mono mt-1">{mappedGaps.length} areas need warm-up</span>
        </div>
      </div>

      {/* 2. Structured Workflow Segmented Tab Switcher */}
      <div className={`p-1.5 rounded-2xl border flex flex-wrap gap-1 ${
        isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-100 border-slate-200"
      }`}>
        <button
          onClick={() => setSubView("chat")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            subView === "chat"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>1. Conversational Chat</span>
        </button>

        <button
          onClick={() => setSubView("memory")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            subView === "memory"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow shadow-cyan-500/5 font-bold"
                : "bg-white text-indigo-600 shadow shadow-indigo-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Advisor Memory DB</span>
        </button>

        <button
          onClick={() => setSubView("insights")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            subView === "insights"
              ? isDarkMode
                ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow shadow-emerald-500/5 font-bold"
                : "bg-white text-emerald-600 shadow shadow-emerald-100 font-bold"
              : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-slate-905/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>3. Insights Vault ({savedInsights.length})</span>
        </button>
      </div>

      {/* 4. Subviews rendering */}
      {subView === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick suggestions presets side column */}
          <div className="lg:col-span-1">
            <div className={`p-5 rounded-2xl border text-left flex flex-col justify-between min-h-[500px] max-h-[600px] overflow-hidden ${
              isDarkMode ? "bg-slate-900/30 border-gray-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-2 border-b pb-3 border-gray-850/50">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest">SUGGESTED DISCOURSE</span>
                </div>
                
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
                  Click any verified prompt below to quickly align your skill portfolio or coordinate mock preparation pathways directly:
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleSendMessage("How can I close my tech gaps before senior mock reviews?")}
                    className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer group text-xs ${
                      isDarkMode 
                        ? "bg-slate-950 border-gray-850 hover:border-cyan-500/30 text-gray-300 hover:text-white" 
                        : "bg-slate-50 border-slate-200 hover:border-indigo-500/30 text-slate-700 hover:text-indigo-900"
                    }`}
                  >
                    <div className="font-mono text-[9px] text-cyan-500/80 mb-1 uppercase tracking-wider">SKILLS DEFICITS</div>
                    <span className="font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      "How do I close my technical gap topics?"
                      <ArrowRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("Suggest portfolio project layouts with Redis rate limit architectures.")}
                    className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer group text-xs ${
                      isDarkMode 
                        ? "bg-slate-950 border-gray-855 hover:border-cyan-500/30 text-gray-300 hover:text-white" 
                        : "bg-slate-50 border-slate-200 hover:border-indigo-500/30 text-slate-700 hover:text-indigo-900"
                    }`}
                  >
                    <div className="font-mono text-[9px] text-cyan-500/80 mb-1 uppercase tracking-wider">SYSTEM DESIGN</div>
                    <span className="font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      "Suggest project layouts focused on system design."
                      <ArrowRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("What should standard resume experience entries look like?")}
                    className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer group text-xs ${
                      isDarkMode 
                        ? "bg-slate-950 border-gray-855 hover:border-cyan-500/30 text-gray-300 hover:text-white" 
                        : "bg-slate-50 border-slate-200 hover:border-indigo-500/30 text-slate-700 hover:text-indigo-900"
                    }`}
                  >
                    <div className="font-mono text-[9px] text-cyan-500/80 mb-1 uppercase tracking-wider">RESUME OPTIMIZATION</div>
                    <span className="font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      "Review my resume improvement bullet guidelines."
                      <ArrowRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-850/50 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>METRICS CO-ORDINATION</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Core Chat Console */}
          <div className={`lg:col-span-3 flex flex-col rounded-2xl border min-h-[500px] max-h-[600px] overflow-hidden ${
            isDarkMode ? "border-gray-800 bg-[#111827]/40" : "border-slate-200 bg-white"
          }`}>
            {/* Messages body */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[460px]">
              {messages.map((m, id) => (
                <div key={id} className={`flex flex-col max-w-[85%] ${m.role === 'user' ? "ml-auto items-end text-right" : "mr-auto items-start text-left"}`}>
                  <div className={`p-3 rounded-2xl text-xs md:text-sm shadow-sm leading-relaxed ${
                    m.role === 'user'
                      ? "bg-cyan-600 text-white rounded-br-none"
                      : "bg-slate-950 border border-gray-850 text-gray-200 rounded-bl-none"
                  }`}>
                    <p className="whitespace-pre-line font-sans">{m.text}</p>
                    
                    {m.isPlan && m.planHtml && (
                      <div 
                        className="mt-3 p-3 bg-slate-900 border border-cyan-500/20 text-xs text-gray-300 rounded-lg space-y-2 font-mono whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: m.planHtml }}
                      />
                    )}

                    {m.role === 'mentor' && (
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => handleSaveInsight(m.text, `Insight from Career Mentor`)}
                          className="text-[10px] font-mono text-cyan-400 hover:text-white transition-all flex items-center gap-1 ml-auto"
                        >
                          <BookmarkCheck className="w-3 h-3" />
                          <span>Save to Vault</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono mt-1 px-1.5">{m.timestamp}</span>
                </div>
              ))}

              {isSending && (
                <div className="flex flex-col mr-auto items-start text-left max-w-[85%]">
                  <div className="p-3 bg-slate-950 border border-gray-850 rounded-2xl rounded-bl-none text-xs text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Searching RAG sources & coordinating portfolio scores...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-gray-850 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your mentor about specific microservices patterns, Big-O targets or Resume scoring details."
                className="flex-grow p-3 bg-slate-950 border border-gray-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/55 font-mono"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isSending}
                className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Memory Database Setup */}
      {subView === "memory" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border bg-slate-950/20 border-gray-850">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mb-1">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>ADVISOR LONG-TERM MEMORY BUFFER</span>
            </h4>
            <p className="text-xs text-gray-400">
              The AI Mentor retains facts below to ensure long-term, multi-turn conversational alignment. This constitutes your dedicated, isolated Sandbox Memory Table schema.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input form to append memory */}
            <div className="lg:col-span-1 p-4 bg-slate-950/40 border border-gray-850 rounded-xl space-y-3">
              <span className="text-[10px] font-mono text-white font-extrabold uppercase tracking-wider block">APPEND RECORD TO MEMORY SCHEMA</span>
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase block">Fact / Note Content</label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  rows={3}
                  placeholder="e.g., Prefers hands-on Node.js API tasks rather than Python libraries."
                  className="w-full text-xs text-white p-2.5 bg-slate-950 border border-gray-850 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase block">Schema Category</label>
                <select
                  value={newNoteCategory}
                  onChange={(e: any) => setNewNoteCategory(e.target.value)}
                  className="w-full text-xs text-white p-2 bg-slate-950 border border-gray-850 rounded-lg focus:outline-none"
                >
                  <option value="General">General Context</option>
                  <option value="Career Preferences">Career Preferences</option>
                  <option value="Technical Gaps">Technical Gaps</option>
                  <option value="Interview Targets">Interview Targets</option>
                </select>
              </div>

              <button
                onClick={addMemoryNote}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write to Memory</span>
              </button>
            </div>

            {/* List of active memory logs */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">CURRENT MEMORY REGISTERS ({memoryNotes.length})</span>
              
              {memoryNotes.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-xs italic border border-dashed border-gray-800 rounded-xl">
                  Memory buffer empty. Use the append panel on the left to record facts!
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {memoryNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-950 border border-gray-850 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 font-extrabold border border-cyan-900/40">
                          {note.category}
                        </span>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">{note.note}</p>
                      </div>
                      <button
                        onClick={() => deleteMemoryNote(note.id)}
                        className="p-1.5 hover:bg-rose-950/20 text-gray-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                        title="Erase Note from database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Insights Vault View */}
      {subView === "insights" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border bg-emerald-950/10 border-emerald-950/30">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mb-1">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>SAVED ADVISORY & STUDY SYLLABUSES</span>
            </h4>
            <p className="text-xs text-gray-400">
              When reviewing the mentor converse panel, hit "Save to Vault" on responses or timelines. They are preserved securely in your static sandbox insights cache for future offline reference.
            </p>
          </div>

          {savedInsights.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs italic border border-dashed border-gray-805 rounded-2xl">
              No advisory insights saved yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedInsights.map((ins) => (
                <div key={ins.id} className="p-4 bg-slate-950 border border-gray-850 rounded-xl space-y-3 relative group">
                  <button
                    onClick={() => deleteInsight(ins.id)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-rose-950/30 text-gray-500 hover:text-rose-400 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Erase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 font-mono block">Saved: {ins.savedAt}</span>
                    <span className="text-xs font-bold text-white font-mono block">{ins.title}</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line">{ins.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
