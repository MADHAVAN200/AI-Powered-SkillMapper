import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Cpu,
  Compass,
  BookOpen,
  LineChart,
  MessageSquare,
  Terminal,
  LogOut,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  Menu
} from "lucide-react";
import { ProfileMappingResults } from "./types";

// Import custom views
import LandingScreen from "./components/LandingScreen";
import DashboardHome from "./components/DashboardHome";
import ResumeIntelligenceView from "./components/ResumeIntelligenceView";
import SkillAnalyzerView from "./components/SkillAnalyzerView";
import CareerMapperView from "./components/CareerMapperView";
import LearningHubView from "./components/LearningHubView";
import MarketTrendsView from "./components/MarketTrendsView";
import InterviewPrepView from "./components/InterviewPrepView";
import MentorChatView from "./components/MentorChatView";
import SupabaseAuthView from "./components/SupabaseAuthView";
import { supabase } from "./lib/supabase";

interface OnboardingProfile {
  name: string;
  degree: string;
  experienceLevel: string;
  careerGoal: string;
  knownSkills: string[];
  resumeText: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("skill_mapper_dark_mode");
    return saved === "true"; // False (Light) by default
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("skill_mapper_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  const [userProfile, setUserProfile] = useState<OnboardingProfile | null>(null);
  const [results, setResults] = useState<ProfileMappingResults | null>(null);

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingCloudAuth, setCheckingCloudAuth] = useState<boolean>(true);

  // Onboarding Form States
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Junior (1-2 Years)");
  const [careerGoal, setCareerGoal] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState("");

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadState("uploading");
    setUploadedFileName(file.name);

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const fileBase64 = btoa(binary);

