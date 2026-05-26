export interface SkillItem {
  name: string;
  category: "Programming" | "AI/ML" | "Cloud" | "Databases" | "Soft Skills" | "Other";
  proficiency: number;
  description: string;
}

export interface SkillGapItem {
  skillName: string;
  priority: "High" | "Medium" | "Low";
  whyNeeded: string;
}

export interface CareerPathItem {
  title: string;
  matchScore: number;
  salaryRange: string;
  marketDemand: "Very High" | "High" | "Medium" | "Low";
  description: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  improvements: string[];
  formattingScore: number;
  keywordCompleteness: number;
  atsFeedback: string;
}

export interface RoadmapTopic {
  name: string;
  difficulty: "Beginner" | "Medium" | "Hard";
  estimatedTime: string;
  description?: string;
}

export interface RoadmapCourse {
  name: string;
  platform: string;
  type: "Course" | "Certification";
}

export interface RoadmapProject {
  title: string;
  description: string;
  skillsUtilized: string[];
}

export interface LearningRoadmapPhase {
  phaseNumber: number;
  title: string;
  topics: RoadmapTopic[];
  recommendedCourses: RoadmapCourse[];
  projects: RoadmapProject[];
}

export interface ProfileMappingResults {
  skills: SkillItem[];
  skillGaps: SkillGapItem[];
  careerPaths: CareerPathItem[];
  resumeAnalysis: ResumeAnalysis;
  learningRoadmap: LearningRoadmapPhase[];
  info?: string;
}

export interface TrendingTechItem {
  name: string;
  growthRate: string;
  demandIndex: "Very High" | "High" | "Medium";
}

export interface SalaryInsight {
  position: string;
  range: string;
  multiplier: string;
}

export interface EmergingRole {
  roleName: string;
  demandTrend: string;
  salaryReference: string;
}

export interface MarketTrendsResults {
  trendingTech: TrendingTechItem[];
  hiringStatus: string;
  salaryInsights: SalaryInsight[];
  emergingRoles: EmergingRole[];
}

export interface InterviewQuestion {
  id: number;
  type: "Technical core" | "Technical gap" | "Practical coding assessment" | "Behavioral/Culture";
  question: string;
  solutionTemplate?: string;
  rationale: string;
}

export interface AnswerReviewItem {
  questionId: number;
  correctSummary: string;
  score: number;
}

export interface InterviewEvaluationResults {
  technicalAccuracy: number;
  codingScore: number;
  communicationScore: number;
  problemSolving: number;
  confidenceScore: number;
  overallReadiness: number;
  weakTopics?: string[];
  strengths?: string[];
  suggestions?: string[];
  constructiveFeedback: string;
  correctAnswersReview: AnswerReviewItem[];
  fillerWordsMetrics?: {
    totalFound: number;
    wordsByFrequency: Record<string, number>;
  };
}

export interface MentorChatMessage {
  role: "user" | "mentor";
  text: string;
  isPlan?: boolean;
  planHtml?: string;
  timestamp: string;
}

export interface GitHubRepoParsed {
  name: string;
  stars: number;
  description: string;
  languages: string[];
}

export interface GitHubLanguage {
  name: string;
  percentage: number;
  rating: string;
}

export interface GitHubAnalysisResult {
  profileUrl: string;
  activityScore: number;
  languagesDetected: GitHubLanguage[];
  repositoriesParsed: GitHubRepoParsed[];
  extractedSkills: string[];
  expertAdvice: string;
}
