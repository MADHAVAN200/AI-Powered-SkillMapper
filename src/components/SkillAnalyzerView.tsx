import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  Github, 
  Award, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sliders, 
  TrendingUp, 
  BookOpen, 
  Layout, 
  Compass, 
  Award as Certificate, 
  Share2, 
  Target, 
  Database, 
  Briefcase 
} from "lucide-react";
import { ProfileMappingResults, GitHubAnalysisResult, SkillItem, SkillGapItem } from "../types";

// Standard career list for selection
const TARGET_CAREER_ROLES = [
  "AI Systems Engineer",
  "Full Stack Developer",
  "Cloud DevOps Architect",
  "Data Science Specialist"
];

interface SkillAnalyzerViewProps {
  results: ProfileMappingResults | null;
  onImportSkills: (skills: string[]) => void;
  onSaveSkillsResults?: (skills: SkillItem[], gaps: SkillGapItem[]) => void;
  isDarkMode?: boolean;
}

export default function SkillAnalyzerView({ results: propResults, onImportSkills, onSaveSkillsResults, isDarkMode = true }: SkillAnalyzerViewProps) {
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<"visuals" | "gaps" | "matrix" | "github">("visuals");

  // Database Synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Local State representing the current evaluated dataset for maximum reactivity
  const [selectedRole, setSelectedRole] = useState("AI Systems Engineer");
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [gapsList, setGapsList] = useState<SkillGapItem[]>([]);
  
  // Scoring Indicators
  const [readinessScore, setReadinessScore] = useState(74);
  const [subScores, setSubScores] = useState({
    technical: 78,
    projects: 70,
    experience: 65,
    certifications: 75,
    marketAlignment: 82
  });
  const [scoreFeedback, setScoreFeedback] = useState(
    "Based on calibrated rules, your technical portfolio stands above standard candidates. Bridge key gaps to unlock top recruiter lists."
  );

  // Recommendations State
  const [recsState, setRecsState] = useState<{
    skillsToLearn: string[];
    suggestedProjects: Array<{ title: string; description: string; tools: string[] }>;
    suggestedCertifications: Array<{ name: string; issuer: string; usefulness: string }>;
    onlineCourses: Array<{ name: string; platform: string; duration: string }>;
  }>({
    skillsToLearn: [],
    suggestedProjects: [],
    suggestedCertifications: [],
    onlineCourses: []
  });

  // Visualizer data (node points computed by coordinate calculations)
  const [radarNodes, setRadarNodes] = useState<Array<{ subject: string; A: number; B: number }>>([]);
  const [heatmapCells, setHeatmapCells] = useState<Array<{ skillName: string; demand: number; strength: number }>>([]);

  // Live Modification Form States
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<"Programming" | "AI/ML" | "Cloud" | "Databases" | "Soft Skills" | "Other">("Programming");
  const [newSkillProficiency, setNewSkillProficiency] = useState(70);

  // GitHub Component States
  const [gitUsername, setGitUsername] = useState("octocat");
  const [gitResults, setGitResults] = useState<GitHubAnalysisResult | null>(null);
  const [isLoadingGit, setIsLoadingGit] = useState(false);
  const [gitError, setGitError] = useState("");

  const [isUpdatingEngine, setIsUpdatingEngine] = useState(false);

  // Init from props
  useEffect(() => {
    if (propResults) {
      if (propResults.skills && propResults.skills.length > 0) {
        setSkillsList(propResults.skills);
      } else {
        // Fallback default skills list
        setSkillsList([
          { name: "TypeScript", category: "Programming", proficiency: 85, description: "Highly proficient in type safety." },
          { name: "Python", category: "Programming", proficiency: 80, description: "Experienced in building clean APIs." },
          { name: "Docker", category: "Cloud", proficiency: 75, description: "Can containerize multi-tier applications." },
          { name: "SQL", category: "Databases", proficiency: 70, description: "Capable of standard query optimizations." },
          { name: "Agile Scrums", category: "Soft Skills", proficiency: 85, description: "Excellent system orchestrator." }
        ]);
      }

      if (propResults.skillGaps && propResults.skillGaps.length > 0) {
        setGapsList(propResults.skillGaps);
      } else {
        setGapsList([
          { skillName: "MLOps Pipelines", priority: "High", whyNeeded: "Enterprise roles require automated verification formats." },
          { skillName: "Kubernetes Orchestration", priority: "Medium", whyNeeded: "Required for resilient clusterized deployments." }
        ]);
      }
    }
  }, [propResults]);

  // Synchronous recalculation when skills or role changes
  useEffect(() => {
    rebuildMetrics();
  }, [skillsList, selectedRole]);

  // Trigger server-side engine updates for high-fidelity evaluation
  const triggerEngineAnalysis = async (customSkills?: SkillItem[] | any) => {
    setIsUpdatingEngine(true);
    try {
      const activeSkills = Array.isArray(customSkills) ? customSkills : skillsList;
      const knownNames = activeSkills.map(s => s.name);
      
      // 1. Analyze Skills Category & Proficiency matrix
      const matrixRes = await fetch("/api/analyze-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knownSkills: knownNames, experienceLevel: "Junior (1-2 Years)" })
      });
      const matrixData = await matrixRes.json();
      let updatedSkills = activeSkills;
      if (matrixData.skills && matrixData.skills.length > 0) {
        updatedSkills = matrixData.skills.map((s: any) => ({
          name: s.skill_name,
          category: s.category,
          proficiency: s.proficiency,
          description: `Confidence rating: ${(s.confidence * 100).toFixed(0)}%. Highly requested.`
        }));
        setSkillsList(updatedSkills);
      } else if (customSkills) {
        // Fallback to ensuring local skill state is set if API doesn't enrich them
        setSkillsList(customSkills);
      }

      // 2. Skill Gap Analysis
      const gapsRes = await fetch("/api/skill-gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: selectedRole, currentSkills: knownNames })
      });
      const gapsData = await gapsRes.json();
      let updatedGaps = gapsList;
      if (gapsData.gaps) {
        setGapsList(gapsData.gaps);
        updatedGaps = gapsData.gaps;
      }

      // 3. Industry Readiness Scores & Recruiter Feedback
      const readinessRes = await fetch("/api/industry-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updatedSkills, experienceLevel: "Junior (1-2 Years)", carrierGoal: selectedRole })
      });
      const readinessData = await readinessRes.json();
      if (readinessData.readinessScore !== undefined) {
        setReadinessScore(readinessData.readinessScore);
        setSubScores({
          technical: readinessData.technicalScore || 75,
          projects: readinessData.projectsScore || 80,
          experience: readinessData.experienceScore || 65,
          certifications: readinessData.certificationsScore || 70,
          marketAlignment: readinessData.marketAlignmentValue || 85
        });
        setScoreFeedback(readinessData.feedback);
      }

      // 4. Learning roadmap Recommendations & Projects
      const recsRes = await fetch("/api/recommended-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillGaps: updatedGaps, targetRole: selectedRole })
      });
      const recsData = await recsRes.json();
      if (recsData.skillsToLearn) {
        setRecsState(recsData);
      }

    } catch (err) {
      console.error("Failed executing parallel analytical recalculation:", err);
      // Fail gracefully to local calculation
      rebuildMetrics();
    } finally {
      setIsUpdatingEngine(false);
    }
  };

  const rebuildMetrics = () => {
    // 1. Compute visual coordinates for the SVG Radar chart
    const subjects = ["Programming", "AI/ML", "Cloud", "Databases", "Soft Skills", "Other"];
    const computedRadar = subjects.map((sub, idx) => {
      const filtered = skillsList.filter(s => s.category === sub);
      const avg = filtered.length > 0 
        ? Math.round(filtered.reduce((acc, curr) => acc + curr.proficiency, 0) / filtered.length)
        : 40; // baseline
      
      // Target average benchmarks reference (higher for target positions)
      let targetBenchmark = 65;
      if (selectedRole.includes("AI") && sub === "AI/ML") targetBenchmark = 85;
      else if (selectedRole.includes("DevOps") && sub === "Cloud") targetBenchmark = 88;
      else if (selectedRole.includes("Full Stack") && sub === "Programming") targetBenchmark = 82;
      else if (selectedRole.includes("Data") && sub === "Databases") targetBenchmark = 84;

      return {
        subject: sub,
        A: avg,
        B: targetBenchmark
      };
    });
    setRadarNodes(computedRadar);

    // 2. Heatmap cell values
    const computedHeatmap = skillsList.map(s => {
      let demandValue = 70;
      const cleanName = s.name.toLowerCase();
      if (["python", "typescript", "react", "docker", "kubernetes", "mlops"].some(x => cleanName.includes(x))) {
        demandValue = 92;
      } else if (["sql", "postgresql", "fastapi", "aws"].some(x => cleanName.includes(x))) {
        demandValue = 82;
      }
      return {
        skillName: s.name,
        demand: demandValue,
        strength: s.proficiency
      };
    });
    setHeatmapCells(computedHeatmap);

    // 3. Populate default recommendation roadmaps local content matching active roles
    const mockProjects: { [key: string]: typeof recsState.suggestedProjects } = {
      "AI Systems Engineer": [
        { title: "Neuro-Inference Vector Gateway", description: "Design a high-performance backend serving vector lookups, using FastAPI, Redis caches, and OpenAI integrations.", tools: ["Python", "FastAPI", "Docker", "Vector DB"] },
        { title: "MLOps Automated Training Rig", description: "Inject automated code validation routines, MLflow modeling registers, and Docker container packaging.", tools: ["Python", "MLflow", "Docker", "Github Actions"] }
      ],
      "Full Stack Developer": [
        { title: "Dynamic Task Orchestrator Dashboard", description: "Develop a multi-tenant client panel featuring real-time state sync, responsive SVG dashboard grids, and secure PostgreSQL bindings.", tools: ["TypeScript", "React", "Node.js", "PostgreSQL"] }
      ],
      "Cloud DevOps Architect": [
        { title: "Resilient Multi-Zone Kubernetes Grid", description: "Construct declarative Infrastructure as Code deployment charts orchestrating container failover pipelines.", tools: ["Kubernetes", "AWS", "Terraform", "Docker"] }
      ],
      "Data Science Specialist": [
        { title: "Continuous Feature Analysis Pipeline", description: "Ingest telemetry vectors, compile analytical database structures, and format clean dashboard insights.", tools: ["Python", "SQL", "Pandas", "Tableau"] }
      ]
    };

    const activeProj = mockProjects[selectedRole] || mockProjects["AI Systems Engineer"];
    
    setRecsState({
      skillsToLearn: gapsList.map(g => `Acquire practical depth in ${g.skillName}`),
      suggestedProjects: activeProj,
      suggestedCertifications: [
        { name: "Professional Solution Architect Certification", issuer: selectedRole.includes("Cloud") ? "AWS" : "Google Cloud", usefulness: "Critical requirement to unlock senior roles" },
        { name: "Advanced Software Engineering Certificate", issuer: "Coursera / Stanford Online", usefulness: "High market validation index" }
      ],
      onlineCourses: [
        { name: `Complete Masterclass: Modern ${selectedRole}`, platform: "Udemy", duration: "18 Hours" },
        { name: `Advanced Distributed Systems Architecture`, platform: "Coursera", duration: "6 Weeks" }
      ]
    });
  };

  const handleDatabaseSync = async () => {
    if (!onSaveSkillsResults) return;
    setIsSyncing(true);
    setSyncMessage("Syncing capability matrix to Supabase database...");
    
    try {
      await onSaveSkillsResults(skillsList, gapsList);
      setSyncMessage("Success! Changes securely saved to Supabase.");
      setHasUnsavedChanges(false);
      setTimeout(() => setSyncMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setSyncMessage("Error: Failed to write data to database.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Add a brand new skill to list
  const handleAddNewSkill = () => {
    if (!newSkillName.trim()) return;
    const item: SkillItem = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      description: "Added interactively by applicant. Included in active scoring."
    };
    setSkillsList([...skillsList, item]);
    setNewSkillName("");
    setIsAddingSkill(false);
    setHasUnsavedChanges(true);
  };

  // Remove skill
  const handleRemoveSkill = (nameToRemove: string) => {
    setSkillsList(skillsList.filter(s => s.name !== nameToRemove));
    setHasUnsavedChanges(true);
  };

  // Edit skill proficiency
  const handleSetProficiency = (nameToModify: string, value: number) => {
    setSkillsList(skillsList.map(s => {
      if (s.name === nameToModify) {
        return { ...s, proficiency: value };
      }
      return s;
    }));
    setHasUnsavedChanges(true);
  };

  // Extract skills via mock / real API call
  const handleGitHubAnalyze = async () => {
    if (!gitUsername.trim()) return;
    setIsLoadingGit(true);
    setGitResults(null);
    setGitError("");

    try {
      const response = await fetch("/api/github-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername: gitUsername.trim() })
      });
      if (!response.ok) throw new Error("Could not parse profile.");
      const data = await response.json();
      setGitResults(data);
    } catch (err: any) {
      setGitError(err.message || "Failure to evaluate repos. Try again.");
    } finally {
      setIsLoadingGit(false);
    }
  };

  const handleSyncGitSkills = () => {
    if (!gitResults) return;
    
    // Convert string array to SkillItem list mapped into categories
    const newItems: SkillItem[] = gitResults.extractedSkills.map(sk => ({
      name: sk,
      category: "Programming",
      proficiency: 75,
      description: "Parsed automatically from GitHub references."
    }));

    // Filter duplicates case-insensitively
    const newSkillNamesLower = gitResults.extractedSkills.map(name => name.toLowerCase());
    const filteredCurrent = skillsList.filter(s => !newSkillNamesLower.includes(s.name.toLowerCase()));
    const mergedList = [...filteredCurrent, ...newItems];
    
    setSkillsList(mergedList);
    onImportSkills(gitResults.extractedSkills);
    setHasUnsavedChanges(true);
    
    // Directly trigger high-fidelity AI re-calculation matching the newly acquired skills
    triggerEngineAnalysis(mergedList);
    
    // Automatically bring the user back to the primary visuals tab
    setActiveSubTab("visuals");
  };

  // Compute Radar polygons coordinates
  const radarRadius = 80;
  const radarCenter = 120;
  
  return (
    <div className="space-y-6">
      
      {/* DATABASE SCHEMA & STATE SYNCHRONIZER */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
        isDarkMode ? "bg-[#000000]/15 border-slate-800/80" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="flex items-center gap-2.5">
          <Database className={`w-4 h-4 ${isSyncing ? "animate-bounce text-blue-400" : "text-slate-400"}`} />
          <div className="text-left">
            <span className={`text-[11px] font-bold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Supabase Persistent Schema</span>
            <p className={`text-[10px] leading-none mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Maps interactive matrices, gaps, and GitHub profiles back to the cloud.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {(!hasUnsavedChanges && !syncMessage) ? (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono ${
              isDarkMode ? "bg-emerald-950/25 border border-emerald-900/35 text-emerald-400" : "bg-emerald-50 border border-emerald-200 text-emerald-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? "bg-emerald-400" : "bg-emerald-600"}`} />
              <span>Synced with database</span>
            </div>
          ) : (
            <span className="text-[10px] text-amber-500 font-semibold whitespace-nowrap">
              Unsaved customizations pending
            </span>
          )}

          {onSaveSkillsResults && (hasUnsavedChanges || syncMessage) && (
            <button
              onClick={handleDatabaseSync}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[10px] font-extrabold text-white rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/50 cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Sync changes to DB</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className={`p-3 rounded-lg border text-xs font-mono text-left animate-pulse ${
          syncMessage.includes("Success") 
            ? isDarkMode ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-750"
            : syncMessage.includes("Error")
            ? isDarkMode ? "bg-red-950/20 border-red-900/40 text-red-500" : "bg-red-50 border-red-200 text-red-750"
            : isDarkMode ? "bg-blue-950/20 border-blue-900/40 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-750"
        }`}>
          {syncMessage}
        </div>
      )}
      
      {/* SECTION 1: INTERACTIVE TARGET ROLE BAR */}
      <div className={`p-6 rounded-2xl border ${
        isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Active Target Calibration</h3>
          </div>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Select standard industry paths to compute exact skill compatibility and employability indexes in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`p-2.5 rounded-lg text-xs font-semibold focus:outline-none ${
              isDarkMode ? "bg-[#0D1117] border border-slate-800 text-slate-200 focus:border-blue-500" : "bg-white border border-slate-200 text-slate-800 focus:border-indigo-500"
            }`}
          >
            {TARGET_CAREER_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <button
            onClick={triggerEngineAnalysis}
            disabled={isUpdatingEngine}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-xs font-bold text-white rounded-lg flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            {isUpdatingEngine ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calibrating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Recalibrate AI Engines</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 2: RADIAL EMPLOYABILITY SCORE & DIAGNOSIS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radial Employability Gauge Widget representing standard visual requirement */}
        <div className={`col-span-1 lg:col-span-5 p-6 rounded-2xl border ${
          isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
        } flex flex-col items-center justify-center space-y-4`}>
          <span className="text-[10px] font-mono font-bold tracking-widest text-blue-500 uppercase">
            Employability Readiness Index
          </span>

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circle percentage arc */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke={isDarkMode ? "#0D1117" : "#F1F5F9"} 
                strokeWidth="10" 
                fill="transparent" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#blueGradient)" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - readinessScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>{readinessScore}%</span>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Score Matching</span>
            </div>
          </div>

          <p className={`text-xs leading-relaxed text-center px-3 py-3 rounded-lg border ${
            isDarkMode ? "bg-[#0D1117] border-slate-800/80 text-slate-355" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <span className="font-bold text-blue-500">Recruiter Verdict:</span> {scoreFeedback}
          </p>
        </div>

        {/* Breakdown Factors Score bars */}
        <div className={`col-span-1 lg:col-span-12 xl:col-span-7 p-6 rounded-2xl border ${
          isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
        } space-y-4`}>
          <h4 className={`text-sm font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Employability Breakdown Factors</span>
          </h4>
          <p className={`text-xs text-left ${isDarkMode ? "text-slate-400" : "text-slate-550"}`}>
            Measures computed matching profiles vs general high-volume corporate HR selection standards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-left">
            {[
              { label: "Technical Skill Strength", value: subScores.technical, color: "from-blue-500 to-cyan-400" },
              { label: "Portfolio Project Alignment", value: subScores.projects, color: "from-emerald-500 to-teal-400" },
              { label: "Experience-to-Role Ratio", value: subScores.experience, color: "from-purple-500 to-indigo-400" },
              { label: "Certification Weight", value: subScores.certifications, color: "from-amber-500 to-orange-400" },
              { label: "Market Demand Index", value: subScores.marketAlignment, color: "from-pink-500 to-rose-400" }
            ].map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={`${isDarkMode ? "text-slate-300" : "text-slate-700"} font-medium`}>{factor.label}</span>
                  <span className={`font-mono font-bold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>{factor.value}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${
                  isDarkMode ? "bg-[#0D1117] border-slate-800" : "bg-slate-100 border-slate-200"
                }`}>
                  <div 
                    className={`h-full bg-gradient-to-r ${factor.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
            isDarkMode ? "border-slate-800 text-slate-500" : "border-slate-150 text-slate-500"
          }`}>
            <span>Market Contrast Rating: +{(readinessScore - 60).toFixed(0)}% Over Baseline</span>
            <span>Ref: HR Recruiter Matrix</span>
          </div>
        </div>

      </div>

      {/* SECTION 3: TAB NAVIGATION PANELS REPRESENTING REQUIRED STRUCTURE */}
      <div className={`border-b flex gap-4 overflow-x-auto text-xs pb-px ${
        isDarkMode ? "border-slate-800" : "border-slate-200"
      }`}>
        {[
          { id: "visuals", label: "Visual Analytics Map", icon: Layout },
          { id: "gaps", label: "Gap Analysis & Roadmaps", icon: AlertTriangle },
          { id: "matrix", label: "Core Skill Matrix Manager", icon: Cpu },
          { id: "github", label: "GitHub Intelligence Parser", icon: Github }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-3 font-semibold flex items-center gap-2 px-1 relative transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? isDarkMode ? "text-blue-400" : "text-indigo-600" 
                  : isDarkMode ? "text-slate-450 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? "bg-blue-500" : "bg-indigo-600"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 4: ACTIVE SUB TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Visual Analytics Map */}
        {activeSubTab === "visuals" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Widget A: SVG Radar Chart */}
            <div className={`col-span-1 lg:col-span-6 p-6 rounded-2xl border flex flex-col items-center ${
              isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
            }`}>
              <div className="w-full text-left mb-4">
                <span className={`text-[10px] font-mono tracking-widest uppercase block font-bold ${
                  isDarkMode ? "text-blue-400" : "text-indigo-600"
                }`}>
                  High-Fidelity Polygon Chart
                </span>
                <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Skill Radar Graph</h4>
              </div>

              {/* Standard clean SVG Radar */}
              <div className="relative w-60 h-60">
                <svg className="w-full h-full" viewBox="0 0 240 240">
                  {/* Outer Circles / Grid */}
                  {[40, 80, 120].map((r, i) => (
                    <circle 
                      key={i} 
                      cx="120" 
                      cy="120" 
                      r={r * 0.7} 
                      fill="none" 
                      stroke={isDarkMode ? "#30363D" : "#E2E8F0"} 
                      strokeWidth="1" 
                    />
                  ))}

                  {/* Axes lines & labels */}
                  {radarNodes.map((node, idx) => {
                    const angle = (idx * 2 * Math.PI) / radarNodes.length - Math.PI / 2;
                    const endX = radarCenter + radarRadius * Math.cos(angle);
                    const endY = radarCenter + radarRadius * Math.sin(angle);
                    
                    const labelX = radarCenter + (radarRadius + 22) * Math.cos(angle);
                    const labelY = radarCenter + (radarRadius + 14) * Math.sin(angle);

                    return (
                      <g key={idx}>
                        <line 
                          x1={radarCenter} 
                          y1={radarCenter} 
                          x2={endX} 
                          y2={endY} 
                          stroke={isDarkMode ? "#30363D" : "#E2E8F0"} 
                          strokeWidth="1" 
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          fill={isDarkMode ? "#8B949E" : "#475569"}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          className="font-mono text-[9px]"
                        >
                          {node.subject.slice(0, 11)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Industry benchmark Polygon (B) */}
                  <polygon
                    points={radarNodes.map((n, idx) => {
                      const angle = (idx * 2 * Math.PI) / radarNodes.length - Math.PI / 2;
                      const size = (n.B / 100) * radarRadius;
                      const x = radarCenter + size * Math.cos(angle);
                      const y = radarCenter + size * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(" ")}
                    fill={isDarkMode ? "rgba(139, 148, 158, 0.08)" : "rgba(100, 116, 139, 0.05)"}
                    stroke={isDarkMode ? "rgba(139, 148, 158, 0.45)" : "rgba(100, 116, 139, 0.35)"}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Candidate Polygon (A) */}
                  <polygon
                    points={radarNodes.map((n, idx) => {
                      const angle = (idx * 2 * Math.PI) / radarNodes.length - Math.PI / 2;
                      const size = (n.A / 100) * radarRadius;
                      const x = radarCenter + size * Math.cos(angle);
                      const y = radarCenter + size * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(" ")}
                    fill={isDarkMode ? "rgba(88, 166, 255, 0.18)" : "rgba(79, 70, 229, 0.15)"}
                    stroke={isDarkMode ? "#58A6FF" : "#4F46E5"}
                    strokeWidth="2"
                  />

                  {/* Coordinate Node Dots */}
                  {radarNodes.map((n, idx) => {
                    const angle = (idx * 2 * Math.PI) / radarNodes.length - Math.PI / 2;
                    const size = (n.A / 100) * radarRadius;
                    const x = radarCenter + size * Math.cos(angle);
                    const y = radarCenter + size * Math.sin(angle);
                    return (
                      <circle 
                        key={idx} 
                        cx={x} 
                        cy={y} 
                        r="3.5" 
                        fill={isDarkMode ? "#58A6FF" : "#4F46E5"} 
                        stroke={isDarkMode ? "#161B22" : "#FFFFFF"} 
                        strokeWidth="1" 
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Legend Indicator */}
              <div className="flex gap-4 text-[10px] font-mono mt-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 border rounded ${isDarkMode ? "border-blue-500 bg-blue-500/20" : "border-indigo-600 bg-indigo-100"}`} />
                  <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Your Evaluation Profile</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 border border-dashed rounded ${isDarkMode ? "border-slate-500 bg-slate-500/10" : "border-slate-400 bg-slate-100"}`} />
                  <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Industry Target Benchmarks</span>
                </div>
              </div>
            </div>

            {/* Widget B: SVG Dependency Skill Tree Graph */}
            <div className={`col-span-1 lg:col-span-6 p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
            }`}>
              <div className="text-left">
                <span className={`text-[10px] font-mono tracking-widest uppercase block font-bold ${
                  isDarkMode ? "text-blue-400" : "text-indigo-600"
                }`}>
                  Hierarchical Dependency Nodes
                </span>
                <h4 className={`text-sm font-bold tracking-tight mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Skill Tree Graph</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Maps parent foundation skills to the descendant specialized libraries and deployment frameworks.
                </p>
              </div>

              <div className="py-4 flex justify-center">
                {/* Clean inline SVG of structured dependency hierarchy */}
                <svg className="w-full max-w-sm" viewBox="0 0 320 180" fill="none">
                  {/* Horizontal Connection lines */}
                  <path d="M40 90 H140" stroke={isDarkMode ? "#30363D" : "#CBD5E1"} strokeWidth="2" />
                  <path d="M140 90 C 180 90, 180 40, 240 40" stroke={isDarkMode ? "#30363D" : "#CBD5E1"} strokeWidth="2" />
                  <path d="M140 90 C 180 90, 180 140, 240 140" stroke={isDarkMode ? "#30363D" : "#CBD5E1"} strokeWidth="2" />

                  {/* Core Node: Foundation */}
                  <g>
                    <rect x="10" y="70" width="80" height="40" rx="8" fill={isDarkMode ? "#0D1117" : "#F8FAFC"} stroke={isDarkMode ? "#30363D" : "#E2E8F0"} strokeWidth="2" />
                    <text x="50" y="94" fill={isDarkMode ? "#F0F6FC" : "#1E293B"} fontSize="10" fontWeight="bold" textAnchor="middle" className="font-sans">
                      Core Code base
                    </text>
                  </g>

                  {/* Middle Node: Framework */}
                  <g>
                    <rect x="120" y="70" width="85" height="40" rx="8" fill={isDarkMode ? "#161B22" : "#EEF2FF"} stroke={isDarkMode ? "#58A6FF" : "#4F46E5"} strokeWidth="2" />
                    <text x="162" y="94" fill={isDarkMode ? "#58A6FF" : "#4F46E5"} fontSize="10" fontWeight="bold" textAnchor="middle" className="font-sans">
                      Web/API Engine
                    </text>
                  </g>

                  {/* Top Descendant: Model Integration */}
                  <g>
                    <rect x="230" y="20" width="80" height="40" rx="8" fill={isDarkMode ? "#0D1117" : "#F8FAFC"} stroke={isDarkMode ? "#30363D" : "#E2E8F0"} strokeWidth="1" />
                    <text x="270" y="44" fill={isDarkMode ? "#C9D1D9" : "#334155"} fontSize="9" textAnchor="middle" className="font-mono">
                      Inference layer
                    </text>
                  </g>

                  {/* Bottom Descendant: Containers & Ops */}
                  <g>
                    <rect x="230" y="120" width="80" height="40" rx="8" fill={isDarkMode ? "#0D1117" : "#F8FAFC"} stroke={isDarkMode ? "#30363D" : "#E2E8F0"} strokeWidth="1" />
                    <text x="270" y="144" fill={isDarkMode ? "#C9D1D9" : "#334155"} fontSize="9" textAnchor="middle" className="font-mono">
                      Orchestration
                    </text>
                  </g>
                </svg>
              </div>

              <div className={`p-3 rounded-lg border text-xs text-left ${
                isDarkMode ? "bg-[#0D1117] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-205 text-slate-600"
              }`}>
                <span className={`font-bold ${isDarkMode ? "text-cyan-400" : "text-indigo-650"}`}>Roadmap Track:</span> Standard learning flow passes from syntax foundation logic towards containerized models.
              </div>
            </div>

            {/* Widget C: Category Skill Strength vs Demand Heatmap */}
            <div className={`col-span-1 lg:col-span-12 p-6 rounded-2xl border ${
              isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
            } space-y-4`}>
              <div className="text-left">
                <span className={`text-[10px] font-mono tracking-widest uppercase block font-bold ${
                  isDarkMode ? "text-blue-400" : "text-indigo-600"
                }`}>
                  Grid Matrix Diagnostics
                </span>
                <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Skill Demand Heatmap</h4>
                <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Compares active capability strength score against recruiters market demand rates.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {heatmapCells.slice(0, 12).map((cell, idx) => {
                  // Determine heat cell background color mapping
                  // Green: acquired + strong, Amber: medium, Red: critical gap
                  let colorClass = isDarkMode 
                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (cell.strength < 65) {
                    colorClass = isDarkMode 
                      ? "bg-red-950/20 text-red-400 border-red-900/40" 
                      : "bg-red-50 text-red-750 border-red-200";
                  } else if (cell.strength < 80) {
                    colorClass = isDarkMode 
                      ? "bg-amber-950/20 text-amber-400 border-amber-900/40" 
                      : "bg-amber-50 text-amber-750 border-amber-200";
                  }

                  return (
                    <div key={idx} className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 ${colorClass}`}>
                      <span className={`text-[11px] font-bold leading-tight uppercase tracking-wider truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        {cell.skillName}
                      </span>
                      <div className={`space-y-0.5 mt-2 font-mono text-[9px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <div className="flex justify-between">
                          <span>Power:</span>
                          <span className="font-bold">{cell.strength}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market demand:</span>
                          <span className="font-bold">{cell.demand}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Gap Analysis & Roadmaps */}
        {activeSubTab === "gaps" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Gap Analysis Table component */}
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
            } space-y-4`}>
              <div className="flex items-center gap-2 text-left">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Detailed Gap Analysis & Severe Warnings</h4>
              </div>
              <p className={`text-xs text-left ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Action priorities to scale up capability profiles and remove corporate hiring showstoppers.
              </p>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left">
                  <thead className={`text-[10px] uppercase font-mono tracking-wider border-b ${
                    isDarkMode ? "border-slate-800 text-slate-400 bg-[#0D1117]" : "border-slate-200 text-slate-600 bg-slate-50"
                  }`}>
                    <tr>
                      <th className="px-4 py-3">Missing Tool requirement</th>
                      <th className="px-4 py-3">Severity Tag</th>
                      <th className="px-4 py-3">Target Priority</th>
                      <th className="px-4 py-3">Industry recruitment Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapsList.map((gap, idx) => (
                      <tr key={idx} className={`border-b transition-colors ${
                        isDarkMode ? "border-slate-800 hover:bg-[#0D1117]/40 text-slate-300" : "border-slate-200 hover:bg-slate-50/50 text-slate-700"
                      }`}>
                        <td className={`px-4 py-4.5 font-bold uppercase tracking-wider ${isDarkMode ? "text-white" : "text-slate-800"}`}>{gap.skillName}</td>
                        <td className="px-4 py-4.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            idx === 0 
                              ? isDarkMode ? "text-red-400 bg-red-950/20 border border-red-900/30" : "text-red-700 bg-red-50 border border-red-200" 
                              : isDarkMode ? "text-amber-450 bg-amber-950/20 border border-amber-900/30" : "text-amber-700 bg-amber-50 border border-amber-200"
                          }`}>
                            {idx === 0 ? "Critical" : "Moderate"}
                          </span>
                        </td>
                        <td className="px-4 py-4.5">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isDarkMode ? "text-[#58A6FF]" : "text-indigo-650"}`}>
                            {gap.priority}
                          </span>
                        </td>
                        <td className={`px-4 py-4.5 max-w-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{gap.whyNeeded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SVG Learning & Certificate Roadmaps RecommendationPanel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Projects & Certs */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
              } space-y-4`}>
                <div className="flex items-center gap-2 text-left">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Structured Bridging Projects & Certifications</h4>
                </div>
                <p className={`text-xs text-left ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Strategic milestones with verified high corporate return on investment to expand portfolio capabilities.
                </p>

                <div className="space-y-4">
                  {recsState.suggestedProjects.map((proj, id) => (
                    <div key={id} className={`p-4 border rounded-xl space-y-2 ${
                      isDarkMode ? "bg-[#0D1117] border-slate-800" : "bg-slate-50 border-slate-150"
                    }`}>
                      <div className="flex justify-between items-start">
                        <h5 className={`text-xs font-bold uppercase tracking-wider italic ${isDarkMode ? "text-white" : "text-slate-850"}`}>{proj.title}</h5>
                        <div className="flex gap-1">
                          {proj.tools.map((t, i) => (
                            <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              isDarkMode ? "bg-blue-950/25 border border-blue-900/30 text-blue-400" : "bg-indigo-50 border border-indigo-150 text-indigo-600"
                            }`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed text-left ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Online masterclasses & certification paths */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
              } space-y-4`}>
                <div className="flex items-center gap-2 text-left">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Recommended Masterclasses & Certs</h4>
                </div>
                <p className={`text-xs text-left ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Strategic resources to quickly pick up missing tags.
                </p>

                <div className="space-y-3 pt-2">
                  {recsState.suggestedCertifications.map((cert, id) => (
                    <div key={id} className={`p-3 border rounded-lg flex items-start gap-3 ${
                      isDarkMode ? "bg-[#0D1117] border-slate-800" : "bg-slate-50 border-slate-150"
                    }`}>
                      <Certificate className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <h5 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-white" : "text-slate-800"}`}>{cert.name}</h5>
                        <div className={`flex gap-2 items-center text-[10px] font-mono mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-450"}`}>
                          <span>Issuer: {cert.issuer}</span>
                          <span>•</span>
                          <span className="text-emerald-500 font-bold">{cert.usefulness}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recsState.onlineCourses.map((course, id) => (
                    <div key={id} className={`p-3 border rounded-lg flex items-start gap-3 ${
                      isDarkMode ? "bg-[#0D1117] border-slate-800" : "bg-slate-50 border-slate-150"
                    }`}>
                      <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <h5 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-white" : "text-slate-800"}`}>{course.name}</h5>
                        <div className={`flex gap-2 items-center text-[10px] font-mono mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-455"}`}>
                          <span>Platform: {course.platform}</span>
                          <span>•</span>
                          <span>Est: {course.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 3: Core Skill Matrix Manager */}
        {activeSubTab === "matrix" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Custom modifier controllers to ADD or DELETE skills */}
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
            } space-y-4`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 text-left">
                  <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Capability Modifier Controls</h4>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Directly append new technology elements or adjust proficiency sliders to re-calculate employability metrics instantly.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingSkill(!isAddingSkill)}
                  className={`px-4 py-2 border text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    isDarkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>{isAddingSkill ? "Close Form" : "Append New Skill Badge"}</span>
                </button>
              </div>

              {/* Collapsed addition form */}
              <AnimatePresence>
                {isAddingSkill && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-12 gap-4 text-left ${
                      isDarkMode ? "bg-[#0D1117] border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="md:col-span-4 space-y-1">
                        <label className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Skill Name</label>
                        <input 
                          type="text" 
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          placeholder="e.g. FastAPI / PyTorch"
                          className={`w-full p-2 rounded-lg text-xs ${
                            isDarkMode ? "bg-[#161B22] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <label className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Category Group</label>
                        <select 
                          value={newSkillCategory}
                          onChange={(e) => setNewSkillCategory(e.target.value as any)}
                          className={`w-full p-2 rounded-lg text-xs font-semibold ${
                            isDarkMode ? "bg-[#161B22] border-slate-800 text-white animate-none" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <option value="Programming">Programming</option>
                          <option value="AI/ML">AI/ML</option>
                          <option value="Cloud">Cloud</option>
                          <option value="Databases">Databases</option>
                          <option value="Soft Skills">Soft Skills</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <label className={`text-[10px] font-mono block ${isDarkMode ? "text-slate-450" : "text-slate-550"}`}>Proficiency</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range"
                            min="20"
                            max="100"
                            value={newSkillProficiency}
                            onChange={(e) => setNewSkillProficiency(parseInt(e.target.value))}
                            className={`w-full accent-blue-500 scale-y-90 ${isDarkMode ? "bg-[#161B22]" : "bg-slate-200"}`}
                          />
                          <span className="text-xs font-mono font-bold text-blue-500 w-8">{newSkillProficiency}%</span>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex items-end">
                        <button
                          onClick={handleAddNewSkill}
                          className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 font-bold text-xs text-white rounded-lg transition-all cursor-pointer"
                        >
                          Add Badge
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic modification list progress bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {skillsList.map((skill, idx) => (
                  <div key={idx} className={`p-4 border rounded-xl space-y-3 text-left ${
                    isDarkMode ? "bg-[#0D1117] border-slate-850/80" : "bg-slate-50 border-slate-150 shadow-xs"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-blue-500 uppercase font-bold tracking-widest block mb-0.5">
                          {skill.category}
                        </span>
                        <h5 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-white" : "text-slate-800"}`}>{skill.name}</h5>
                      </div>
                      <button 
                        onClick={() => handleRemoveSkill(skill.name)}
                        className={`p-1 rounded border border-transparent transition-all cursor-pointer ${
                          isDarkMode 
                            ? "hover:bg-red-950/20 hover:border-red-900/40 text-slate-500 hover:text-red-400" 
                            : "hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-650"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className={`text-[10px] ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>Proficiency:</span>
                        <span className={`font-bold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{skill.proficiency}%</span>
                      </div>
                      <input 
                        type="range"
                        min="20"
                        max="100"
                        value={skill.proficiency}
                        onChange={(e) => handleSetProficiency(skill.name, parseInt(e.target.value))}
                        className={`w-full accent-blue-500 scale-y-75 cursor-pointer ${
                          isDarkMode ? "bg-[#161B22]" : "bg-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: GitHub Intelligence Parser */}
        {activeSubTab === "github" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`p-6 rounded-2xl border ${
              isDarkMode ? "border-slate-800 bg-[#161B22]" : "border-slate-205 bg-white shadow-sm"
            } space-y-4`}
          >
            <div className="flex items-center gap-2 text-left">
              <Github className="w-5 h-5 text-blue-500" />
              <h4 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>Interactive GitHub Portfolio Extractor</h4>
            </div>
            <p className={`text-xs text-left ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Analyze core repositories, detect actual coding usage languages, and extract new capability metrics instantly.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={gitUsername}
                onChange={(e) => setGitUsername(e.target.value)}
                className={`flex-grow p-2.5 rounded-lg text-xs font-mono focus:outline-none ${
                  isDarkMode ? "bg-[#0D1117] border border-slate-850 text-slate-300 focus:border-blue-500" : "bg-white border border-slate-200 text-slate-800 focus:border-indigo-500"
                }`}
                placeholder="GitHub username or repository link (e.g., https://github.com/octocat/Spoon-Knife)"
              />
              <button
                onClick={handleGitHubAnalyze}
                disabled={isLoadingGit}
                className={`px-5 py-2.5 border text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  isDarkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-750 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-205 text-slate-700"
                }`}
              >
                {isLoadingGit ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Sparkles className="w-4 h-4 text-blue-500" />}
                <span>Analyze Repos</span>
              </button>
            </div>

            {gitError && (
              <p className="text-xs text-red-450">{gitError}</p>
            )}

            {/* Present GitHub Analysis Results */}
            {gitResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 border rounded-xl space-y-4 text-left ${
                  isDarkMode ? "bg-[#0D1117] border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3 ${
                  isDarkMode ? "border-slate-800" : "border-slate-200"
                }`}>
                  <div>
                    <span className={`text-[10px] font-mono uppercase tracking-widest block ${isDarkMode ? "text-blue-400" : "text-indigo-600"}`}>EXTRACTED PROFILE</span>
                    <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{gitResults.profileUrl}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono block ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>REP ACTIVITY DEVIATION</span>
                    <span className="text-xs font-extrabold text-emerald-500">{gitResults.activityScore}% Rating</span>
                  </div>
                </div>

                {/* Language stats custom bar charts */}
                <div>
                  <p className={`text-xs font-mono mb-2 ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>LANGUAGE DETECTS</p>
                  <div className="space-y-2">
                    {gitResults.languagesDetected.map((lang, id) => (
                      <div key={id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{lang.name} - <span className="text-[10px] text-blue-500 font-bold">{lang.rating}</span></span>
                          <span className={`font-mono ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>{lang.percentage}%</span>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? "bg-[#161B22]" : "bg-slate-200"}`}>
                          <div className="bg-blue-500 h-full" style={{ width: `${lang.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repos list */}
                <div>
                  <p className={`text-xs font-mono mb-2 ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>EVALUATED REPOSITORIES</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gitResults.repositoriesParsed.map((repo, id) => (
                      <div key={id} className={`p-3 rounded-lg border flex flex-col justify-between ${
                        isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-150 shadow-sm"
                      }`}>
                        <div>
                          <h5 className={`text-xs font-bold italic ${isDarkMode ? "text-white" : "text-slate-800"}`}>{repo.name}</h5>
                          <p className={`text-[11px] mt-1 line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{repo.description}</p>
                        </div>
                        <div className={`flex justify-between items-center text-[10px] mt-2 font-mono ${isDarkMode ? "text-slate-500" : "text-slate-450"}`}>
                          <span>⭐ {repo.stars} stars</span>
                          <span className="text-purple-500 font-semibold">{repo.languages.join(", ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extracted skills badges */}
                <div>
                  <p className={`text-xs font-mono mb-1.5 ${isDarkMode ? "text-slate-405" : "text-slate-500"}`}>MAPPED CAPABILITIES DETECTED</p>
                  <div className="flex flex-wrap gap-2">
                    {gitResults.extractedSkills.map((sk, id) => (
                      <span key={id} className={`px-2.5 py-1 font-mono text-xs border rounded-lg ${
                        isDarkMode ? "bg-blue-950/20 text-blue-300 border-blue-800/30" : "bg-indigo-50 text-indigo-600 border-indigo-150"
                      }`}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <p className={`text-xs p-3 rounded-lg border leading-relaxed italic ${
                  isDarkMode ? "bg-[#161B22] border-slate-800/80 text-slate-355" : "bg-slate-100 border-slate-205 text-slate-700"
                }`}>
                  <span className={`font-bold font-mono ${isDarkMode ? "text-indigo-300" : "text-indigo-650"}`}>Feedback:</span> {gitResults.expertAdvice}
                </p>

                <button
                  onClick={handleSyncGitSkills}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-xs text-white rounded-lg hover:brightness-110 shadow-md transition-all cursor-pointer"
                >
                  Merge GitHub Capabilities into Profile Analysis
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