      // Call server to extract text
      const resp = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64,
          fileName: file.name,
          fileType: file.type
        })
      });

      if (!resp.ok) throw new Error("Server could not parse resume.");
      const data = await resp.json();

      if (data.warning) {
        // No AI key - show warning, leave text area empty for manual paste
        setResumeText("");
        setAnalysisError(data.warning);
      } else {
        setResumeText(data.extractedText || "");
        setAnalysisError("");
      }
      setUploadState("success");
    } catch (err: any) {
      console.error("File parse error:", err);
      setUploadState("idle");
      setAnalysisError("Could not read file. Please paste your resume text manually.");
    }
  };

  const popularSkills = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Docker", "AWS", "Google Cloud", 
    "Kubernetes", "SQL", "PostgreSQL", "Machine Learning", "FastAPI", "TensorFlow", "PyTorch"
  ];

  // Supabase Auth listener to auto-pull custom saved settings or trigger onboarding.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      if (activeUser) {
         setCurrentUser(activeUser);
         checkAndPullProfile(activeUser);
      } else {
        const guestUserJson = localStorage.getItem("skill_mapper_guest_user");
        if (guestUserJson) {
          const guestUser = JSON.parse(guestUserJson);
          setCurrentUser(guestUser);
          checkAndPullProfile(guestUser);
        } else {
          setCheckingCloudAuth(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      if (activeUser) {
        setCurrentUser(activeUser);
        checkAndPullProfile(activeUser);
      } else {
        // Fallback to offline guest in local storage if present
        const guestUserJson = localStorage.getItem("skill_mapper_guest_user");
        if (guestUserJson) {
          const guestUser = JSON.parse(guestUserJson);
          setCurrentUser(guestUser);
          checkAndPullProfile(guestUser);
        } else {
          setCurrentUser(null);
          setCheckingCloudAuth(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndPullProfile = async (activeUser: any) => {
    setCheckingCloudAuth(true);
    try {
      const userId = activeUser.id || "guest-user";
      const isGuestOnly = userId === "guest-user";

      // For registered DB users (non-guest), try fetching from SQLite DB first
      if (!isGuestOnly) {
        try {
          // Fetch profile from DB
          const { data: profileCheck } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          // Fetch latest mapping results
          const { data: resultsCheck } = await supabase
            .from("mapping_results")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1);

          const latestResult = Array.isArray(resultsCheck) ? resultsCheck[0] : resultsCheck;

          if (profileCheck && latestResult) {
            const pulledProfile: OnboardingProfile = {
              name: profileCheck.name || activeUser.raw_user_meta_data?.name || activeUser.email?.split("@")[0] || "Candidate",
              degree: profileCheck.degree || "",
              experienceLevel: profileCheck.experience_level || "Junior (1-2 Years)",
              careerGoal: profileCheck.career_goal || "",
              knownSkills: profileCheck.known_skills || [],
              resumeText: latestResult.resume_analysis?.raw_resume_text || profileCheck.resume_text || ""
            };

            const pulledResults: ProfileMappingResults = {
              skills: latestResult.skills || [],
              skillGaps: latestResult.skill_gaps || [],
              careerPaths: latestResult.career_paths || [],
              resumeAnalysis: latestResult.resume_analysis || {
                atsScore: 0,
                strengths: [],
                improvements: [],
                formattingScore: 0,
                keywordCompleteness: 0,
                atsFeedback: ""
              },
              learningRoadmap: latestResult.learning_roadmap || []
            };

            setUserProfile(pulledProfile);
            setResults(pulledResults);
            setIsOnboarding(false);
            setActiveTab("dashboard");
            return; // Success, stop here!
          }
        } catch (dbErr) {
          console.warn("Failed to retrieve profile/results from database, checking localStorage fallback:", dbErr);
        }
      }

      // LocalStorage Fallback (or pure Guest route)
      const savedProfile = isGuestOnly
        ? localStorage.getItem("skill_mapper_guest_user_profile")
        : localStorage.getItem(`skill_mapper_user_profile_${userId}`);

      const savedResults = isGuestOnly
        ? localStorage.getItem("skill_mapper_guest_analysis_results")
        : localStorage.getItem(`skill_mapper_analysis_results_${userId}`);

      if (savedProfile && savedResults) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          const parsedResults = JSON.parse(savedResults);
          setUserProfile(parsedProfile);
          setResults(parsedResults);
          setIsOnboarding(false);
          setActiveTab("dashboard");
        } catch {
          // Corrupted cache — send to onboarding
          setIsOnboarding(true);
          setActiveTab("onboarding");
        }
      } else {
        // No saved data — only force onboarding for non-guests
        if (isGuestOnly) {
          setActiveTab("landing");
          setIsOnboarding(false);
        } else {
          setIsOnboarding(true);
          setActiveTab("onboarding");
        }
      }
    } catch (err) {
      console.error("Auth sync error:", err);
      setIsOnboarding(true);
      setActiveTab("onboarding");
    } finally {
      setCheckingCloudAuth(false);
    }
  };

  // Persist session parameters
  useEffect(() => {
    if (userProfile && currentUser) {
      if (currentUser.id === "guest-user" || currentUser.guest) {
        localStorage.setItem("skill_mapper_guest_user_profile", JSON.stringify(userProfile));
      } else {
        localStorage.setItem(`skill_mapper_user_profile_${currentUser.id}`, JSON.stringify(userProfile));
      }
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    if (results && currentUser) {
      if (currentUser.id === "guest-user" || currentUser.guest) {
        localStorage.setItem("skill_mapper_guest_analysis_results", JSON.stringify(results));
      } else {
        localStorage.setItem(`skill_mapper_analysis_results_${currentUser.id}`, JSON.stringify(results));
      }
    }
  }, [results, currentUser]);

  // Route Guard: Redirect logout users away from private content and route logged in users to dashboard
  useEffect(() => {
    const privateTabs = ["dashboard", "onboarding", "resume", "skills", "career", "learning", "trends", "interview", "mentor"];
    if (!currentUser && privateTabs.includes(activeTab)) {
      setActiveTab("landing");
      setIsOnboarding(false);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (currentUser && results && activeTab === "landing") {
      setActiveTab("dashboard");
    }
  }, [results, currentUser, activeTab]);

  const handleAddSkillChip = (skill: string) => {
    const clean = skill.trim();
    if (clean && !skillsList.includes(clean)) {
      setSkillsList([...skillsList, clean]);
    }
  };

  const handleRemoveSkillChip = (skillName: string) => {
    setSkillsList(skillsList.filter(s => s !== skillName));
  };

  const handleStartOnboarding = () => {
    if (!currentUser) {
      setActiveTab("auth");
    } else {
      setIsOnboarding(true);
      setActiveTab("onboarding");
    }
  };

  const handleTriggerAnalysis = async (profileData: OnboardingProfile) => {
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const resp = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (!resp.ok) {
        throw new Error("Analysis failed. Please verify configurations.");
      }
      const data = await resp.json();
      setResults(data);
      setUserProfile(profileData);
      setIsOnboarding(false);
      setActiveTab("dashboard");

      // Automate saving results in the background if a cloud session or guest session is active
      if (currentUser?.id === "guest-user" || currentUser?.guest) {
        localStorage.setItem("skill_mapper_guest_user_profile", JSON.stringify(profileData));
        localStorage.setItem("skill_mapper_guest_analysis_results", JSON.stringify(data));
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Automating profile sync for uuid:", session.user.id);
          const { error: profileErr } = await supabase
            .from("user_profiles")
            .upsert({
              id: session.user.id,
              name: profileData.name,
              degree: profileData.degree,
              experience_level: profileData.experienceLevel,
              career_goal: profileData.careerGoal,
              known_skills: profileData.knownSkills,
              updated_at: new Date().toISOString()
            });

          if (profileErr) {
            console.error("Automated profile sync warning:", profileErr);
          }

          const { error: resultsErr } = await supabase
            .from("mapping_results")
            .insert({
              user_id: session.user.id,
              skills: data.skills,
              skill_gaps: data.skillGaps,
              career_paths: data.careerPaths,
              resume_analysis: data.resumeAnalysis,
              learning_roadmap: data.learningRoadmap
            });

          if (resultsErr) {
            console.error("Automated mapping results write warning:", resultsErr);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Something went wrong during dynamic AI evaluation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !careerGoal.trim()) return;

    const profileData: OnboardingProfile = {
      name: name.trim(),
      degree: degree.trim(),
      experienceLevel,
      careerGoal: careerGoal.trim(),
      knownSkills: skillsList,
      resumeText: resumeText.trim()
    };
    handleTriggerAnalysis(profileData);
  };

  // Removed handleLoadDemo — no more mock/demo profiles.
  // Users must fill in their own real information and upload their resume.

  const handleResetSession = () => {
    // Purge local Cache
    localStorage.removeItem("skill_mapper_user_profile");
    localStorage.removeItem("skill_mapper_analysis_results");
    localStorage.removeItem("skill_mapper_completed_topics");
    setUserProfile(null);
    setResults(null);
    setName("");
    setDegree("");
    setSkillsList([]);
    setSkillsInput("");
    setResumeText("");
    setActiveTab("landing");
  };

  const handleSignOut = async () => {
    setCheckingCloudAuth(true);
    try {
      localStorage.removeItem("skill_mapper_guest_user");
      localStorage.removeItem("skill_mapper_guest_user_profile");
      localStorage.removeItem("skill_mapper_guest_analysis_results");
      localStorage.removeItem("skill_mapper_completed_topics");
      localStorage.removeItem("skill_mapper_user_profile");
      localStorage.removeItem("skill_mapper_analysis_results");
      
      setUserProfile(null);
      setResults(null);
      setCurrentUser(null);
      setName("");
      setDegree("");
      setSkillsList([]);
      setSkillsInput("");
      setResumeText("");
      
      await supabase.auth.signOut();
      setActiveTab("landing");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setCheckingCloudAuth(false);
    }
  };

  // Sync / Import extra skills mapping out of git
  const handleImportedGitSkills = (newSkills: string[]) => {
    if (!userProfile) return;
    const mergedSkills = Array.from(new Set([...userProfile.knownSkills, ...newSkills]));
    const updatedProfile = { ...userProfile, knownSkills: mergedSkills };
    handleTriggerAnalysis(updatedProfile);
  };

  // Persists custom in-view edits from the Skill Analyzer matrix directly in Supabase or Local Caches
  const handleSaveSkillsResults = async (newSkills: any[], newGaps: any[]) => {
    if (!results) return;
    
    // 1. Update the local results state
    const updatedResults = {
      ...results,
      skills: newSkills,
      skillGaps: newGaps
    };
    setResults(updatedResults);

    // 2. Also update userProfile knownSkills array to match the updated list of skill names
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        knownSkills: newSkills.map(s => s.name)
      };
      setUserProfile(updatedProfile);

      // Save to local auth/guest cache
      if (currentUser?.id === "guest-user" || currentUser?.guest) {
        localStorage.setItem("skill_mapper_guest_user_profile", JSON.stringify(updatedProfile));
        localStorage.setItem("skill_mapper_guest_analysis_results", JSON.stringify(updatedResults));
      } else {
        localStorage.setItem(`skill_mapper_user_profile_${currentUser.id}`, JSON.stringify(updatedProfile));
        localStorage.setItem(`skill_mapper_analysis_results_${currentUser.id}`, JSON.stringify(updatedResults));
        
        // Save to Supabase Cloud
        try {
          const { error: profileErr } = await supabase
            .from("user_profiles")
            .upsert({
              id: currentUser.id,
              name: updatedProfile.name,
              degree: updatedProfile.degree,
              experience_level: updatedProfile.experienceLevel,
              career_goal: updatedProfile.careerGoal,
              known_skills: updatedProfile.knownSkills,
              updated_at: new Date().toISOString()
            });

          if (profileErr) console.error("Error syncing profile:", profileErr);

          const { error: resultsErr } = await supabase
            .from("mapping_results")
            .insert({
              user_id: currentUser.id,
              skills: updatedResults.skills,
              skill_gaps: updatedResults.skillGaps,
              career_paths: updatedResults.careerPaths,
              resume_analysis: updatedResults.resumeAnalysis,
              learning_roadmap: updatedResults.learningRoadmap
            });

          if (resultsErr) console.error("Error inserting database results:", resultsErr);
        } catch (dbErr) {
          console.error("Database upsert failed:", dbErr);
        }
      }
    }
  };

  const handleUpdateResumeText = (updatedText: string) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, resumeText: updatedText };
    handleTriggerAnalysis(updatedProfile);
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard": return "Dashboard";
      case "resume": return "Resume Scorer";
      case "skills": return "Skill Analytics";
      case "career": return "Career Mapper";
      case "learning": return "Learning Roadmaps";
      case "trends": return "Market Intelligence";
      case "interview": return "Interview Prep";
      case "mentor": return "AI Career Mentor";
      case "supabase": return "Account Settings";
      default: return "Dashboard";
    }
  };

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard Hub", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "resume", label: "Resume Scorer", icon: <FileText className="w-4 h-4" /> },
    { id: "skills", label: "Skill Analytics", icon: <Cpu className="w-4 h-4" /> },
    { id: "career", label: "Career Mapper", icon: <Compass className="w-4 h-4" /> },
    { id: "learning", label: "Learning Roadmaps", icon: <BookOpen className="w-4 h-4" /> },
    { id: "trends", label: "Market Intelligence", icon: <LineChart className="w-4 h-4" /> },
    { id: "interview", label: "Interview Prep", icon: <Terminal className="w-4 h-4" /> },
    { id: "mentor", label: "AI Career Mentor", icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className={`font-sans antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-900 ${
      isDarkMode ? "bg-[#0D1117] text-[#C9D1D9] theme-dark" : "bg-[#F8FAFC] text-slate-800 theme-light"
    }`}>
      
      {/* 0. Initial Boot Auth Loader */}
      {checkingCloudAuth && (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-gray-500 mt-4 uppercase tracking-widest animate-pulse">Syncing Secure User Context...</p>
        </div>
      )}
      
      {/* 1. Glass Loader Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="relative flex flex-col items-center space-y-6 max-w-sm text-center px-6">
              {/* Spinning holographic icon */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 w-fit h-fit p-12 bg-gradient-to-tr from-cyan-500/10 to-purple-600/10 blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin relative z-10" />
                <Sparkles className="absolute top-2 right-2 w-5 h-5 text-purple-400 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Skill Mapping Algorithm Active</h3>
                <p className="text-gray-400 text-xs">
                  We are parsing your experience, calculating ATS compliance metrics, framing a custom interactive roadmap syllabus, and scanning job demand trends with Gemini GenAI...
                </p>
              </div>

              <div className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 tracking-wider">
                <span>CONNECTING INTEL VECTORS</span>
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Landing Layout Router */}
      {activeTab === "landing" && !isOnboarding && (
        <LandingScreen
          onStartOnboarding={handleStartOnboarding}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          userProfile={userProfile}
          results={results}
          onUpdateSession={(pulledProfile, pulledResults) => {
            setUserProfile(pulledProfile);
            setResults(pulledResults);
            setIsOnboarding(false);
            setActiveTab("dashboard");
          }}
          onLoginAsGuest={(guestName) => {
            const guestUser = {
              id: "guest-user",
              email: "guest@skillmapper.local",
              guest: true,
              raw_user_meta_data: { name: guestName }
            };
            localStorage.setItem("skill_mapper_guest_user", JSON.stringify(guestUser));
            setCurrentUser(guestUser);
            checkAndPullProfile(guestUser);
          }}
          onLogoutGuest={handleSignOut}
          onNewUser={() => {
            setIsOnboarding(true);
            setActiveTab("onboarding");
          }}
          onLoginSuccess={(loggedInUser) => {
            setCurrentUser(loggedInUser);
            checkAndPullProfile(loggedInUser);
          }}
        />
      )}

      {/* 2.5 Auth Page Form Gate */}
      {activeTab === "auth" && (
        <div className={`min-h-screen flex flex-col justify-between transition-colors duration-305 ${
          isDarkMode ? "bg-[#0D1117] text-[#C9D1D9]" : "bg-[#F8FAFC] text-slate-800"
        }`}>
          {/* Background Neon Orbs */}
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none opacity-55" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-950/15 rounded-full blur-[120px] pointer-events-none opacity-55" />

          {/* Simple header */}
          <header className={`border-b px-6 py-4 backdrop-blur-xl relative z-10 ${
            isDarkMode ? "border-slate-800/85 bg-slate-950/40" : "border-slate-200 bg-white/75"
          }`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className={`font-extrabold tracking-tight text-lg ${isDarkMode ? "text-white" : "text-indigo-950"}`}>
                  SKILL MAPPER
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("landing");
                  setIsOnboarding(false);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white bg-slate-900 hover:bg-slate-850 border-gray-800"
                    : "text-slate-705 hover:text-slate-950 bg-white hover:bg-slate-50 border-slate-205"
                }`}
              >
                Back to Launchpad
              </button>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-grow flex flex-col items-center justify-center w-full relative z-10">
            <div className="w-full">
              <SupabaseAuthView
                isDarkMode={isDarkMode}
                userProfile={userProfile}
                results={results}
                onUpdateSession={(pulledProfile, pulledResults) => {
                  setUserProfile(pulledProfile);
                  setResults(pulledResults);
                  setIsOnboarding(false);
                  setActiveTab("dashboard");
                }}
                onLoginAsGuest={(guestName) => {
                  const guestUser = {
                    id: "guest-user",
                    email: "guest@skillmapper.local",
                    guest: true,
                    raw_user_meta_data: { name: guestName }
                  };
                  localStorage.setItem("skill_mapper_guest_user", JSON.stringify(guestUser));
                  setCurrentUser(guestUser);
                  checkAndPullProfile(guestUser);
                }}
                onLogoutGuest={() => {
                  setCurrentUser(null);
                  localStorage.removeItem("skill_mapper_guest_user");
                  localStorage.removeItem("skill_mapper_guest_user_profile");
                  localStorage.removeItem("skill_mapper_guest_analysis_results");
                  setUserProfile(null);
                  setResults(null);
                  setActiveTab("landing");
                }}
              />
            </div>
          </main>
        </div>
      )}

      {/* 3. Onboarding Form Sequence */}
      {isOnboarding && activeTab === "onboarding" && (
        <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${
          isDarkMode ? "bg-[#0D1117] text-[#C9D1D9]" : "bg-[#F8FAFC] text-slate-800"
        }`}>
          {/* Neon orbs */}
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none opacity-60" />

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-7xl border rounded-2xl p-6 md:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative z-10 space-y-6 text-left transition-colors duration-300 ${
              isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            {/* Onboard Header */}
            <div className={`flex justify-between items-start border-b pb-4 ${
              isDarkMode ? "border-slate-800" : "border-slate-100"
            }`}>
              <div>
                <span className="text-[10px] font-mono text-cyan-600 tracking-widest font-bold uppercase">PROFILE CALIBRATOR</span>
                <h3 className={`text-xl md:text-2xl font-extrabold mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>AI Profile Calibration</h3>
              </div>
              <button
                onClick={() => {
                  setIsOnboarding(false);
                  setActiveTab("landing");
                }}
                className={`p-1.5 border rounded-lg transition-colors ${
                  isDarkMode ? "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-gray-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-550"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {analysisError && (
              <div className="p-3.5 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* COLUMN 1: Profile & Skills Details */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold">NAME / ALIAS</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-gray-850 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-cyan-500/40 font-semibold"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>
                {/* Degree / Current status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold">CURRENT DEGREE / TITLE</label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-gray-850 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-cyan-500/40 font-semibold"
                    placeholder="e.g. B.Tech CS / Tech Associate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exp Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold">EXPERIENCE GRADE</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-gray-850 rounded-lg text-xs text-gray-250 focus:outline-none focus:border-cyan-500/40 font-mono"
                  >
                    <option>Entry Level (Fresher)</option>
                    <option>Junior (1-2 Years)</option>
                    <option>Mid-Level (3-5 Years)</option>
                    <option>Senior (6+ Years)</option>
                  </select>
                </div>
                {/* Target Career Roles */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold">TARGET CAREER GOAL</label>
                  <input
                    type="text"
                    required
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-gray-850 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-cyan-500/40 font-semibold"
                    placeholder="e.g. AI Architect, Full Stack Developer"
                  />
                </div>
              </div>

              {/* Skills selectors */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold">KNOWN STACK SKILLS</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="flex-grow p-2.5 bg-slate-950 border border-gray-850 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-cyan-500/30 font-semibold"
                    placeholder="Type tool / tech skill (e.g. Flask, Docker)"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSkillChip(skillsInput);
                      setSkillsInput("");
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-900 border border-gray-850 hover:border-cyan-500/30 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected skills list chips */}
                {skillsList.length > 0 && (
                  <div className="p-3 border border-gray-850 bg-slate-950/40 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase block tracking-wider">SELECTED CAPABILITIES</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skillsList.map((sk) => (
                        <span key={sk} className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-950/20 text-cyan-300 border border-cyan-800/30 font-mono text-xs rounded-lg">
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillChip(sk)}
                            className="text-[10px] text-cyan-500 hover:text-cyan-300 font-extrabold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular recommendations presets */}
                <div className="flex flex-wrap gap-1 items-center pt-2">
                  <span className="text-[10px] font-mono text-gray-500 mr-2 uppercase">RECOMMENDED CHIPS:</span>
                  {popularSkills.slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkillChip(skill)}
                      className="px-2 py-0.5 bg-slate-950 border border-gray-850 text-[10px] text-gray-400 rounded-lg hover:text-white hover:border-cyan-500/30 transition-all font-mono"
                    >
                      +{skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Resume Scorer File Upload & Dynamic Outline Extractor */}
            <div className="space-y-5">
              {/* Drag and drop resume upload or manual text area */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
                    UPLOAD RESUME OR ENTER EXPERIENCE (ATS SCORER)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-500 font-semibold bg-cyan-950/20 px-2 py-0.5 rounded">
                    Supports PDF, TXT, DOCX
                  </span>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative ${
                    dragActive
                      ? "border-cyan-500 bg-cyan-950/20"
                      : isDarkMode 
                        ? "border-slate-800 bg-slate-950/40 hover:border-slate-705" 
                        : "border-slate-300 bg-slate-50/50 hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                      <FileText className="w-6 h-6 animate-pulse" />
                    </div>
                    
                    {uploadState === "idle" && (
                      <div className="space-y-1">
                        <p className={`text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>
                          Drag & Drop your Resume here, or <span className="text-cyan-400 underline">browse computer</span>
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Automatically extracts credentials, profile headings, and project coordinates
                        </p>
                      </div>
                    )}

                    {uploadState === "uploading" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 justify-center">
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                          <p className="text-xs font-semibold text-cyan-400 font-mono">ATS ENGINE: RECONSTRUCTING INTEL VECTORS...</p>
                        </div>
                        <p className="text-[10px] text-gray-400">Reading: {uploadedFileName}</p>
                      </div>
                    )}

                    {uploadState === "success" && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                          <span>🎉 Uploaded {uploadedFileName} successfully!</span>
                        </p>
                        <p className="text-[10px] text-gray-450">
                          Resume content extracted. Feel free to view or modify details below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience text preview/editor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                      EXTRACTED OUTLINE / PASTE AREA
                    </span>
                    {resumeText ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResumeText("");
                          setUploadState("idle");
                          setUploadedFileName("");
                        }}
                        className="text-[10px] font-mono text-rose-450 hover:underline"
                      >
                        Clear Raw Text
                      </button>
                    ) : null}
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full h-24 p-2.5 bg-slate-950 border border-gray-850 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-cyan-500/40 font-mono leading-relaxed pointer-events-auto"
                    placeholder="Wait for file upload to parse, or paste previous role experience descriptions, projects narrative, and key credentials manually here..."
                  />
                </div>
              </div>
              {/* Action submits */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-xs font-semibold text-white rounded-xl shadow-xl shadow-cyan-950/10 transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isAnalyzing ? "Analyzing..." : "Build My Skill Map"}</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </form>
          </motion.div>
        </div>
      )}

      {/* 4. Active Main Core Dashboard Portal */}
      {currentUser && results && userProfile && !isOnboarding && (
        <div id="dashboard-portal-root" className={`min-h-screen flex flex-col lg:flex-row relative overflow-x-hidden transition-colors duration-300 ${isDarkMode ? "bg-[#0D1117] text-[#C9D1D9] theme-dark" : "bg-[#F8FAFC] text-slate-800 theme-light"}`}>
          
          {/* LEFT SIDEBAR (Standard matching the reference exactly) */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out border-r flex flex-col justify-between ${
            isDarkMode 
              ? "bg-[#0F172A] border-slate-800 text-gray-100" 
              : "bg-white border-slate-200 text-slate-800"
          } ${isMobileMenuOpen ? "translate-x-0" : ""}`}>
            
            {/* Sidebar Branding Header */}
            <div>
              <div className={`h-16 px-6 flex items-center justify-between border-b ${
                isDarkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-sm flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className={`font-extrabold tracking-tight text-lg ${
                    isDarkMode ? "text-white" : "text-indigo-950"
                  }`}>SKILL MAPPER</span>
                </div>
                {/* Mobile menu close button inside sidebar */}
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Links mapping */}
              <nav className="p-4 space-y-1.5 flex-grow">
                <span className={`text-[10px] font-mono uppercase tracking-widest block mb-3 px-3.5 ${
                  isDarkMode ? "text-gray-500" : "text-slate-400"
                }`}>
                  Core Mapping Links
                </span>
                {sidebarLinks.map((link) => {
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl transition-all duration-150 flex items-center gap-3.5 text-left border-l-4 ${
                        isActive
                           ? isDarkMode
                            ? "bg-slate-800/80 font-bold text-cyan-400 border-cyan-400 shadow shadow-cyan-500/10"
                            : "bg-indigo-50 font-bold text-indigo-600 border-indigo-600 shadow-sm"
                           : isDarkMode
                            ? "border-transparent text-gray-450 hover:text-white hover:bg-slate-800/30"
                            : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className={isActive ? (isDarkMode ? "text-cyan-400" : "text-indigo-600") : "text-slate-400"}>
                        {link.icon}
                      </span>
                      <span className="text-xs font-semibold">{link.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom User Profile card with Clear Logout Action */}
            <div className={`p-4 border-t ${
              isDarkMode 
                ? "border-slate-800/80 bg-[#0B0F19]/60" 
                : "border-slate-150 bg-slate-50/70"
            }`}>
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-indigo-500/20 flex-shrink-0">
                  {userProfile.name ? userProfile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "MA"}
                </div>
                <div className="min-w-0 flex-grow text-left">
                  <span className={`text-xs font-bold block truncate ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}>{userProfile.name}</span>
                  <span className={`text-[10px] block truncate font-mono ${
                    isDarkMode ? "text-gray-400" : "text-slate-500"
                  }`}>
                    {userProfile.careerGoal || "Specialist"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsOnboarding(true)}
                  className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold text-center transition-all flex items-center justify-center gap-1 ${
                    isDarkMode 
                      ? "bg-[#111827] border-slate-800 hover:border-slate-700 text-gray-300" 
                      : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                  title="Calibrate your onboarding settings"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Calibrate</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-1.5 px-2 bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white text-[10px] font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Log out and return to Launchpad"
                >
                  <LogOut className="w-3 h-3 text-white" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* BACKGROUND SHADE FOR SIDEBAR MODAL WHEN OPEN IN MOBILE */}
          {isMobileMenuOpen && (
            <div 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-30 lg:hidden"
            />
          )}

          {/* RIGHT VIEW PANE CONTAINER */}
          <div className="flex-grow lg:pl-64 flex flex-col min-h-screen">
            
            {/* NAVIGATION HEADER BAR (Matches the reference screenshot with user avatar and parameters) */}
            <header className={`sticky top-0 z-30 h-16 border-b px-4 md:px-6 flex items-center justify-between select-none ${
              isDarkMode 
                ? "bg-[#0F172A]/85 border-slate-800 text-gray-100 backdrop-blur-md" 
                : "bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md"
            }`}>
              
              {/* Header Page Title with Dynamic Map Title */}
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                >
                  <Menu className="w-5 h-5 text-slate-500" />
                </button>
                <h2 className={`font-extrabold text-sm sm:text-base md:text-xl tracking-tight truncate ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>
                  {getTabTitle(activeTab)}
                </h2>
              </div>

              {/* Header Right Widgets Menu */}
              <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                
                {/* Theme Selector Moon/Sun */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title="Toggle Light/Dark Theme"
                  className={`p-1.5 md:p-2 rounded-lg transition-colors duration-155 flex-shrink-0 ${
                    isDarkMode ? "hover:bg-slate-800 text-amber-400" : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 md:w-4.5 md:h-4.5" /> : <Moon className="w-4 h-4 md:w-4.5 md:h-4.5" />}
                </button>

                {/* Notification Bell Badge */}
                <button
                  title="System Notifications"
                  className={`p-1.5 md:p-2 rounded-lg relative transition-colors duration-150 flex-shrink-0 ${
                    isDarkMode ? "hover:bg-slate-800 text-gray-400" : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  <Bell className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-transparent" />
                </button>

                {/* Vertical Divider Line */}
                <div className={`w-px h-5 md:h-6 flex-shrink-0 ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />

                {/* Profile Meta Info with Avatar */}
                <div className="flex items-center gap-1 sm:gap-2.5 font-sans flex-shrink-0 font-sans">
                  {/* Circle User Initial Badge Avatar */}
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-1 md:ring-2 ring-indigo-155 flex-shrink-0">
                    {userProfile.name ? userProfile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "MA"}
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN CORE PANELS GRID */}
            <main className="flex-grow p-3 lg:p-4 overflow-y-auto">
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "dashboard" && (
                      <DashboardHome
                        results={results}
                        onNavigate={(tab) => setActiveTab(tab)}
                        isDarkMode={isDarkMode}
                      />
                    )}

                    {activeTab === "resume" && (
                      <ResumeIntelligenceView
                        results={results}
                        onUpdateResumeText={handleUpdateResumeText}
                        isAnalyzing={isAnalyzing}
                        isDarkMode={isDarkMode}
                      />
                    )}

                    {activeTab === "skills" && (
                      <SkillAnalyzerView
                        results={results}
                        onImportSkills={handleImportedGitSkills}
                        onSaveSkillsResults={handleSaveSkillsResults}
                        isDarkMode={isDarkMode}
                      />
                    )}

                    {activeTab === "career" && (
                      <CareerMapperView
                        results={results}
                        onNavigate={(tab) => setActiveTab(tab)}
                        isDarkMode={isDarkMode}
                      />
                    )}

                    {activeTab === "learning" && (
                      <LearningHubView
                        results={results}
                        isDarkMode={isDarkMode}
                      />
                    )}

                    {activeTab === "trends" && (
                      <MarketTrendsView
                        careerGoal={userProfile.careerGoal}
                      />
                    )}

                    {activeTab === "interview" && (
                      <InterviewPrepView
                        careerGoal={userProfile.careerGoal}
                        selectedSkills={userProfile.knownSkills}
                      />
                    )}

                    {activeTab === "mentor" && (
                      <MentorChatView
                        userProfile={userProfile}
                        results={results}
                        isDarkMode={isDarkMode}
                        onNavigate={(tab) => setActiveTab(tab)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
