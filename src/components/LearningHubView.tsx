import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Award, CheckCircle, Clock, ExternalLink, Sparkles, 
  AlertCircle, Terminal, HelpCircle, Flame, Zap, Compass, Cpu, 
  RotateCw, RefreshCw, BarChart2, CheckSquare, Square, Check,
  Target, GraduationCap, ArrowRight, ShieldCheck, PlayCircle, Loader2
} from "lucide-react";
import { ProfileMappingResults, LearningRoadmapPhase, RoadmapTopic } from "../types";

// Extended interactive types for local mutated state support
interface ExtendedTopic extends RoadmapTopic {
  id?: string;
  status?: "Pending" | "Completed";
}

interface ExtendedPhase extends Omit<LearningRoadmapPhase, "topics"> {
  topics: ExtendedTopic[];
  progress?: number;
}

interface RecommendedCourse {
  name: string;
  platform: string;
  type: string;
  duration?: string;
  rating?: number;
}

interface RecommendedProject {
  title: string;
  description: string;
  skillsUtilized: string[];
  complexity: string;
  estimatedHours: number;
}

interface RecommendedCertification {
  name: string;
  provider: string;
  relevance: string;
  valueIndex: number;
}

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
    description: "Ensure machine learning reliability, deploy pipelines tracking performance metrics, adjust live drift benchmarks, and coordinate model registries."
  }
];

interface LearningHubViewProps {
  results: ProfileMappingResults | null;
  isDarkMode?: boolean;
}

