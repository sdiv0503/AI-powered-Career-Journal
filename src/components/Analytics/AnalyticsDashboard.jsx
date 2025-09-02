import React, { useState, useMemo, Suspense, lazy, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  PresentationChartBarIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import ExportManager from './ExportManager';


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
    <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm lg:text-base text-gray-600">Loading...</span>
  </div>
);

const AnalyticsDashboard = ({ analyzedResumes }) => {
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { device, isMobile, isTablet, windowSize } = useResponsive();

  // Memoized selected resume
  const selectedResume = useMemo(() => {
    if (selectedResumeId) {
      return analyzedResumes.find((r) => r.id === selectedResumeId);
    }
    return analyzedResumes[0];
  }, [analyzedResumes, selectedResumeId]);

  // Memoized tab handler
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Memoized resume selector handler
  const handleResumeChange = useCallback((e) => {
    setSelectedResumeId(e.target.value);
  }, []);

  if (!analyzedResumes?.length || !selectedResume?.analysis) {
    return (
      <div className="text-center py-8 lg:py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mb-4" />
        <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">
          No Analytics Available
        </h3>
        <p className="text-sm lg:text-base text-gray-500 px-4">
          Upload and analyze a resume to see detailed skill analytics and
          insights.
        </p>
      </div>
    );
  }

  const { skillAnalysis, qualityMetrics } = selectedResume.analysis;

  // Responsive tab configuration
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
    <div className="space-y-4 lg:space-y-8" data-export-dashboard>
      {/* Responsive Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-200"
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
              className={`font-bold text-gray-900 mb-2 ${
                isMobile ? "text-xl" : "text-2xl"
              }`}
            >
              📊 Advanced Analytics Dashboard
            </h2>
            <p
              className={`text-gray-600 ${isMobile ? "text-sm" : "text-base"}`}
            >
              {isMobile
                ? "Interactive analytics & insights"
                : "Deep insights with interactive drag-and-drop analysis"}
            </p>
          </div>

          {/* Responsive Navigation */}
          <div
            className={`${isMobile ? "w-full" : "flex items-center space-x-4"}`}
          >
            {/* Tab Navigation */}
            <div
              className={`${
                isMobile ? "grid grid-cols-4 gap-1" : "flex space-x-2"
              }`}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    isMobile ? "px-2 py-2 text-xs" : "px-4 py-2 text-sm"
                  } rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  title={tab.fullLabel}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Resume Selector */}
            {analyzedResumes.length > 1 &&
              (activeTab === "overview" || activeTab === "quality") && (
                <div className={`${isMobile ? "w-full mt-3" : "min-w-64"}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isMobile ? "Select Resume" : "Select Resume to Analyze"}
                  </label>
                  <select
                    value={selectedResumeId || selectedResume.id}
                    onChange={handleResumeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {analyzedResumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {isMobile
                          ? resume.fileName.substring(0, 25) +
                            (resume.fileName.length > 25 ? "..." : "")
                          : `${resume.fileName} (${new Date(
                              resume.analyzedAt
                            ).toLocaleDateString()})`}
                      </option>
                    ))}
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
                  <AcademicCapIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
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
                  <ChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                }
                label="Skills"
                value={skillAnalysis.totalSkills}
                compact={isMobile}
              />
              <MetricCard
                icon={
                  <PresentationChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
                }
                label="High Conf."
                value={skillAnalysis.highConfidenceSkills}
                compact={isMobile}
              />
              <MetricCard
                icon={
                  <AcademicCapIcon className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
                }
                label="Expert"
                value={skillAnalysis.expertSkills}
                compact={isMobile}
              />
            </motion.div>

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
                analyzedResumes={analyzedResumes}
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
                  analyzedResumes={analyzedResumes}
                  skillAnalysis={selectedResume?.analysis?.skillAnalysis}
                  qualityMetrics={selectedResume?.analysis?.qualityMetrics}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="min-h-96">
            <ComparisonView analyzedResumes={analyzedResumes} />
          </div>
        )}

        {activeTab === "export" && (
          <div className="min-h-64">
            <ExportManager
              analyzedResumes={analyzedResumes}
              selectedResume={selectedResume}
            />
          </div>
        )}
      </Suspense>
    </div>
  );
};

// Responsive Metric Card Component
const MetricCard = React.memo(({ icon, label, value, compact = false }) => (
  <div className="bg-white rounded-xl p-3 lg:p-6 shadow-lg border border-gray-200 transition-transform hover:scale-105">
    <div
      className={`flex items-center ${
        compact ? "flex-col space-y-2" : "space-x-3 lg:space-x-4"
      }`}
    >
      <div className="p-2 lg:p-3 rounded-lg bg-gray-100 flex-shrink-0">
        {icon}
      </div>
      <div className={compact ? "text-center" : "min-w-0 flex-1"}>
        <p
          className={`font-medium text-gray-600 ${
            compact ? "text-xs" : "text-sm lg:text-base"
          } truncate`}
        >
          {compact && label.length > 8 ? label.substring(0, 8) : label}
        </p>
        <p
          className={`font-bold text-gray-900 ${
            compact ? "text-lg" : "text-xl lg:text-2xl"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
));

// Priority Impact Card Component
const PriorityImpactCard = React.memo(({ skillAnalysis }) => (
  <motion.div
    className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <h4 className="text-lg font-bold text-gray-900 mb-4">🎯 Priority Impact</h4>
    <div className="space-y-3">
      <PriorityCard
        label="High Priority"
        count={skillAnalysis.topSkills?.slice(0, 3).length || 0}
        color="green"
      />
      <PriorityCard
        label="Medium Priority"
        count={skillAnalysis.topSkills?.slice(3, 6).length || 0}
        color="yellow"
      />
      <PriorityCard
        label="Lower Priority"
        count={skillAnalysis.topSkills?.slice(6).length || 0}
        color="gray"
      />
    </div>
  </motion.div>
));

// Priority Card Component
const PriorityCard = React.memo(({ label, count, color }) => {
  const colorClasses = {
    green: "bg-green-50 text-green-800 border-green-100",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-100",
    gray: "bg-gray-50 text-gray-800 border-gray-100",
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
      className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Resume Analysis Summary
      </h3>
      <div
        className={`grid gap-4 lg:gap-6 ${
          isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        <SummarySection title="File Information">
          <ul className="space-y-1 text-sm text-gray-600">
            <li>📄 {selectedResume.fileName}</li>
            <li>
              📅 {new Date(selectedResume.analyzedAt).toLocaleDateString()}
            </li>
            <li>
              📊 {selectedResume.analysis.pageCount} pages,{" "}
              {selectedResume.analysis.sectionCount} sections
            </li>
          </ul>
        </SummarySection>

        <SummarySection title="Top Skills">
          <div className="flex flex-wrap gap-1">
            {skillAnalysis.topSkills
              ?.slice(0, isMobile ? 4 : 6)
              .map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))}
          </div>
        </SummarySection>

        <SummarySection title="Quality Breakdown">
          {qualityMetrics ? (
            <ul className="space-y-1 text-sm text-gray-600">
              <li>📋 Sections: {qualityMetrics.sectionCompleteness}%</li>
              <li>🎯 Skills: {qualityMetrics.skillDiversity}%</li>
              <li>📝 Content: {qualityMetrics.contentDepth}%</li>
              {qualityMetrics.contactCompleteness && (
                <li>📞 Contact: {qualityMetrics.contactCompleteness}%</li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
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
    <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
    {children}
  </div>
));

// Export Button Component
const ExportButton = React.memo(({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <span className="font-medium text-gray-900 text-sm">{title}</span>
    <span className="text-xs text-gray-500 mt-1">{description}</span>
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

export default AnalyticsDashboard;
