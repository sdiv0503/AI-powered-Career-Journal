import React, { useState, useMemo, Suspense, lazy, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  PresentationChartBarIcon,
  AcademicCapIcon,
  CpuChipIcon,
  SparklesIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
// import ExportManager from './ExportManager';


// Custom responsive hook for React 19
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const device =
    windowSize.width < 640
      ? "mobile"
      : windowSize.width < 1024
      ? "tablet"
      : "desktop";

  return {
    windowSize,
    device,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
    breakpoint: {
      xs: windowSize.width < 640,
      sm: windowSize.width >= 640 && windowSize.width < 768,
      md: windowSize.width >= 768 && windowSize.width < 1024,
      lg: windowSize.width >= 1024 && windowSize.width < 1280,
      xl: windowSize.width >= 1280,
    },
  };
};

// Retry mechanism for lazy loading
const retryImport = (importFn, retriesLeft = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retriesLeft === 1) {
          reject(error);
          return;
        }
        setTimeout(() => {
          retryImport(importFn, retriesLeft - 1, delay).then(resolve, reject);
        }, delay);
      });
  });
};

// Lazy load components with retry mechanism
const SkillRadarChart = lazy(() =>
  retryImport(() => import("./SkillRadarChart"))
);
const SkillCategoryChart = lazy(() =>
  retryImport(() => import("./SkillCategoryChart"))
);
const DraggableSkillList = lazy(() =>
  retryImport(() => import("./DraggableSkillList"))
);
const QualityMetricsChart = lazy(() =>
  retryImport(() => import("./QualityMetricsChart"))
);
const RecommendationPriorityMatrix = lazy(() =>
  retryImport(() => import("./RecommendationPriorityMatrix"))
);
const AchievementTracker = lazy(() =>
  retryImport(() => import("./AchievementTracker"))
);
const ComparisonView = lazy(() =>
  retryImport(() => import("./ComparisonView"))
);

// Enhanced loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8 lg:py-12">
    <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
    <span className="ml-2 text-sm lg:text-base text-gray-600 dark:text-gray-300">
      Loading...
    </span>
  </div>
);

