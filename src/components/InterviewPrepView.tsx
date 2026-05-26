import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Terminal, Cpu, Award, Code, CheckCircle, RefreshCw, AlertCircle, PlayCircle, Loader2, History, TrendingUp, Calendar } from "lucide-react";
import { InterviewQuestion, InterviewEvaluationResults } from "../types";

interface InterviewPrepViewProps {
  careerGoal: string;
  selectedSkills: string[];
}

export default function InterviewPrepView({ careerGoal, selectedSkills }: InterviewPrepViewProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionAnswers, setSubmissionAnswers] = useState<{ [key: number]: string }>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
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

  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluationResults | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      let serverHistory: any[] = [];
      try {
        const resp = await fetch("/api/interview/history");
        const d = await resp.json();
        if (d.history) {
          serverHistory = d.history;
        }
      } catch (e) {
        console.warn("Backend history fetch failed, using local fallback:", e);
      }

      // Load local storage interview history
      let localHistory: any[] = [];
      const localHistoryKey = `skill_mapper_interviews_${getUserId()}`;
      const localHistoryJson = localStorage.getItem(localHistoryKey);
      if (localHistoryJson) {
        try {
          localHistory = JSON.parse(localHistoryJson);
        } catch (e) {
          localHistory = [];
        }
      }

      // Merge and deduplicate by created_at timestamp
      const merged = [...localHistory, ...serverHistory];
      const uniqueMap = new Map();
      merged.forEach(item => {
        if (!item || !item.created_at) return;
        const ts = new Date(item.created_at).getTime();
        const normTs = Math.round(ts / 1000); // normalized to nearest second
        uniqueMap.set(normTs, item);
      });

      const sortedHistory = Array.from(uniqueMap.values()).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setHistory(sortedHistory);
    } catch (e) {
      console.error("Error loading combined history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const startNewInterviewSession = async () => {
    setIsGenerating(true);
    setEvaluation(null);
    setSubmissionAnswers({});
    setActiveQuestionIndex(0);
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerGoal, selectedSkills })
      });
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextAnswerChange = (qId: number, text: string) => {
    setSubmissionAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleEvaluateSession = async () => {
    if (questions.length === 0) return;
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission: submissionAnswers,
          questions: questions,
          careerGoal,
          domain: selectedSkills && selectedSkills.length > 0 ? selectedSkills[0] : undefined
        })
      });
      const data = await response.json();
      setEvaluation(data);

      // Save to localStorage so it is physically preserved on client forever
      const localHistoryKey = `skill_mapper_interviews_${getUserId()}`;
      let localHistory: any[] = [];
      const localHistoryJson = localStorage.getItem(localHistoryKey);
      if (localHistoryJson) {
        try {
          localHistory = JSON.parse(localHistoryJson);
        } catch (e) {}
      }

      const newRecord = {
        domain: selectedSkills && selectedSkills.length > 0 ? selectedSkills[0] : "Technical Domain",
        target_goal: careerGoal || "Mock Interview Prep",
        submitted_answers: submissionAnswers,
        evaluation: data,
        created_at: new Date().toISOString()
      };

      localHistory.unshift(newRecord);
      localStorage.setItem(localHistoryKey, JSON.stringify(localHistory));

      loadHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl border border-gray-800 bg-[#111827]/60 backdrop-blur flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Interactive AI Mock Interviewer</h3>
          </div>
          <p className="text-gray-400 text-xs md:text-sm max-w-xl">
            Prepare for actual employment. Generate randomized domain-specific conceptual and coding questions aligned to your specified goals.
          </p>
        </div>

        <button
          onClick={startNewInterviewSession}
          disabled={isGenerating}
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:brightness-110 disabled:bg-gray-800 font-semibold text-xs text-white rounded-xl transition-all flex items-center gap-2 flex-shrink-0"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <PlayCircle className="w-4 h-4 text-white" />}
          <span>Generate Session</span>
        </button>
      </div>

      {/* Main Flow: No active session */}
      {questions.length === 0 && !isGenerating && !evaluation && (
        <div className="p-12 border border-dashed border-gray-800 rounded-3xl bg-slate-900/10 text-center space-y-4">
          <Award className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
          <h4 className="text-base font-bold text-white">Initiate a domain simulated round</h4>
          <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
            Specify a target career and current capabilites, then click "Generate Session" to spin up tailored mock interviews.
          </p>
        </div>
      )}

      {/* active session simulation terminal */}
      {questions.length > 0 && !evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline of Questions list Navigation */}
          <div className="space-y-2 lg:col-span-1 text-left">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2 font-bold">SESSION QUESTIONS</span>
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 block ${
                  activeQuestionIndex === idx
                    ? "border-cyan-500/50 bg-[#111827] shadow-lg shadow-cyan-950/25"
                    : "border-gray-850 bg-slate-900/10 hover:border-gray-800 hover:bg-slate-900/30"
                }`}
              >
                <div className="text-[9px] font-mono text-cyan-400 uppercase font-bold mb-1">Q{idx + 1} • {q.type}</div>
                <p className="text-xs text-white font-medium line-clamp-1">{q.question}</p>
                <div className="mt-1 flex justify-end">
                  {submissionAnswers[q.id]?.trim() ? (
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">✔ Answered</span>
                  ) : (
                    <span className="text-[9px] text-gray-500 font-mono">Unanswered</span>
                  )}
                </div>
              </button>
            ))}

            <button
              onClick={handleEvaluateSession}
              disabled={isEvaluating}
              className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 disabled:bg-gray-800 text-xs font-semibold text-white rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <CheckCircle className="w-4 h-4 text-white" />}
              <span>Submit & Evaluate with Gemini</span>
            </button>
          </div>

          {/* Core Interactive Question Pane */}
          <div className="lg:col-span-2 space-y-4 text-left">
            {activeQuestion && (
              <motion.div
                key={activeQuestionIndex}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl border border-gray-800 bg-[#111827]/40 backdrop-blur space-y-4"
              >
                {/* Header */}
                <div className="border-b border-gray-850 pb-3 flex justify-between items-center">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-900/40 px-2 py-0.5 rounded font-bold">
                    TYPE: {activeQuestion.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Question {activeQuestionIndex + 1} of {questions.length}</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base md:text-lg font-bold text-white leading-relaxed">{activeQuestion.question}</h4>
                  <p className="text-[11px] text-gray-450 italic">
                    <span className="text-xs font-semibold text-purple-400 font-sans">Objective:</span> {activeQuestion.rationale}
                  </p>
                </div>

                {/* Question Input panel structured like a developer terminal IDE */}
                <div className="space-y-2 border border-gray-850 rounded-xl overflow-hidden bg-slate-950">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111827] border-b border-gray-850 text-xs text-gray-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-cyan-400" />
                      <span>interactive_prep_console.sh</span>
                    </div>
                  </div>

                  <textarea
                    value={submissionAnswers[activeQuestion.id] || ""}
                    onChange={(e) => handleTextAnswerChange(activeQuestion.id, e.target.value)}
                    className="w-full h-44 p-4 font-mono text-xs text-cyan-200 bg-slate-950 focus:outline-none resize-none"
                    placeholder={
                      activeQuestion.solutionTemplate
                        ? activeQuestion.solutionTemplate
                        : "Type your detailed answer or coding block here. Emphasize trade-offs, step-by-step algorithms, or specific frameworks as needed for optimal scores..."
                    }
                  />
                </div>

                {/* Simple Next controls */}
                <div className="flex justify-between items-center text-xs">
                  <button
                    disabled={activeQuestionIndex === 0}
                    onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                    className="text-gray-400 hover:text-white font-medium disabled:opacity-30"
                  >
                    ◀ Previous
                  </button>
                  <button
                    disabled={activeQuestionIndex === questions.length - 1}
                    onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                    className="text-gray-400 hover:text-white font-medium disabled:opacity-30"
                  >
                    Next ▶
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Evaluating loader */}
      {isEvaluating && (
        <div className="p-12 border border-gray-850 rounded-2xl bg-slate-900/15 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-white">Grading Answers with Gemini Analyzer</h4>
          <p className="text-xs text-gray-500">Generating quantitative feedback on logic, accuracy, and engineering trade-offs...</p>
        </div>
      )}

      {/* Interview Evaluation Report */}
      {evaluation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border border-gray-850 bg-slate-900/30 backdrop-blur space-y-6 text-left"
        >
          <div className="border-b border-gray-850 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">ROUND PERFORMANCE DIAGNOSTICS</span>
              <h4 className="text-xl font-bold text-white tracking-tight">AI Evaluation Scorecard</h4>
            </div>
            <button
              onClick={startNewInterviewSession}
              className="px-4 py-2 bg-slate-950 border border-gray-800 text-xs text-white rounded-lg hover:border-cyan-500/40 transition-colors"
            >
              Start Alternate Session
            </button>
          </div>

          {/* Master Overall Score & Score Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Master Gauge */}
            <div className="p-6 rounded-xl bg-slate-950 border border-gray-850 flex flex-col items-center justify-center text-center space-y-2 lg:col-span-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">OVERALL READYNESS</span>
              <div className="relative w-32 h-32 flex items-center justify-center my-2">
                {/* Visual SVG Circle gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    strokeWidth="8"
                    stroke="#1e293b"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    strokeWidth="8"
                    stroke={evaluation.overallReadiness >= 75 ? "#10b981" : evaluation.overallReadiness >= 45 ? "#f59e0b" : "#ef4444"}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - evaluation.overallReadiness / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{evaluation.overallReadiness}%</span>
                  <span className="text-[9px] text-gray-400 font-mono">STANDARDS MATCH</span>
                </div>
              </div>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                evaluation.overallReadiness >= 75 
                  ? "text-emerald-400 bg-emerald-950/30" 
                  : evaluation.overallReadiness >= 50 
                    ? "text-amber-400 bg-amber-950/30" 
                    : "text-rose-500 bg-rose-950/30"
              }`}>
                {evaluation.overallReadiness >= 75 ? "Direct Hire Qualified" : evaluation.overallReadiness >= 50 ? "Needs Warm-up" : "Unprepared / Non-compliant"}
              </span>
            </div>

            {/* Granular Subscores */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-gray-850/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">TECHNICAL ACCURACY</span>
                  <p className="text-[11px] text-gray-500 font-sans mt-0.5">Foundational domain-specific metrics coverage.</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="h-2 w-2/3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${evaluation.technicalAccuracy}%` }} />
                  </div>
                  <span className="text-sm font-black text-white font-mono">{evaluation.technicalAccuracy}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-gray-850/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">CODING PROWESS</span>
                  <p className="text-[11px] text-gray-500 font-sans mt-0.5">Algorithmic correctness and implementation logic.</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="h-2 w-2/3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${evaluation.codingScore}%` }} />
                  </div>
                  <span className="text-sm font-black text-white font-mono">{evaluation.codingScore}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-gray-850/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">COMMUNICATION CLARITY</span>
                  <p className="text-[11px] text-gray-500 font-sans mt-0.5">Explanation flow and filler frequency tracking.</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="h-2 w-2/3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: `${evaluation.communicationScore}%` }} />
                  </div>
                  <span className="text-sm font-black text-white font-mono">{evaluation.communicationScore}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-gray-850/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">PROBLEM SOLVING</span>
                  <p className="text-[11px] text-gray-500 font-sans mt-0.5">Complexity reasoning and architectural system bounds.</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="h-2 w-2/3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400" style={{ width: `${evaluation.problemSolving}%` }} />
                  </div>
                  <span className="text-sm font-black text-white font-mono">{evaluation.problemSolving}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Constructive Advisory Note */}
          <div className="p-5 rounded-xl bg-[#111827]/80 border border-gray-800 space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">EXPERT SCREENING ADVISORY NOTE (STRICT AUDIT)</span>
            <p className="text-xs text-gray-300 leading-relaxed font-sans font-medium">{evaluation.constructiveFeedback}</p>
          </div>

          {/* Strengths & Weaknesses list bento box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/30 border border-emerald-950/30 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">DEMONSTRATED STRENGTHS</span>
              {evaluation.strengths && evaluation.strengths.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-gray-300">{str}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">No demonstrable strengths recorded for incomplete answers.</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/30 border border-amber-950/30 space-y-2">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">DETECTED CAREER WEAKNESSES</span>
              {evaluation.weakTopics && evaluation.weakTopics.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {evaluation.weakTopics.map((wt, i) => (
                    <li key={i} className="text-xs text-gray-300">{wt}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">None determined.</p>
              )}
            </div>
          </div>

          {/* Action Steps Suggestions & Vocals diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950/30 border border-gray-850 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">NEXT STEPS RECOMMENDATIONS</span>
              {evaluation.suggestions && evaluation.suggestions.length > 0 ? (
                <ul className="list-decimal list-inside space-y-1">
                  {evaluation.suggestions.map((sug, i) => (
                    <li key={i} className="text-xs text-gray-300 leading-relaxed">{sug}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">No recommendations details determined.</p>
              )}
            </div>

            {/* Vocal filler counts */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-gray-850 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold mb-1">SPEECH ANALYTICS</span>
                <p className="text-[11px] text-gray-400">Repeated filler vocal sounds tracked in console text blocks:</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-white mb-1">
                  <span>Filler Occurrences:</span>
                  <span className="font-bold text-red-400">{evaluation.fillerWordsMetrics?.totalFound ?? 0}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {evaluation.fillerWordsMetrics && Object.entries(evaluation.fillerWordsMetrics.wordsByFrequency).length > 0 ? (
                    Object.entries(evaluation.fillerWordsMetrics.wordsByFrequency).slice(0, 4).map(([word, freq]) => (
                      <span key={word} className="text-[9px] font-mono bg-purple-950/40 border border-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded">
                        "{word}": {freq}x
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-550 italic">Clean speech profile.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed answers reviews list */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block font-bold leading-none">Diagnostic Q&A Breakdown</span>
            <div className="space-y-3">
              {evaluation.correctAnswersReview?.map((rev, idx) => (
                <div key={idx} className="p-4 bg-slate-950/50 border border-gray-850/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">Question {idx + 1} Assessment</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      rev.score >= 70 ? "text-emerald-400 bg-emerald-950/30" : rev.score >= 35 ? "text-amber-400 bg-amber-950/30" : "text-rose-500 bg-rose-950/30"
                    }`}>
                      Score: {rev.score}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-snug">
                    <span className="text-[10px] font-mono text-cyan-400 block font-bold uppercase mb-0.5">Syllabus Criteria Match</span>
                    "{rev.correctSummary}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Historical Evaluations & Metrics Roll */}
      <div className="p-6 rounded-2xl border border-gray-850/80 bg-slate-900/10 backdrop-blur space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-gray-850/50 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">YOUR HISTORICAL APPRAISALS & CAREER EVOLUTION ({history.length})</span>
          </div>
          {isLoadingHistory && <span className="text-[10px] text-gray-500 font-mono animate-pulse">Syncing logs...</span>}
        </div>

        {history.length === 0 ? (
          <div className="py-6 text-center text-gray-500 text-xs italic">
            No past evaluations recorded yet. Complete a mock round to persist your diagnostics logs!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {history.map((record, index) => {
              const dateStr = record.created_at ? new Date(record.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }) : "Unknown Date";

              const overallVal = record.evaluation?.overallReadiness ?? 0;

              return (
                <div 
                  key={index}
                  className="p-3 rounded-xl border border-gray-850 bg-slate-950/70 hover:border-cyan-500/30 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-450 font-mono">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>{dateStr}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400 font-sans font-medium line-clamp-1">{record.domain || "Technical Domain"}</span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {record.target_goal || "Mock Interview Prep"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block font-mono uppercase">Readiness</span>
                      <span className={`text-xs font-mono font-black ${
                        overallVal >= 75 ? "text-emerald-400" : overallVal >= 50 ? "text-amber-450" : "text-rose-450"
                      }`}>{overallVal}%</span>
                    </div>

                    <button
                      onClick={() => {
                        setEvaluation(record.evaluation);
                        // Clean states to show evaluation directly
                        setQuestions([]);
                        window.scrollTo({ top: 320, behavior: "smooth" });
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 border border-gray-800 hover:border-cyan-500/40 text-[10px] text-cyan-400 rounded-lg hover:text-white transition-all font-mono"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