export default function LearningHubView({ results, isDarkMode = true }: LearningHubViewProps) {
  // 1. Maintain mutable roadmap locally for full Adaptive AI Engine interaction
  const [localRoadmap, setLocalRoadmap] = useState<ExtendedPhase[]>([]);
  const [activePhaseId, setActivePhaseId] = useState<number>(1);
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem("skill_mapper_completed_topics");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Interactive recommendation states
  const [selectedSkillForRecommender, setSelectedSkillForRecommender] = useState<string>("");
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<RecommendedProject[]>([]);
  const [recommendedCertifications, setRecommendedCertifications] = useState<RecommendedCertification[]>([]);
  
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [isLoadingCerts, setIsLoadingCerts] = useState<boolean>(false);
  
  // Adaptive AI trigger state
  const [isUpdatingAdaptively, setIsUpdatingAdaptively] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [streakCount, setStreakCount] = useState<number>(7);

  // 2. Career specific multi-roadmaps state cache
  const [roadmapsByCareer, setRoadmapsByCareer] = useState<Record<string, ExtendedPhase[]>>(() => {
    const saved = localStorage.getItem("skill_mapper_roadmaps_by_career");
    return saved ? JSON.parse(saved) : {};
  });

  const [activeCareerPathName, setActiveCareerPathName] = useState<string>(() => {
    const saved = localStorage.getItem("skill_mapper_active_career_path_name");
    return saved || "";
  });

  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);

  // Compute standard roles with compatibility metrics dynamically to match Career Mapper's 6 options
  const userSkillItems = results?.skills || [];
  const userSkillNames = userSkillItems.map(s => s.name);
  const userExperienceGrade = results?.learningRoadmap?.[0] ? "Mid-Level Professional" : "Junior (1-2 Years)";

  const combinedCareerPaths = CAREER_ROLES_DB.map((role) => {
    const matchedSkills = role.required_skills.filter(reqSkill =>
      userSkillNames.some(item => {
        const itemL = (item || "").toLowerCase();
        const reqL = (reqSkill || "").toLowerCase();
        return itemL.includes(reqL) || reqL.includes(itemL);
      })
    );

    const skillScore = (matchedSkills.length / role.required_skills.length) * 100;
    const projectScore = userSkillItems.length > 5 ? 85 : 72;
    const expScore = userExperienceGrade.includes("Mid") ? 85 : 70;
    const certScore = matchedSkills.length > 2 ? 85 : 65;
    const marketScore = role.market_demand === "Very High" ? 95 : role.market_demand === "High" ? 85 : 72;
    const isGoalCorrelated = results?.careerPaths?.some(cp => cp?.title?.toLowerCase()?.includes((role.role_name || "").toLowerCase()));
    const interestScore = isGoalCorrelated ? 95 : 65;

    const compatPercent = Math.round(
      skillScore * 0.40 +
      projectScore * 0.20 +
      expScore * 0.15 +
      certScore * 0.10 +
      marketScore * 0.10 +
      interestScore * 0.05
    );

    return {
      title: role.role_name,
      matchScore: compatPercent,
      salaryRange: role.salary_range,
      marketDemand: role.market_demand as "Very High" | "High" | "Medium" | "Low",
      description: role.description
    };
  });

  // Auto-initialize active roadmap name if not set
  useEffect(() => {
    if (combinedCareerPaths.length > 0 && !activeCareerPathName) {
      const primaryGoal = combinedCareerPaths[0].title;
      setActiveCareerPathName(primaryGoal);
      localStorage.setItem("skill_mapper_active_career_path_name", primaryGoal);
    }
  }, [results, activeCareerPathName, combinedCareerPaths]);

  // Sync current active roadmap matching the active career path choice
  useEffect(() => {
    if (!results) return;

    const currentTarget = activeCareerPathName || (combinedCareerPaths[0]?.title || "Lead Specialist");

    // Pull from career roads cache if exists
    if (roadmapsByCareer[currentTarget] && roadmapsByCareer[currentTarget].length > 0) {
      const synced = roadmapsByCareer[currentTarget].map(phase => ({
        ...phase,
        topics: phase.topics.map(t => ({
          ...t,
          status: (completedTopics.includes(t.name) ? "Completed" : "Pending") as "Pending" | "Completed"
        }))
      }));
      setLocalRoadmap(synced);
    } else if (results.learningRoadmap && results.learningRoadmap.length > 0) {
      // Fallback to initial roadmap if we are on the first primary target
      const isPrimary = combinedCareerPaths[0]?.title === currentTarget;
      if (isPrimary) {
        const initial = results.learningRoadmap.map(phase => ({
          ...phase,
          progress: 0,
          topics: phase.topics.map(t => ({
            ...t,
            status: (completedTopics.includes(t.name) ? "Completed" : "Pending") as "Pending" | "Completed"
        }))
        }));
        setLocalRoadmap(initial);
      } else {
        setLocalRoadmap([]);
      }
    }
  }, [results, activeCareerPathName, roadmapsByCareer, completedTopics]);

  // Sync completion tracker logic 
  useEffect(() => {
    localStorage.setItem("skill_mapper_completed_topics", JSON.stringify(completedTopics));
  }, [completedTopics]);

  // Update default recommended skill query value when career path changes
  useEffect(() => {
    if (results?.skillGaps && results.skillGaps.length > 0) {
      setSelectedSkillForRecommender(results.skillGaps[0].skillName);
    } else if (localRoadmap.length > 0 && localRoadmap[0].topics.length > 0) {
      setSelectedSkillForRecommender(localRoadmap[0].topics[0].name);
    }
  }, [results, activeCareerPathName]);

  if (!results) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-[#0B0F19]/40 text-center text-slate-400 space-y-4">
        <Cpu className="w-12 h-12 text-slate-600 animate-pulse mx-auto" />
        <h4 className="text-sm font-bold text-white">No active profile results found</h4>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Please upload your Resume or calibrate an interactive profile mapping on the dashboard to generate your AI study curriculum.
        </p>
      </div>
    );
  }

  // Find currently active phase mapping
  const currentPhase = localRoadmap.find(p => p.phaseNumber === activePhaseId) || localRoadmap[0];

  // Toggle completion checklists
  const handleToggleTopic = async (topicName: string) => {
    const isCompleted = completedTopics.includes(topicName);
    const updatedCompleted = isCompleted 
      ? completedTopics.filter(t => t !== topicName)
      : [...completedTopics, topicName];
    
    setCompletedTopics(updatedCompleted);

    // Call API route /api/update-progress dynamically
    try {
      const response = await fetch("/api/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalTopics,
          completedTopicsCount: updatedCompleted.length
        })
      });
      const data = await response.json();
      if (data.success) {
        setStreakCount(data.streak || streakCount);
      }
    } catch (e) {
      console.warn("Progress tracker api skipped fallback:", e);
    }
  };

  // Total statistics calculations
  const totalTopics = localRoadmap.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0) || 0;
  const completedNumber = completedTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedNumber / totalTopics) * 100) : 0;

  // Recommended actions trigger
  const handleFetchCourses = async (skill: string) => {
    if (!skill) return;
    setIsLoadingCourses(true);
    setRecommendedCourses([]);
    try {
      const res = await fetch("/api/recommended-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: skill, difficulty: "Medium" })
      });
      const data = await res.json();
      setRecommendedCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleFetchProjects = async (skill: string) => {
    if (!skill) return;
    setIsLoadingProjects(true);
    setRecommendedProjects([]);
    try {
      const res = await fetch("/api/recommended-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requiredSkills: [skill], difficulty: "Intermediate", careerRole: combinedCareerPaths[0]?.title })
      });
      const data = await res.json();
      setRecommendedProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleFetchCertifications = async (skill: string) => {
    if (!skill) return;
    setIsLoadingCerts(true);
    setRecommendedCertifications([]);
    try {
      const res = await fetch("/api/recommended-certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: skill })
      });
      const data = await res.json();
      setRecommendedCertifications(data.certifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCerts(false);
    }
  };

  // Adaptive Update - simulates receiving insights from other pages (flows connection)
  const triggerAdaptiveAIUpdate = async (type: string, description: string) => {
    setIsUpdatingAdaptively(true);
    setSuccessMessage("");
    try {
      const response = await fetch("/api/adaptive-roadmap-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRoadmap: localRoadmap,
          newTrigger: description,
          type: type
        })
      });
      const data = await response.json();
      if (data.updatedRoadmap) {
        setLocalRoadmap(data.updatedRoadmap);
        setSuccessMessage(`Adaptive Action Applied: Injected customized training modules based on ${type.replace("_", " ")}.`);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingAdaptively(false);
    }
  };

  // Compute individual progress per recommended career path safely
  const getCareerProgress = (careerName: string) => {
    const roadmap = roadmapsByCareer[careerName];
    if (!roadmap || roadmap.length === 0) {
      if (combinedCareerPaths[0]?.title === careerName && results?.learningRoadmap) {
        const total = results.learningRoadmap.reduce((acc, p) => acc + (p.topics?.length || 0), 0);
        const compl = results.learningRoadmap.flatMap(p => p.topics).filter(t => completedTopics.includes(t.name)).length;
        return total > 0 ? Math.round((compl / total) * 100) : 0;
      }
      return null;
    }
    const total = roadmap.reduce((acc, p) => acc + (p.topics?.length || 0), 0);
    const compl = roadmap.flatMap(p => p.topics).filter(t => completedTopics.includes(t.name)).length;
    return total > 0 ? Math.round((compl / total) * 100) : 0;
  };

  // Perform dynamic switching or API-based synthesis
  const handleSwitchCareerPath = async (careerTitle: string) => {
    setActiveCareerPathName(careerTitle);
    localStorage.setItem("skill_mapper_active_career_path_name", careerTitle);
    setActivePhaseId(1);

    const isPrimary = combinedCareerPaths[0]?.title === careerTitle;
    if (roadmapsByCareer[careerTitle] && roadmapsByCareer[careerTitle].length > 0) {
      return;
    }
    if (isPrimary && results?.learningRoadmap && results.learningRoadmap.length > 0) {
      return;
    }

    // Trigger AI generation on the spot
    setIsGeneratingRoadmap(true);
    setSuccessMessage(`Synthesizing tailored study roadmap for "${careerTitle}"...`);
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerGoal: careerTitle,
          currentSkills: results?.skills?.map(s => s.name) || [],
          skillGaps: results?.skillGaps || []
        })
      });
      const data = await response.json();
      if (data.roadmap) {
        const formattedRoadmap: ExtendedPhase[] = data.roadmap.map((phase: any) => ({
          ...phase,
          progress: 0,
          topics: (phase.topics || []).map((t: any) => ({
            ...t,
            status: completedTopics.includes(t.name) ? "Completed" : "Pending"
          }))
        }));

        setRoadmapsByCareer(prev => {
          const updated = {
            ...prev,
            [careerTitle]: formattedRoadmap
          };
          localStorage.setItem("skill_mapper_roadmaps_by_career", JSON.stringify(updated));
          return updated;
        });

        setSuccessMessage(`Tailored study roadmap for "${careerTitle}" generated successfully!`);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (e) {
      console.error("Failed to generate career roadmap", e);
      // Premium fallback structure
      const fallbackRoadmap: ExtendedPhase[] = [
        {
          phaseNumber: 1,
          title: `Milestone 1: Core Foundations for ${careerTitle}`,
          topics: [
            { name: `${careerTitle} Key Competencies & Tooling`, difficulty: "Medium", estimatedTime: "1-2 weeks" },
            { name: "Architectural Integration & Code Sprints", difficulty: "Medium", estimatedTime: "1 week" }
          ],
          recommendedCourses: [
            { name: `Advanced Industrial Guide for ${careerTitle}`, platform: "Coursera", type: "Course" }
          ],
          projects: [
            { title: `${careerTitle} Operational Orchestrator`, description: "Implement standard algorithms to route requests into isolated nodes safely.", skillsUtilized: ["TypeScript", "Docker"] }
          ]
        },
        {
          phaseNumber: 2,
          title: `Milestone 2: Industry Deployment Capstones`,
          topics: [
            { name: "Live Performance Checks & Logging Protocols", difficulty: "Hard", estimatedTime: "2-3 weeks" }
          ],
          recommendedCourses: [
            { name: `${careerTitle} Engineering Masterclass`, platform: "Udemy", type: "Course" }
          ],
          projects: [
            { title: "Distributed Analytics Dashboard", description: "Design an optimized metrics analyzer for real-time monitoring.", skillsUtilized: ["Python", "SQL"] }
          ]
        }
      ];

      setRoadmapsByCareer(prev => {
        const updated = {
          ...prev,
          [careerTitle]: fallbackRoadmap
        };
        localStorage.setItem("skill_mapper_roadmaps_by_career", JSON.stringify(updated));
        return updated;
      });
      setSuccessMessage(`Custom study blueprint generated for ${careerTitle}.`);
      setTimeout(() => setSuccessMessage(""), 4500);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div id="learning-system-module" className="space-y-6">
      
      {/* 1. PROGRESS TRACKER ENGINE BANNER */}
      <div className={`p-6 rounded-2xl border backdrop-blur relative overflow-hidden ${
        isDarkMode ? "border-slate-800 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B]/30 to-[#0F172A]" : "border-indigo-100 bg-gradient-to-r from-[#F8FAFC] via-indigo-50/50 to-[#F8FAFC] shadow-sm"
      }`}>
        <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 text-left w-full lg:w-2/3">
            <div className="flex items-center gap-2">
              <span className={`p-1 rounded-lg ${isDarkMode ? "bg-indigo-500/10 text-cyan-400" : "bg-indigo-50 text-indigo-600"}`}>
                <Compass className="w-5 h-5" />
              </span>
              <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>AI Learning Path System</h3>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Converting your <span className={`font-semibold ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>Skill Gaps</span> + <span className={`font-semibold ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>Career Goal ({activeCareerPathName || combinedCareerPaths[0]?.title || "Lead specialist"})</span> into a personalized structured road. Connects live with Resume, Skills Analyzer, and Market updates.
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                isDarkMode ? "bg-slate-900 border-slate-800/80 text-gray-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <Target className="w-3 h-3 text-cyan-500" /> Goal: {activeCareerPathName || combinedCareerPaths[0]?.title || "Cloud Architect"}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                isDarkMode ? "bg-slate-900 border-slate-800/80 text-gray-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <GraduationCap className="w-3 h-3 text-purple-500" /> Multi-module Connected Flow
              </span>
            </div>
          </div>

          {/* Quick Metrics & Streak Tracker */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Streak card */}
            <div className={`p-3.5 border rounded-xl space-y-1 text-center w-full sm:w-32 ${
              isDarkMode ? "bg-slate-950/80 border-slate-850" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>STREAK</span>
              </div>
              <span className={`text-2xl font-extrabold block font-mono ${isDarkMode ? "text-white" : "text-slate-900"}`}>{streakCount} Days</span>
              <span className={`text-[9px] font-mono block ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>Active learning habit</span>
            </div>

            {/* Total Completion percent */}
            <div className={`p-4 border rounded-xl space-y-1 text-center sm:text-left w-full sm:w-48 ${
              isDarkMode ? "bg-slate-950/80 border-indigo-950/40" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <span className={`text-[10px] font-mono block uppercase tracking-widest font-semibold ${isDarkMode ? "text-cyan-400" : "text-indigo-600"}`}>Syllabus Completion</span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className={`text-3xl font-black font-mono ${isDarkMode ? "text-white" : "text-slate-900"}`}>{progressPercent}%</span>
                <span className="text-[11px] text-emerald-500 font-mono">({completedNumber}/{totalTopics} Tasks)</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 border ${
                isDarkMode ? "bg-slate-900 border-slate-950" : "bg-slate-100 border-slate-200"
              }`}>
                <div 
                  className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 h-full transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Adaptive success banner container */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-3 border rounded-xl text-xs flex items-center gap-2 ${
                isDarkMode ? "bg-indigo-950/60 border-indigo-500/30 text-white" : "bg-indigo-50 border-indigo-200 text-indigo-850"
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-555 animate-pulse flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Target career roadmap switcher panel */}
      {combinedCareerPaths && combinedCareerPaths.length > 0 && (
        <div id="career-roadmap-selector-panel" className={`p-5 rounded-2xl border space-y-3 text-left ${
          isDarkMode ? "border-slate-800 bg-[#0F172A]/30" : "border-slate-205 bg-white shadow-sm"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className={`text-xs font-mono uppercase tracking-widest font-bold ${isDarkMode ? "text-[#94A3B8]" : "text-slate-500"}`}>Recommended Career Paths Roadmaps</h4>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-550"}`}>Switch between paths to follow them one by one. Progress is synchronized independently.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {combinedCareerPaths.map((cp, idx) => {
              const isActive = activeCareerPathName === cp.title;
              const progressVal = getCareerProgress(cp.title);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isGeneratingRoadmap}
                  onClick={() => handleSwitchCareerPath(cp.title)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group flex flex-col justify-between h-full cursor-pointer ${
                    isActive
                      ? isDarkMode 
                        ? "border-cyan-500/70 bg-[#0F172A]/70 shadow-lg shadow-cyan-950/20" 
                        : "border-cyan-500 bg-cyan-50/20 shadow-sm"
                      : isDarkMode 
                        ? "border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-750" 
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300"
                  }`}
                >
                  {/* Decorative faint background glow for active card */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-600/5 pointer-events-none" />
                  )}

                  <div className="w-full flex-grow flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <span className={`p-1 px-2 rounded text-[10px] font-bold font-mono border ${
                        isDarkMode ? "bg-slate-950 text-cyan-400 border-slate-850" : "bg-cyan-50 text-cyan-700 border-cyan-100"
                      }`}>
                        Match {cp.matchScore}%
                      </span>
                      {isActive ? (
                        <span className={`px-2 py-0.5 rounded text-[8px] tracking-wide font-extrabold uppercase border ${
                          isDarkMode ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-250"
                        }`}>
                          ACTIVE ROAD
                        </span>
                      ) : progressVal !== null ? (
                        <span className={`px-2 py-0.5 rounded text-[8px] tracking-wide font-extrabold uppercase border ${
                          isDarkMode ? "bg-indigo-955/45 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          MUTABLE SYLLABUS
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[8px] tracking-wide font-extrabold uppercase border ${
                          isDarkMode ? "bg-purple-950/30 text-purple-400 border-purple-900/30" : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                          AI ENGINE READY
                        </span>
                      )}
                    </div>

                    <h5 className={`text-sm font-bold mt-3 min-w-0 truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>{cp.title}</h5>
                    <p className={`text-[11px] mt-1 line-clamp-2 min-h-[32px] ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{cp.description}</p>
                  </div>

                  <div className={`mt-3 pt-3 border-t flex items-center justify-between w-full ${isDarkMode ? "border-slate-900" : "border-slate-150"}`}>
                    <span className={`text-[10px] font-mono ${isDarkMode ? "text-gray-500" : "text-slate-450"}`}>Market Demand: <span className={isDarkMode ? "text-gray-300 font-semibold" : "text-slate-700 font-semibold"}>{cp.marketDemand}</span></span>
                    {progressVal !== null ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono text-emerald-500 font-bold">{progressVal}% Progress</span>
                        <div className={`w-12 h-1 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-950" : "bg-slate-250"}`}>
                          <div className="bg-emerald-500 h-full" style={{ width: `${progressVal}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-mono font-bold flex items-center gap-1 flex-shrink-0 ${
                        isDarkMode ? "text-purple-400 group-hover:text-purple-300" : "text-indigo-600 group-hover:text-indigo-500"
                      }`}>
                        Build Path Roadmap
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Strategic Path Advisor & Sequence Architecture Panel */}
      {combinedCareerPaths && combinedCareerPaths.length > 0 && (() => {
        const sortedAdvisorPaths = [...combinedCareerPaths].sort((a, b) => b.matchScore - a.matchScore);
        const bestFit = sortedAdvisorPaths[0];

        const stage1Role = sortedAdvisorPaths[0];
        const stage2Role = sortedAdvisorPaths.find(r => r.title !== stage1Role?.title) || sortedAdvisorPaths[1] || stage1Role;
        const stage3Role = sortedAdvisorPaths.find(r => r.title !== stage1Role?.title && r.title !== stage2Role?.title) || sortedAdvisorPaths[2] || stage1Role;

        return (
          <div id="ai-strategic-advise-briefing-panel" className={`p-6 rounded-2xl border text-left space-y-5 shadow-xl relative overflow-hidden ${
            isDarkMode 
              ? "border-indigo-950/60 bg-gradient-to-br from-[#0F172A] via-[#10152B]/80 to-[#0F172A]" 
              : "border-indigo-100 bg-gradient-to-br from-[#F8FAFC] via-indigo-50/30 to-[#F8FAFC] shadow-sm"
          }`}>
            <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 relative z-10 ${
              isDarkMode ? "border-slate-805" : "border-slate-150"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    isDarkMode ? "bg-cyan-950/40 text-cyan-400 border-cyan-900/30" : "bg-cyan-50 text-cyan-600 border-cyan-155"
                  }`}>
                    AI STRATEGIC ADVISOR
                  </span>
                  <h4 className={`text-sm font-bold tracking-widest uppercase font-mono ${isDarkMode ? "text-white" : "text-slate-800"}`}>Sequence Architecture Guidance</h4>
                </div>
                <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-550"}`}>
                  Adaptive progression sequence structured by analyzing matching skills density, wage scalability, and long-term industry premium metrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* Best Path Analysis Card - 5 cols */}
              <div className={`lg:col-span-5 p-5 rounded-xl border space-y-4 ${
                isDarkMode ? "border-cyan-500/10 bg-slate-955/60" : "border-indigo-50 bg-white shadow-sm"
              }`}>
                <span className={`text-[10px] font-mono uppercase font-bold block tracking-widest ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>Immediate Priority Target</span>
                <div>
                  <h5 className={`text-base font-extrabold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{bestFit?.title}</h5>
                  <span className={`text-[11px] font-mono block mt-1 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>Optimal Fit Rate: {bestFit?.matchScore}% Compatibility</span>
                </div>
                
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Based on your analyzed core resume footprint, {bestFit?.title} yields your highest immediate alignment score. Since it has the minimal skill gaps relative to your profile, pursuing this path allows you to secure immediate target placement with the lowest onboarding friction.
                </p>
                
                <div className={`pt-3 border-t space-y-2 text-xs ${
                  isDarkMode ? "border-slate-900 text-slate-300" : "border-slate-150 text-slate-650"
                }`}>
                  <span className={`text-[10px] font-mono block ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>How to Execute This Phase</span>
                  <div className="flex items-start gap-2.5">
                    <span className={`font-bold font-mono mt-0.5 ${isDarkMode ? "text-cyan-400" : "text-cyan-605"}`}>1</span>
                    <span>Click the Build Path button to load this master syllabus on the left side menu.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className={`font-bold font-mono mt-0.5 ${isDarkMode ? "text-cyan-400" : "text-cyan-655"}`}>2</span>
                    <span>Review recommended courses under the lesson tracks and solve the corresponding portfolio capstones.</span>
                  </div>
                </div>
              </div>

              {/* Synergistic Sequencer Track - 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                <span className={`text-[10px] font-mono uppercase font-bold block tracking-widest ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>Optimal Career Sequencer Order</span>
                
                <div className={`space-y-4 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 ${
                  isDarkMode ? "before:bg-slate-800" : "before:bg-slate-200"
                }`}>
                  
                  {/* Stage 1: Initial Launch */}
                  <div className="flex gap-3 items-start relative z-10 pl-1">
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center font-mono flex-shrink-0 border ${
                      isDarkMode ? "bg-slate-950 border-slate-800 text-cyan-400" : "bg-cyan-50 border-cyan-200 text-cyan-600"
                    }`}>
                      1
                    </div>
                    <div className="space-y-1 block text-left">
                      <div className="flex items-center gap-2">
                        <h6 className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{stage1Role.title}</h6>
                        <span className={`text-[9px] font-mono font-bold ${isDarkMode ? "text-[#94A3B8]" : "text-slate-405"}`}>Fit: {stage1Role.matchScore}%</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        <strong>Establish Ground Foundation:</strong> Solidify core logic and syntax stacks in this domain. This establishes consistent professional standing and guarantees high-value entry. Complete Milestone phases 1 & 2.
                      </p>
                      <button 
                        type="button"
                        onClick={() => handleSwitchCareerPath(stage1Role.title)}
                        className={`text-[10px] font-mono hover:underline font-semibold flex items-center gap-1 ${
                          isDarkMode ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-505"
                        }`}
                      >
                        Activate {stage1Role.title} Roadmap
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Stage 2: Middle Scale Expand */}
                  <div className="flex gap-3 items-start relative z-10 pl-1">
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center font-mono flex-shrink-0 border ${
                      isDarkMode ? "bg-slate-950 border-slate-800 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600"
                    }`}>
                      2
                    </div>
                    <div className="space-y-1 block text-left">
                      <div className="flex items-center gap-2">
                        <h6 className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{stage2Role.title}</h6>
                        <span className={`text-[9px] font-mono font-bold ${isDarkMode ? "text-[#94A3B8]" : "text-slate-405"}`}>Fit: {stage2Role.matchScore}%</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        <strong>System Scale & Infrastructure:</strong> Transition your skill footprint from simple application state to distributed cloud system architecture, container orchestration, and continuous automated integrations.
                      </p>
                      <button 
                        type="button"
                        onClick={() => handleSwitchCareerPath(stage2Role.title)}
                        className={`text-[10px] font-mono hover:underline font-semibold flex items-center gap-1 ${
                          isDarkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-505"
                        }`}
                      >
                        Activate {stage2Role.title} Roadmap
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Stage 3: Specialized Apex */}
                  <div className="flex gap-3 items-start relative z-10 pl-1">
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center font-mono flex-shrink-0 border ${
                      isDarkMode ? "bg-slate-950 border-slate-800 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                    }`}>
                      3
                    </div>
                    <div className="space-y-1 block text-left">
                      <div className="flex items-center gap-2">
                        <h6 className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{stage3Role.title}</h6>
                        <span className={`text-[9px] font-mono font-bold ${isDarkMode ? "text-[#94A3B8]" : "text-slate-405"}`}>Fit: {stage3Role.matchScore}%</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        <strong>Cognitive Specialty Apex:</strong> Complete your transition by orchestrating automated deep learning parameters, neural reasoning systems, and specialized safety compliance models. Commands maximum industry reward.
                      </p>
                      <button 
                        type="button"
                        onClick={() => handleSwitchCareerPath(stage3Role.title)}
                        className={`text-[10px] font-mono hover:underline font-semibold flex items-center gap-1 ${
                          isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-505"
                        }`}
                      >
                        Activate {stage3Role.title} Roadmap
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ======================= LEFT COL (RAIL & PLUGS) ======================= */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Phase selectors list */}
          <div className="space-y-2 text-left">
            <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-500" : "text-slate-450"}`}>Curriculum Milestones</span>
            <div className="space-y-2">
              {localRoadmap.map((phase, idx) => {
                const phaseTopics = phase.topics?.map(t => t.name) || [];
                const phaseCompleted = phaseTopics.filter(t => completedTopics.includes(t)).length;
                const phasePercent = phaseTopics.length > 0 ? Math.round((phaseCompleted / phaseTopics.length) * 100) : 0;
                const isActive = activePhaseId === phase.phaseNumber;

                return (
                  <button
                    key={idx}
                    onClick={() => setActivePhaseId(phase.phaseNumber)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden flex flex-col justify-between h-28 ${
                      isActive
                        ? isDarkMode
                          ? "border-cyan-500/60 bg-[#111827] shadow-lg shadow-cyan-950/20"
                          : "border-cyan-500 bg-cyan-50/20 shadow-sm"
                        : isDarkMode
                          ? "border-slate-850 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/30"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-350 hover:bg-slate-100/50"
                    }`}
                  >
                    <div>
                      <div className={`text-[10px] font-mono font-bold block uppercase mb-1 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>PHASE {phase.phaseNumber}</div>
                      <h4 className={`text-xs font-bold mb-2 line-clamp-2 ${isDarkMode ? "text-white" : "text-slate-805"}`}>{phase.title}</h4>
                    </div>
                    
                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className={isDarkMode ? "text-gray-500" : "text-slate-455"}>Completed:</span>
                        <span className={phasePercent === 100 ? "text-emerald-500 font-bold" : isDarkMode ? "text-purple-300 font-medium" : "text-purple-650 font-semibold"}>
                          {phasePercent}%
                        </span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-955" : "bg-slate-200"}`}>
                        <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full" style={{ width: `${phasePercent}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MULTI-PAGE CONNECTIVITY MODULE (ADAPTIVE AI ENGINE) */}
          <div className={`p-4 rounded-xl border text-left space-y-3 ${
            isDarkMode ? "border-slate-800/80 bg-slate-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center gap-1.5">
              <Zap className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDarkMode ? "text-purple-300" : "text-purple-605"}`}>ADAPTIVE AI INTEGRATIONS</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-550"}`}>
              Inject external page insights into your roadmap curriculum on-the-fly:
            </p>

            <div className="space-y-1.5 pt-1">
              <button
                disabled={isUpdatingAdaptively}
                onClick={() => triggerAdaptiveAIUpdate("resume_intelligence", "Resume analyzer verified missing Cloud Architecture skills")}
                className={`w-full p-2 text-[10px] font-mono font-bold rounded text-left flex items-center justify-between transition-colors ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-800/80 text-gray-300 border border-slate-850 hover:border-cyan-500/20" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-cyan-500"
                }`}
              >
                <span>Resume Intelligence deficit check</span>
                <ArrowRight className="w-3 h-3 text-cyan-555" />
              </button>

              <button
                disabled={isUpdatingAdaptively}
                onClick={() => triggerAdaptiveAIUpdate("market_trends", "Generative AI demand surged in market trends data")}
                className={`w-full p-2 text-[10px] font-mono font-bold rounded text-left flex items-center justify-between transition-colors ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-800/80 text-gray-300 border border-slate-850 hover:border-purple-500/20" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-purple-500"
                }`}
              >
                <span>Trending Tech (Generative AI) Integration</span>
                <ArrowRight className="w-3 h-3 text-purple-555" />
              </button>

              <button
                disabled={isUpdatingAdaptively}
                onClick={() => triggerAdaptiveAIUpdate("interview_prep", "Interview simulation highlighted structural DSA and testing errors")}
                className={`w-full p-2 text-[10px] font-mono font-bold rounded text-left flex items-center justify-between transition-colors ${
                  isDarkMode 
                    ? "bg-slate-900 hover:bg-slate-800/80 text-gray-300 border border-slate-850 hover:border-indigo-500/20" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-indigo-500"
                }`}
              >
                <span>Interview prep gaps update</span>
                <ArrowRight className="w-3 h-3 text-indigo-555" />
              </button>
            </div>

            {isUpdatingAdaptively && (
              <div className={`flex items-center gap-2 justify-center text-[10px] font-mono py-1 rounded ${
                isDarkMode ? "text-cyan-400 bg-slate-900" : "text-cyan-600 bg-cyan-50"
              }`}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Adaptively restructuring...</span>
              </div>
            )}
          </div>

          {/* 4. LEARNING ANALYTICS VISUALIZER CHART PANEL */}
          <div className={`p-4 rounded-xl border text-left space-y-3 ${
            isDarkMode ? "border-slate-800/80 bg-slate-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center gap-1.5">
              <BarChart2 className={`w-4 h-4 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isDarkMode ? "text-cyan-300" : "text-cyan-605"}`}>LEARNING INTEL CHART</span>
            </div>
            
            {/* SVG Interactive Chart representing dynamic readiness index over target stages */}
            <div className="relative pt-1">
              <svg className="w-full h-24 text-cyan-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Grid horizontal guidelines */}
                <line x1="0" y1="5" x2="100" y2="5" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="0" y1="15" x2="100" y2="15" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="0" y1="25" x2="100" y2="25" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} strokeWidth="0.5" strokeDasharray="1,2" />
                
                {/* Area path */}
                <path d={`M 0,30 L 0,22 L 25,18 L 50,14 L 75,${24 - (progressPercent/6)} L 100,2 M 100,30 Z`} fill="url(#chartGradient)" />
                {/* Stroke path */}
                <path d={`M 0,22 L 25,18 L 50,14 L 75,${24 - (progressPercent/6)} L 100,2`} stroke="#06b6d4" strokeWidth="1" fill="none" strokeLinecap="round" />
                
                {/* Reference dots */}
                <circle cx="0" cy="22" r="1" fill="#a855f7" />
                <circle cx="25" cy="18" r="1" fill="#a855f7" />
                <circle cx="50" cy="14" r="1" fill="#a855f7" />
                <circle cx="75" cy={24 - (progressPercent/6)} r="1.5" fill="#38bdf8" />
                <circle cx="100" cy="2" r="1.5" fill="#22c55e" />
              </svg>
              
              <div className={`flex justify-between items-center text-[8px] font-mono pt-1 ${isDarkMode ? "text-slate-555" : "text-slate-450"}`}>
                <span>Phase 1</span>
                <span>Phase 2</span>
                <span>Phase 3</span>
                <span className="text-emerald-500 font-bold">In-Industry</span>
              </div>
            </div>

            <div className={`p-2.5 rounded border space-y-1 ${
              isDarkMode ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-200"
            }`}>
              <span className={`text-[10px] font-semibold block ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}>Market Readiness Index</span>
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className={isDarkMode ? "text-gray-400" : "text-slate-500"}>Current Readiness:</span>
                <span className={`font-bold ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>{Math.round(45 + (progressPercent * 0.4))}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* ======================= RIGHT MAIN COL (ROADMAP TIMELINE) ======================= */}
        <div className="lg:col-span-3 space-y-6">
          {isGeneratingRoadmap ? (
            <div className={`p-12 border rounded-2xl text-center space-y-4 ${
              isDarkMode ? "border-slate-800 bg-[#0B0F19]/40" : "border-slate-200 bg-slate-50 shadow-xs"
            }`}>
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <h4 className={`text-sm font-bold font-sans ${isDarkMode ? "text-white" : "text-slate-800"}`}>AI Syllabus Synthesis Engine Deploying...</h4>
              <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-655"}`}>
                Our model is custom-structuring a milestone syllabus, researching recommended courses, finding certifications, and framing Capstone projects tailored specifically for your target career direction. Just a moment...
              </p>
            </div>
          ) : currentPhase ? (
            <div className="space-y-6">
              
              {/* Detailed active timeline view block */}
              <motion.div
                key={activePhaseId}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-6 rounded-2xl border backdrop-blur space-y-5 text-left ${
                  isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-205 bg-white shadow-sm"
                }`}
              >
                <div>
                  <span className={`text-[10px] font-mono font-bold block uppercase tracking-widest mb-1 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                    PHASE {currentPhase.phaseNumber} TARGET SYLLABUS
                  </span>
                  <h4 className={`text-lg md:text-xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>{currentPhase.title}</h4>
                </div>

                {/* Topics list checklist */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>CORE LESSONS TIMELINE</span>
                    <span className={`text-[9px] font-mono ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>Click checkboxes upon study completion</span>
                  </div>

                  <div className="space-y-2">
                    {currentPhase.topics?.map((topic, id) => {
                      const isDone = completedTopics.includes(topic.name);
                      return (
                        <div
                          key={id}
                          onClick={() => handleToggleTopic(topic.name)}
                          className={`p-4 border rounded-xl flex items-start justify-between gap-4 cursor-pointer transition-all ${
                            isDone 
                              ? isDarkMode
                                ? "border-emerald-500/20 bg-emerald-950/5 hover:border-emerald-500/30" 
                                : "border-emerald-200 bg-emerald-50/20 hover:border-emerald-355"
                              : isDarkMode
                                ? "border-slate-850 bg-slate-950/80 hover:border-slate-750"
                                : "border-slate-200 bg-slate-50/30 hover:bg-slate-100/50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                              isDone 
                                ? "border-emerald-500 bg-emerald-500 text-white" 
                                : isDarkMode 
                                  ? "border-slate-600 bg-transparent text-transparent" 
                                  : "border-slate-350 bg-transparent text-transparent"
                            }`}>
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 text-left">
                              <span className={`text-xs md:text-sm font-semibold block transition-all ${
                                isDone 
                                  ? "line-through text-slate-555" 
                                  : isDarkMode 
                                    ? "text-slate-200" 
                                    : "text-slate-800"
                              }`}>
                                {topic.name}
                              </span>
                              {topic.description && (
                                <p className={`text-[11px] mt-1 leading-relaxed transition-all ${
                                  isDone 
                                    ? "text-slate-600 line-through" 
                                    : isDarkMode 
                                      ? "text-slate-400 font-normal" 
                                      : "text-slate-600 font-normal"
                                }`}>
                                  {topic.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px] flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[8px] tracking-wide font-extrabold border ${
                              topic.difficulty === "Hard" || topic.difficulty === "Critical"
                                ? isDarkMode
                                  ? "text-rose-455 bg-rose-950/30 border-rose-900/30" 
                                  : "text-rose-700 bg-rose-50 border-rose-200"
                                : isDarkMode
                                  ? "text-slate-400 bg-slate-900 border-slate-850"
                                  : "text-slate-600 bg-slate-100 border-slate-200"
                            }`}>
                              {topic.difficulty}
                            </span>
                            <span className={`flex items-center gap-0.5 ${isDarkMode ? "text-gray-500" : "text-slate-450"}`}>
                              <Clock className="w-3 h-3" /> {topic.estimatedTime || "1 week"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. COURSE RECOMMITTER PANEL MODULE */}
                {currentPhase.recommendedCourses && currentPhase.recommendedCourses.length > 0 ? (
                  <div className="space-y-3">
                    <span className={`text-[11px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>RECOMMENDED COURSEWORK (COURSECARD)</span>
                    <div className={`grid grid-cols-1 ${
                      currentPhase.recommendedCourses.length === 1 
                        ? "md:grid-cols-1" 
                        : currentPhase.recommendedCourses.length === 2 
                        ? "sm:grid-cols-2" 
                        : "sm:grid-cols-2 md:grid-cols-3"
                    } gap-3`}>
                      {currentPhase.recommendedCourses.map((course, id) => (
                        <div key={id} className={`p-4 rounded-xl border flex items-center justify-between gap-3 relative transition-colors h-full ${
                          isDarkMode 
                            ? "bg-slate-955 border-slate-850 hover:border-cyan-500/10" 
                            : "bg-slate-50 border-slate-200 hover:border-cyan-500 shadow-xs"
                        }`}>
                          <div className="space-y-1 text-left min-w-0 flex-grow">
                            <span className={`text-[9px] font-mono block tracking-widest font-bold uppercase ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>{course.platform}</span>
                            <h5 className={`text-xs font-bold line-clamp-2 leading-relaxed min-h-[36px] ${isDarkMode ? "text-white" : "text-slate-850"}`}>{course.name}</h5>
                            <span className={`text-[10px] font-mono block ${isDarkMode ? "text-gray-500" : "text-slate-450"}`}>{course.type || "Online Syllabus"}</span>
                          </div>
                          <div className={`p-2 rounded border flex-shrink-0 ${
                            isDarkMode ? "bg-slate-900 border-slate-800 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600"
                          }`}>
                            <Award className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* 6. PORTFOLIO CAPSTONE ENGINE SUGGESTIONS */}
                {currentPhase.projects && currentPhase.projects.length > 0 ? (
                  <div className={`border rounded-2xl p-5 relative overflow-hidden text-left ${
                    isDarkMode ? "bg-[#111827]/80 border-slate-800/80" : "bg-indigo-50/20 border-indigo-100 shadow-xs"
                  }`}>
                    <div className="absolute top-0 right-0 p-4 bg-gradient-to-b from-purple-500/5 to-transparent rounded-full blur-xl pointer-events-none" />
                    
                    <div className={`flex items-center gap-2 mb-1.5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                      <Sparkles className="w-4 h-4 animate-spin-slow" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold">PHASE portfolio CAPSTONE (PROJECTCARD)</span>
                    </div>

                    {currentPhase.projects.map((proj, id) => (
                      <div key={id} className="space-y-3">
                        <div className="space-y-1">
                          <h5 className={`text-sm font-extrabold ${isDarkMode ? "text-white" : "text-slate-850"}`}>{proj.title}</h5>
                          <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{proj.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.skillsUtilized?.map((sk, skIdx) => (
                            <span key={skIdx} className={`px-2 py-0.5 border text-[9px] font-mono rounded ${
                              isDarkMode ? "bg-slate-950 border-slate-850 text-cyan-400" : "bg-white border-slate-205 text-cyan-705"
                            }`}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

              </motion.div>

            </div>
          ) : (
            <div className={`p-12 border rounded-2xl text-center text-xs ${
              isDarkMode ? "border-slate-850 bg-slate-950/40 text-gray-500" : "border-slate-200 bg-slate-50 text-slate-500"
            }`}>
              Syllabus schedule is loading. Please select an active sequence phase to proceed.
            </div>
          )}
        </div>

      </div>

      {/* ======================= INTERACTIVE RECOMMENDER WIDGET (FULL WIDTH AT BOTTOM) ======================= */}
      <div id="curriculum-personalizer-recommender-engines-fullwidth" className={`mt-8 p-6 rounded-2xl border space-y-6 text-left ${
        isDarkMode ? "border-slate-800 bg-[#0B0F19]/40" : "border-slate-205 bg-white shadow-sm"
      }`}>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4.5 h-4.5 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
            <h5 className={`text-sm font-bold font-sans ${isDarkMode ? "text-white" : "text-slate-850"}`}>Curriculum Personalizer Recommender Engines</h5>
          </div>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Query high-demand courses, credentials, or complex capstones tailoring directly to target skill sets specified below.
          </p>
        </div>

        {/* Action Form Inputs */}
        <div className={`flex flex-col sm:flex-row items-end gap-3 p-3 rounded-xl border ${
          isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="w-full sm:flex-grow space-y-1.5 text-left">
            <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${isDarkMode ? "text-slate-550" : "text-slate-450"}`}>TARGET SKILL SPECIFICATION</span>
            <input 
              type="text"
              value={selectedSkillForRecommender}
              onChange={(e) => setSelectedSkillForRecommender(e.target.value)}
              placeholder="e.g. Docker, PyTorch, Kubernetes, MLOps, Next.js"
              className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:outline-none ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-white focus:border-cyan-500/50" 
                  : "bg-white border-slate-250 text-slate-800 focus:border-cyan-500"
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isLoadingCourses}
              onClick={() => handleFetchCourses(selectedSkillForRecommender)}
              className={`px-3 py-2 border text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-gray-200" 
                  : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 shadow-xs"
              }`}
            >
              {isLoadingCourses ? <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> : <BookOpen className="w-3 h-3 text-cyan-555" />}
              <span>Fetch Courses</span>
            </button>

            <button
              type="button"
              disabled={isLoadingProjects}
              onClick={() => handleFetchProjects(selectedSkillForRecommender)}
              className={`px-3 py-2 border text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-gray-200" 
                  : "bg-white hover:bg-slate-100 border-slate-250 text-slate-705 shadow-xs"
              }`}
            >
              {isLoadingProjects ? <RefreshCw className="w-3 h-3 animate-spin text-purple-400" /> : <Terminal className="w-3 h-3 text-purple-555" />}
              <span>Search Projects</span>
            </button>

            <button
              type="button"
              disabled={isLoadingCerts}
              onClick={() => handleFetchCertifications(selectedSkillForRecommender)}
              className={`px-3 py-2 border text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-gray-200" 
                  : "bg-white hover:bg-slate-100 border-slate-250 text-slate-705 shadow-xs"
              }`}
            >
              {isLoadingCerts ? <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> : <Award className="w-3 h-3 text-emerald-555" />}
              <span>Find Certifications</span>
            </button>
          </div>
        </div>

        {/* Displaying fetched interactive recommendations with high visual coherence */}
        <div className="space-y-4">
          
          {/* Courses cards */}
          {recommendedCourses.length > 0 && (
            <div className="space-y-2">
              <span className={`text-[10px] font-mono block uppercase tracking-wider font-bold ${isDarkMode ? "text-cyan-305" : "text-cyan-600"}`}>Dynamic Curated Coursework recommendations</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendedCourses.map((c, i) => (
                  <div key={i} className={`p-3 border rounded-xl flex items-start gap-3 text-left h-full ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200 shadow-xs"
                  }`}>
                    <div className={`p-2 rounded mt-1 flex-shrink-0 ${
                      isDarkMode ? "bg-cyan-950/40 text-cyan-400" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
                    }`}>
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border inline-block uppercase tracking-wider ${
                        isDarkMode ? "bg-slate-900 text-cyan-400 border-slate-800" : "bg-white text-cyan-705 border-cyan-155"
                      }`}>{c.platform}</span>
                      <h6 className={`text-xs font-bold leading-snug line-clamp-2 min-h-[36px] ${isDarkMode ? "text-white" : "text-slate-800"}`}>{c.name}</h6>
                      <div className={`flex items-center gap-4 text-[9px] font-mono ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                        <span>{c.type}</span>
                        {c.duration && <span>Duration: {c.duration}</span>}
                        {c.rating ? <span className="text-amber-500 font-semibold">Rating: {c.rating}</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects recommendations */}
          {recommendedProjects.length > 0 && (
            <div className="space-y-2 text-left">
              <span className={`text-[10px] font-mono block uppercase tracking-wider font-bold ${isDarkMode ? "text-purple-305" : "text-purple-600"}`}>AI Recommended Portfolios & Coding blueprints</span>
              <div className="space-y-2.5">
                {recommendedProjects.map((p, i) => (
                  <div key={i} className={`p-4 border rounded-xl space-y-2 ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between gap-4">
                      <h6 className={`text-xs font-extrabold ${isDarkMode ? "text-white" : "text-slate-850"}`}>{p.title}</h6>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        isDarkMode ? "bg-purple-950/30 text-purple-400 border-purple-900/30" : "bg-purple-50 text-purple-750 border-purple-200"
                      }`}>{p.complexity}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.skillsUtilized.map((s, idx) => (
                        <span key={idx} className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                          isDarkMode ? "bg-slate-900 text-slate-400 border-slate-800" : "bg-white text-slate-600 border-slate-200"
                        }`}>{s}</span>
                      ))}
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ml-auto ${
                        isDarkMode ? "bg-slate-900 text-slate-500 border-slate-800" : "bg-white text-slate-500 border-slate-200"
                      }`}>Estimated Effort: {p.estimatedHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications recommendations */}
          {recommendedCertifications.length > 0 && (
            <div className="space-y-2 text-left">
              <span className={`text-[10px] font-mono block uppercase tracking-wider font-bold ${isDarkMode ? "text-emerald-305" : "text-emerald-600"}`}>Industry Credential pathways</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendedCertifications.map((c, i) => (
                  <div key={i} className={`p-3 border rounded-xl flex items-center justify-between gap-3 h-full ${
                    isDarkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="space-y-1 min-w-0 flex-grow">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                        isDarkMode ? "bg-[#064e3b]/30 text-emerald-400 border-[#065f46]/30" : "bg-emerald-50 text-emerald-705 border-emerald-200"
                      }`}>{c.provider}</span>
                      <h6 className={`text-xs font-extrabold line-clamp-2 min-h-[36px] ${isDarkMode ? "text-white" : "text-slate-800"}`}>{c.name}</h6>
                      <span className={`text-[9px] font-mono block ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>Relevance index: {c.relevance || "High"}</span>
                    </div>
                    {c.valueIndex ? (
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-black block font-mono ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>{c.valueIndex}/10</span>
                        <span className="text-[8px] font-mono text-slate-500">Value index</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