const AnalyticsDashboard = ({ analyzedResumes, onAIAnalysis }) => {
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { device, isMobile, isTablet, windowSize } = useResponsive();

  // 🔧 FIXED: Safe data validation from our conversation
  const validResumes = useMemo(() => {
    if (!analyzedResumes || !Array.isArray(analyzedResumes)) {
      return [];
    }

    return analyzedResumes.filter((resume) => {
      return (
        resume &&
        (resume.analysis || resume.error) &&
        (resume.fileName || resume.name)
      );
    });
  }, [analyzedResumes]);

  // Memoized selected resume
  const selectedResume = useMemo(() => {
    if (selectedResumeId) {
      return validResumes.find((r) => r.id === selectedResumeId);
    }
    return validResumes[0];
  }, [validResumes, selectedResumeId]);

  // Memoized tab handler
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Memoized resume selector handler
  const handleResumeChange = useCallback((e) => {
    setSelectedResumeId(e.target.value);
  }, []);

  // 🤖 NEW: AI Analysis Handler
  const handleAIAnalysis = useCallback(
    async (analysisType = "comprehensive") => {
      if (!selectedResume) {
        toast.error("Please select a resume to analyze");
        return;
      }

      setAiAnalysisLoading(true);

      try {
        toast.loading("🤖 Running AI analysis...", { id: "ai-analysis" });

        // Call the AI analysis function passed from parent
        if (onAIAnalysis) {
          const result = await onAIAnalysis(selectedResume, analysisType);
          setAiInsights(result);
          toast.success("✅ AI analysis completed!", { id: "ai-analysis" });
        } else {
          // Fallback - simulate AI analysis for demo
          setTimeout(() => {
            const mockInsights = generateMockAIInsights(selectedResume);
            setAiInsights(mockInsights);
            toast.success("✅ AI analysis completed!", { id: "ai-analysis" });
            setAiAnalysisLoading(false);
          }, 3000);
          return;
        }
      } catch (error) {
        console.error("AI Analysis error:", error);
        toast.error("Failed to complete AI analysis", { id: "ai-analysis" });
      } finally {
        setAiAnalysisLoading(false);
      }
    },
    [selectedResume, onAIAnalysis]
  );

  // 🤖 NEW: Mock AI insights generator (for demo purposes)
  const generateMockAIInsights = (resume) => {
    const skills = resume.analysis.skillAnalysis?.topSkills || [];
    return {
      overallAssessment: {
        score: Math.floor(Math.random() * 20) + 80,
        strengths: [
          "Strong technical skill diversity",
          "Well-structured resume format",
          "Good experience progression",
        ],
        improvements: [
          "Add more quantified achievements",
          "Include industry-specific keywords",
          "Strengthen project descriptions",
        ],
      },
      careerRecommendations: [
        {
          role: "Senior Software Engineer",
          matchScore: 92,
          reasoning:
            "Your React and JavaScript skills align perfectly with this role",
        },
        {
          role: "Full Stack Developer",
          matchScore: 88,
          reasoning:
            "Your backend and frontend experience makes you a strong candidate",
        },
      ],
      skillGapAnalysis: {
        missingSkills: ["Docker", "Kubernetes", "AWS"],
        emergingSkills: ["Next.js", "GraphQL", "TypeScript"],
        recommendations: "Focus on cloud technologies to advance your career",
      },
      marketInsights: {
        demandLevel: "High",
        salaryRange: "$75,000 - $120,000",
        trendingIndustries: ["FinTech", "HealthTech", "E-commerce"],
      },
    };
  };

  // 🔧 FIXED: Enhanced validation and logging
  console.log("📊 AnalyticsDashboard Debug:", {
    analyzedResumesLength: analyzedResumes?.length || 0,
    validResumesLength: validResumes.length,
    selectedResume: selectedResume?.fileName || "none",
    hasAnalysis: !!selectedResume?.analysis,
    aiInsightsAvailable: !!aiInsights,
  });

  if (!validResumes?.length || !selectedResume?.analysis) {
    return (
      <div className="text-center py-8 lg:py-12 bg-white dark:bg-gray-800 rounded-xl">
        <ChartBarIcon className="mx-auto h-12 w-12 lg:h-16 lg:w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg lg:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Analytics Available
        </h3>
        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 px-4">
          Upload and analyze a resume to see detailed skill analytics and
          insights.
        </p>
      </div>
    );
  }

  const { skillAnalysis, qualityMetrics } = selectedResume.analysis;

  // 🤖 UPDATED: Enhanced tab configuration with AI Analysis
  const tabs = [
    {
      id: "overview",
      label: isMobile ? "📊" : "📊 Overview",
      fullLabel: "Overview",
    },
    {
      id: "quality",
      label: isMobile ? "📈" : "📈 Quality",
      fullLabel: "Quality Metrics",
    },
    {
      id: "ai-analysis",
      label: isMobile ? "🤖" : "🤖 AI Analysis",
      fullLabel: "AI Analysis",
      isNew: true,
    },
    {
      id: "comparison",
      label: isMobile ? "🔄" : "🔄 Compare",
      fullLabel: "Compare",
    },
    {
      id: "export",
      label: isMobile ? "📤" : "📤 Export",
      fullLabel: "Export & Share",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 🔧 FIXED: Responsive Header with Dark Mode */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 lg:p-6 border border-blue-200 dark:border-blue-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`${
            isMobile ? "space-y-4" : "flex items-center justify-between"
          }`}
        >
          <div>
            <h2
              className={`font-bold text-gray-900 dark:text-gray-100 mb-2 ${
                isMobile ? "text-xl" : "text-2xl"
              }`}
            >
              📊 Advanced Analytics Dashboard
            </h2>
            <p
              className={`text-gray-600 dark:text-gray-300 ${
                isMobile ? "text-sm" : "text-base"
              }`}
            >
              {isMobile
                ? "Interactive analytics & AI insights"
                : "Deep insights with interactive analysis and AI-powered recommendations"}
            </p>
          </div>

          {/* Responsive Navigation */}
          <div
            className={`${isMobile ? "w-full" : "flex items-center space-x-4"}`}
          >
            {/* Tab Navigation */}
            <div
              className={`${
                isMobile ? "grid grid-cols-3 gap-1" : "flex flex-wrap gap-2"
              }`}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    isMobile ? "px-2 py-2 text-xs" : "px-4 py-2 text-sm"
                  } rounded-lg font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                  title={tab.fullLabel}
                >
                  {tab.label}
                  {tab.isNew && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Resume Selector */}
            {validResumes.length > 1 &&
              (activeTab === "overview" ||
                activeTab === "quality" ||
                activeTab === "ai-analysis") && (
                <div className={`${isMobile ? "w-full mt-3" : "min-w-64"}`}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isMobile ? "Select Resume" : "Select Resume to Analyze"}
                  </label>
                  <select
                    value={selectedResumeId || selectedResume.id}
                    onChange={handleResumeChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {validResumes.map((resume) => {
                      // 🔧 FIXED: Safe string handling from our conversation
                      const fileName =
                        resume.fileName || resume.name || "Unknown Resume";
                      const displayName =
                        typeof fileName === "string" && fileName.length > 0
                          ? isMobile && fileName.length > 25
                            ? `${fileName.substring(0, 25)}...`
                            : fileName
                          : "Unknown Resume";

                      return (
                        <option key={resume.id} value={resume.id}>
                          {isMobile
                            ? displayName
                            : `${displayName} (${new Date(
                                resume.analyzedAt
                              ).toLocaleDateString()})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
          </div>
        </div>
      </motion.div>

      {/* Tab Content with Enhanced Error Boundary */}
      <Suspense fallback={<LoadingSpinner />}>
        {activeTab === "overview" && (
          <>
            {/* Responsive Key Metrics */}
            <motion.div
              className={`grid gap-4 lg:gap-6 ${
                isMobile
                  ? "grid-cols-2"
                  : isTablet
                  ? "grid-cols-2"
                  : "grid-cols-4"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <MetricCard
                icon={
                  <AcademicCapIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                }
                label="Quality"
                value={`${
                  qualityMetrics?.overallScore ||
                  Math.round(selectedResume.analysis.confidence * 100)
                }%`}
                compact={isMobile}
              />
              <MetricCard
                icon={
                  <ChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                }
                label="Skills"
                value={skillAnalysis?.totalSkills || 0}
                compact={isMobile}
              />
              <MetricCard
                icon={
                  <PresentationChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400" />
                }
                label="High Conf."
                value={skillAnalysis?.highConfidenceSkills || 0}
                compact={isMobile}
              />
              <MetricCard
                icon={
                  <CpuChipIcon className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600 dark:text-orange-400" />
                }
                label="AI Score"
                value={aiInsights?.overallAssessment?.score || "—"}
                compact={isMobile}
                onClick={() => setActiveTab("ai-analysis")}
                clickable={true}
              />
            </motion.div>

            {/* Quick AI Insights Preview */}
            {aiInsights && (
              <motion.div
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 lg:p-6 border border-purple-200 dark:border-purple-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                    🤖 AI Insights Preview
                  </h3>
                  <button
                    onClick={() => setActiveTab("ai-analysis")}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 text-sm font-medium"
                  >
                    View Full Analysis →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                      Top Strength
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {aiInsights.overallAssessment?.strengths[0]}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                      Career Match
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {aiInsights.careerRecommendations?.[0]?.role}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                      Market Demand
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {aiInsights.marketInsights?.demandLevel}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Responsive Charts Layout */}
            <div
              className={`grid gap-4 lg:gap-8 ${
                isMobile ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"
              }`}
            >
              <div data-export-chart="skill-radar" className="min-h-80">
                <SkillRadarChart skillAnalysis={skillAnalysis} />
              </div>
              <div data-export-chart="skill-categories" className="min-h-80">
                <SkillCategoryChart skillAnalysis={skillAnalysis} />
              </div>
            </div>

            {/* Skills Management Section */}
            {selectedResume?.analysis?.skillAnalysis?.topSkills && (
              <div
                className={`grid gap-4 lg:gap-8 ${
                  isMobile ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-3"
                }`}
              >
                <div className={isMobile ? "col-span-1" : "xl:col-span-2"}>
                  <DraggableSkillList
                    skills={selectedResume.analysis.skillAnalysis.topSkills}
                    onReorder={(reorderedSkills) => {
                      console.log("Skills reordered:", reorderedSkills);
                    }}
                    title="🎯 Prioritize Your Skills"
                  />
                </div>

                {!isMobile && (
                  <div>
                    <PriorityImpactCard skillAnalysis={skillAnalysis} />
                  </div>
                )}
              </div>
            )}

            {/* Resume Summary - Responsive */}
            <ResumeSummaryCard
              selectedResume={selectedResume}
              skillAnalysis={skillAnalysis}
              qualityMetrics={qualityMetrics}
              isMobile={isMobile}
            />
          </>
        )}

        {activeTab === "quality" && (
          <div className="space-y-4 lg:space-y-8">
            <div data-export-chart="quality-metrics" className="min-h-96">
              <QualityMetricsChart
                analyzedResumes={validResumes}
                selectedResumeId={selectedResumeId}
              />
            </div>

            <div
              className={`grid gap-4 lg:gap-8 ${
                isMobile ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"
              }`}
            >
              <div data-export-chart="priority-matrix" className="min-h-80">
                <RecommendationPriorityMatrix
                  skillAnalysis={selectedResume?.analysis?.skillAnalysis}
                  qualityMetrics={selectedResume?.analysis?.qualityMetrics}
                />
              </div>

              <div data-export-chart="achievements" className="min-h-80">
                <AchievementTracker
                  analyzedResumes={validResumes}
                  skillAnalysis={selectedResume?.analysis?.skillAnalysis}
                  qualityMetrics={selectedResume?.analysis?.qualityMetrics}
                />
              </div>
            </div>
          </div>
        )}

        {/* 🤖 NEW: AI Analysis Tab */}
        {activeTab === "ai-analysis" && (
          <div className="space-y-6">
            {/* AI Analysis Controls */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    🤖 AI-Powered Resume Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get intelligent insights, career recommendations, and market
                    analysis powered by AI
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAIAnalysis("quick")}
                    disabled={aiAnalysisLoading}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiAnalysisLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "⚡ Quick Analysis"
                    )}
                  </button>
                  <button
                    onClick={() => handleAIAnalysis("comprehensive")}
                    disabled={aiAnalysisLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiAnalysisLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "🔍 Deep Analysis"
                    )}
                  </button>
                </div>
              </div>

              {/* Analysis Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <AnalysisTypeCard
                  icon={<SparklesIcon className="w-6 h-6" />}
                  title="Career Matching"
                  description="AI matches your profile with suitable job roles"
                />
                <AnalysisTypeCard
                  icon={<BeakerIcon className="w-6 h-6" />}
                  title="Skill Gap Analysis"
                  description="Identify missing skills for your target roles"
                />
                <AnalysisTypeCard
                  icon={<ChartBarIcon className="w-6 h-6" />}
                  title="Market Insights"
                  description="Get salary ranges and industry trends"
                />
              </div>
            </motion.div>

            {/* AI Analysis Results */}
            {aiInsights && (
              <AIInsightsDisplay insights={aiInsights} isMobile={isMobile} />
            )}

            {/* No Analysis State */}
            {!aiInsights && !aiAnalysisLoading && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <CpuChipIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ready for AI Analysis
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Click one of the analysis buttons above to get AI-powered
                  insights about your resume
                </p>
                <button
                  onClick={() => handleAIAnalysis("comprehensive")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  🚀 Start AI Analysis
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="min-h-96">
            <ComparisonView analyzedResumes={validResumes} />
          </div>
        )}

        {activeTab === "export" && (
          <div className="min-h-64">
            <ExportManager
              analyzedResumes={validResumes}
              selectedResume={selectedResume}
              aiInsights={aiInsights}
            />
          </div>
        )}
      </Suspense>
    </div>
  );
};

// 🤖 NEW: Analysis Type Card Component
const AnalysisTypeCard = React.memo(({ icon, title, description }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <div className="flex items-center space-x-3 mb-2">
      <div className="text-purple-600 dark:text-purple-400">{icon}</div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
));

// 🤖 NEW: AI Insights Display Component
const AIInsightsDisplay = React.memo(({ insights, isMobile }) => (
  <motion.div
    className="space-y-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {/* Overall Assessment */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        📋 Overall Assessment
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {insights.overallAssessment?.score || "—"}/100
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI Resume Score
          </p>
        </div>
        <div>
          <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
            ✅ Strengths
          </h4>
          <ul className="text-sm space-y-1">
            {insights.overallAssessment?.strengths?.map((strength, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-400">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">
            🎯 Improvements
          </h4>
          <ul className="text-sm space-y-1">
            {insights.overallAssessment?.improvements?.map(
              (improvement, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">
                  • {improvement}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>

    {/* Career Recommendations */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        🎯 Career Recommendations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.careerRecommendations?.map((rec, index) => (
          <div
            key={index}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {rec.role}
              </h4>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                {rec.matchScore}%
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {rec.reasoning}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Skill Gap Analysis & Market Insights */}
    <div
      className={`grid gap-6 ${
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          🔍 Skill Gap Analysis
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
              Missing Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {insights.skillGapAnalysis?.missingSkills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
              Emerging Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {insights.skillGapAnalysis?.emergingSkills?.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              {insights.skillGapAnalysis?.recommendations}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          📈 Market Insights
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Demand Level
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                insights.marketInsights?.demandLevel === "High"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
              }`}
            >
              {insights.marketInsights?.demandLevel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Salary Range
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {insights.marketInsights?.salaryRange}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 block mb-2">
              Trending Industries
            </span>
            <div className="flex flex-wrap gap-2">
              {insights.marketInsights?.trendingIndustries?.map(
                (industry, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-sm"
                  >
                    {industry}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));

// 🔧 ENHANCED: Responsive Metric Card Component with Dark Mode and Click Support
const MetricCard = React.memo(
  ({ icon, label, value, compact = false, onClick, clickable = false }) => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        clickable
          ? "hover:scale-105 cursor-pointer hover:shadow-xl"
          : "hover:scale-105"
      }`}
      onClick={onClick}
    >
      <div
        className={`flex items-center ${
          compact ? "flex-col space-y-2" : "space-x-3 lg:space-x-4"
        }`}
      >
        <div className="p-2 lg:p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {icon}
        </div>
        <div className={compact ? "text-center" : "min-w-0 flex-1"}>
          <p
            className={`font-medium text-gray-600 dark:text-gray-400 ${
              compact ? "text-xs" : "text-sm lg:text-base"
            } truncate`}
          >
            {compact && label.length > 8 ? label.substring(0, 8) : label}
          </p>
          <p
            className={`font-bold text-gray-900 dark:text-gray-100 ${
              compact ? "text-lg" : "text-xl lg:text-2xl"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
      {clickable && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          Click for AI insights
        </div>
      )}
    </div>
  )
);

// Priority Impact Card Component
const PriorityImpactCard = React.memo(({ skillAnalysis }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
      🎯 Priority Impact
    </h4>
    <div className="space-y-3">
      <PriorityCard
        label="High Priority"
        count={skillAnalysis?.topSkills?.slice(0, 3).length || 0}
        color="green"
      />
      <PriorityCard
        label="Medium Priority"
        count={skillAnalysis?.topSkills?.slice(3, 6).length || 0}
        color="yellow"
      />
      <PriorityCard
        label="Lower Priority"
        count={skillAnalysis?.topSkills?.slice(6).length || 0}
        color="gray"
      />
    </div>
  </motion.div>
));

// Priority Card Component
const PriorityCard = React.memo(({ label, count, color }) => {
  const colorClasses = {
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-100 dark:border-green-700",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-100 dark:border-yellow-700",
    gray: "bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-100 dark:border-gray-600",
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses[color]}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
});

// Resume Summary Card Component
const ResumeSummaryCard = React.memo(
  ({ selectedResume, skillAnalysis, qualityMetrics, isMobile }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Resume Analysis Summary
      </h3>
      <div
        className={`grid gap-4 lg:gap-6 ${
          isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        <SummarySection title="File Information">
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>📄 {selectedResume.fileName || "Unknown Resume"}</li>
            <li>
              📅 {new Date(selectedResume.analyzedAt).toLocaleDateString()}
            </li>
            <li>
              📊 {selectedResume.analysis.pageCount || 1} pages,{" "}
              {selectedResume.analysis.sections?.length || "Multiple"} sections
            </li>
          </ul>
        </SummarySection>

        <SummarySection title="Top Skills">
          <div className="flex flex-wrap gap-1">
            {skillAnalysis?.topSkills
              ?.slice(0, isMobile ? 4 : 6)
              .map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium"
                >
                  {skill.name || skill}
                </span>
              ))}
          </div>
        </SummarySection>

        <SummarySection title="Quality Breakdown">
          {qualityMetrics ? (
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>📋 Sections: {qualityMetrics.sectionCompleteness}%</li>
              <li>🎯 Skills: {qualityMetrics.skillDiversity}%</li>
              <li>📝 Content: {qualityMetrics.contentDepth}%</li>
              {qualityMetrics.contactCompleteness && (
                <li>📞 Contact: {qualityMetrics.contactCompleteness}%</li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quality metrics not available
            </p>
          )}
        </SummarySection>
      </div>
    </motion.div>
  )
);

// Summary Section Component
const SummarySection = React.memo(({ title, children }) => (
  <div>
    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
      {title}
    </h4>
    {children}
  </div>
));

// Simple Export Manager placeholder
const ExportManager = React.memo(({ analyzedResumes, selectedResume }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
      📤 Export & Share
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <ExportButton
        icon="📄"
        title="Export PDF"
        description="Complete report"
        onClick={() => alert("PDF export coming soon!")}
      />
      <ExportButton
        icon="🖼️"
        title="Export Charts"
        description="PNG images"
        onClick={() => alert("Chart export coming soon!")}
      />
      <ExportButton
        icon="🔗"
        title="Share Report"
        description="Generate link"
        onClick={() => alert("Share feature coming soon!")}
      />
      <ExportButton
        icon="📧"
        title="Email Report"
        description="Send via email"
        onClick={() => {
          const subject = encodeURIComponent(
            `Resume Analysis Report - ${selectedResume?.fileName || "Report"}`
          );
          const body = encodeURIComponent(
            `Hi,\n\nI've generated a resume analysis report. Here are the key insights:\n\n${
              selectedResume
                ? `Resume: ${selectedResume.fileName}\nTotal Skills: ${
                    selectedResume.analysis.skillAnalysis.totalSkills
                  }\nQuality Score: ${
                    selectedResume.analysis.qualityMetrics?.overallScore ||
                    Math.round(selectedResume.analysis.confidence * 100)
                  }%`
                : "Please generate a report first."
            }\n\nBest regards`
          );
          window.open(`mailto:?subject=${subject}&body=${body}`);
        }}
      />
    </div>
  </div>
));

// Export Button Component
const ExportButton = React.memo(({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
      {title}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {description}
    </span>
  </button>
));

// Set display names for React DevTools
MetricCard.displayName = "MetricCard";
PriorityImpactCard.displayName = "PriorityImpactCard";
PriorityCard.displayName = "PriorityCard";
ResumeSummaryCard.displayName = "ResumeSummaryCard";
SummarySection.displayName = "SummarySection";
ExportManager.displayName = "ExportManager";
ExportButton.displayName = "ExportButton";
AnalysisTypeCard.displayName = "AnalysisTypeCard";
AIInsightsDisplay.displayName = "AIInsightsDisplay";

export default AnalyticsDashboard;
