import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAnalysis, useAIQuota } from "../../hooks/useAIAnalysis";
import {
  SparklesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// 🎯 UPDATED: Simplified AnalysisResults component
const AnalysisResults = ({ result }) => {
  console.log("📊 AnalysisResults received:", result);

  if (!result) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">No analysis results available.</p>
      </div>
    );
  }

  if (!result.analysis) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Analysis data is missing. Raw result:</p>
        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  const analysis = result.analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 mt-6"
    >
      {/* 🎯 UPDATED: Simplified Analysis Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            📊 Analysis Results
          </h3>
          {/* 🎯 REMOVED: AI vs Smart Analysis badges and confidence display */}
        </div>

        {/* Career Level & ATS Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {analysis.careerLevel && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {analysis.careerLevel.level || "Professional"}
              </div>
              <div className="text-sm text-gray-600">Career Level</div>
              {analysis.careerLevel.description && (
                <div className="text-xs text-gray-500 mt-2">
                  {analysis.careerLevel.description}
                </div>
              )}
            </div>
          )}

          {analysis.atsScore && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {analysis.atsScore.score || 75}%
              </div>
              <div className="text-sm text-gray-600">ATS Compatibility</div>
            </div>
          )}
        </div>

        {/* Skills Detected */}
        {analysis.skills && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              🎯 Detected Skills
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(analysis.skills).map(([category, skills]) => {
                const skillArray = Array.isArray(skills)
                  ? skills
                  : Object.values(skills || {});

                if (!skillArray.length) return null;

                return (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <h5 className="font-medium text-gray-700 mb-2 capitalize">
                      {category} Skills ({skillArray.length})
                    </h5>
                    <div className="space-y-1">
                      {skillArray.slice(0, 5).map((skill, index) => {
                        const skillName =
                          typeof skill === "object" ? skill.name : skill;
                        const confidence =
                          typeof skill === "object" ? skill.confidence : null;

                        return (
                          <div key={index} className="text-sm">
                            <span className="text-gray-800">{skillName}</span>
                            {confidence && (
                              <span className="text-gray-500 text-xs ml-1">
                                ({Math.round(confidence * 100)}%)
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {skillArray.length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{skillArray.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🎯 UPDATED: Simplified Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              💡 Recommendations
            </h4>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`border-l-4 pl-4 py-3 rounded-r-lg ${
                    rec.priority === "high"
                      ? "border-red-400 bg-red-50"
                      : rec.priority === "medium"
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-green-400 bg-green-50"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : rec.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {rec.priority?.toUpperCase() || "MEDIUM"}
                    </span>
                    <h5 className="font-medium text-gray-900">{rec.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.description}
                  </p>
                  {rec.actions && rec.actions.length > 0 && (
                    <ul className="text-xs text-gray-500 space-y-1 ml-4">
                      {rec.actions.map((action, idx) => (
                        <li key={idx} className="list-disc">
                          {action}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {analysis.skillGaps && analysis.skillGaps.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              🎯 Skill Gaps Identified
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.skillGaps.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              💪 Key Strengths
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AIResumeAnalyzer = ({ selectedResume, onAnalysisComplete }) => {
  const [analysisMode, setAnalysisMode] = useState("comprehensive");
  const [manualText, setManualText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const {
    analyzeResume,
    isAnalyzing,
    analysisResult,
    analysisError,
    resetAnalysis,
  } = useAIAnalysis();

  const { data: quotaInfo } = useAIQuota();

  console.log("🔍 Analysis Result:", analysisResult);
  console.log("🔍 Is Analyzing:", isAnalyzing);
  console.log("🔍 Analysis Error:", analysisError);

  const resumeText = useMemo(() => {
    console.log("🔍 Resume text sources:", {
      showManualInput,
      manualTextLength: manualText.length,
      selectedResume: selectedResume
        ? {
            fileName: selectedResume.fileName,
            hasAnalysis: !!selectedResume.analysis,
          }
        : null,
    });

    if (showManualInput) {
      return manualText;
    }

    // Correctly access the nested analysis object
    if (selectedResume?.analysis) {
      const analysisData = selectedResume.analysis;

      const text =
        analysisData.extractedText ||
        analysisData.content ||
        analysisData.rawText ||
        analysisData.sections
          ?.map((section) => section.content?.join(" ") || "")
          .join("\n\n") ||
        "";

      console.log(
        "🔍 Using resume text (first 200 chars):",
        text.substring(0, 200) + "..."
      );
      console.log("🔍 Final text length:", text.length);
      return text;
    }

    return "";
  }, [selectedResume, manualText, showManualInput]);

  const textAnalysis = useMemo(() => {
    const length = resumeText.length;
    const wordCount = resumeText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    const status = {
      length,
      wordCount,
      isValid: length >= 100,
      severity: length < 50 ? "error" : length < 100 ? "warning" : "success",
      message:
        length < 50
          ? "Resume text is too short for meaningful analysis"
          : length < 100
          ? "Add more details for better analysis accuracy"
          : "Ready for comprehensive analysis",
      suggestions: [],
    };

    if (length < 100) {
      status.suggestions = [
        "Add work experience descriptions with specific achievements",
        "Include detailed skill listings and proficiency levels",
        "Expand education section with relevant coursework or projects",
        "Add professional summary highlighting your key strengths",
      ];
    }

    return status;
  }, [resumeText]);

  console.log("🔍 Text Analysis Results:", {
    textLength: textAnalysis.length,
    wordCount: textAnalysis.wordCount,
    isValid: textAnalysis.isValid,
    severity: textAnalysis.severity,
    resumeFileName: selectedResume?.fileName,
    showManualInput,
    actualTextPreview: resumeText.substring(0, 100) + "...",
  });

  const handleAnalyze = async () => {
    console.log("🔍 handleAnalyze called - validation check:", textAnalysis);
    console.log(
      "🔍 Resume text preview:",
      resumeText.substring(0, 200) + "..."
    );
    console.log("🔍 Resume text length:", resumeText.length);

    if (!textAnalysis.isValid) {
      console.log("🔍 Analysis blocked - text not valid");
      return;
    }

    try {
      console.log("🔍 About to call analyzeResume with:", {
        resumeTextLength: resumeText.length,
        resumeFileName: selectedResume?.fileName,
        analysisMode,
      });

      await analyzeResume({
        resumeText,
        resumeData: selectedResume,
        analysisMode,
      });

      console.log("🔍 Analysis completed successfully");

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (error) {
      console.error("🔍 Analysis failed with error:", error);
    }
  };

  const ResumeContentValidator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 border-l-4 ${
        textAnalysis.severity === "error"
          ? "bg-red-50 border-red-400"
          : textAnalysis.severity === "warning"
          ? "bg-yellow-50 border-yellow-400"
          : "bg-green-50 border-green-400"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {textAnalysis.severity === "error" ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          ) : textAnalysis.severity === "warning" ? (
            <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
          ) : (
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4
              className={`font-medium ${
                textAnalysis.severity === "error"
                  ? "text-red-800"
                  : textAnalysis.severity === "warning"
                  ? "text-yellow-800"
                  : "text-green-800"
              }`}
            >
              Content Analysis
            </h4>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{textAnalysis.length} characters</span>
              <span>{textAnalysis.wordCount} words</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                textAnalysis.severity === "error"
                  ? "bg-red-500"
                  : textAnalysis.severity === "warning"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(100, (textAnalysis.length / 100) * 100)}%`,
              }}
            />
          </div>

          <p
            className={`text-sm mb-2 ${
              textAnalysis.severity === "error"
                ? "text-red-700"
                : textAnalysis.severity === "warning"
                ? "text-yellow-700"
                : "text-green-700"
            }`}
          >
            {textAnalysis.message}
          </p>

          {textAnalysis.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                💡 Suggestions to improve analysis:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {textAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Minimum required: 100 characters for reliable analysis
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ManualTextInput = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4"
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Resume Text (Paste your resume content here)
      </label>
      <textarea
        value={manualText}
        onChange={(e) => setManualText(e.target.value)}
        placeholder="Paste your resume text here for analysis..."
        className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-sm"
        maxLength={10000}
      />
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>{manualText.length} / 10,000 characters</span>
        <button
          onClick={() => setManualText("")}
          className="text-blue-600 hover:text-blue-800"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );

  const SampleResumeTemplates = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
    >
      <h4 className="font-medium text-blue-900 mb-3">
        📝 Try with sample resume
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            title: "Software Engineer",
            sample:
              "John Smith\nSoftware Engineer\nEmail: john@example.com\nPhone: (555) 123-4567\n\nEXPERIENCE:\nSoftware Engineer at TechCorp (2020-2023)\n• Developed React applications serving 10,000+ users\n• Implemented REST APIs using Node.js and Express\n• Collaborated with cross-functional teams to deliver features\n• Reduced page load time by 40% through optimization\n\nSKILLS:\nJavaScript, React, Node.js, Python, Git, AWS, MongoDB\n\nEDUCATION:\nBachelor of Science in Computer Science\nUniversity of Technology (2016-2020)",
          },
          {
            title: "Marketing Manager",
            sample:
              "Sarah Johnson\nMarketing Manager\nEmail: sarah@example.com\nPhone: (555) 987-6543\n\nEXPERIENCE:\nMarketing Manager at GrowthCo (2019-2023)\n• Led digital marketing campaigns with $500K+ budget\n• Increased lead generation by 150% through SEO optimization\n• Managed team of 5 marketing specialists\n• Developed social media strategy reaching 100K+ followers\n\nSKILLS:\nDigital Marketing, SEO, Social Media, Analytics, Team Leadership\n\nEDUCATION:\nMBA in Marketing\nBusiness University (2017-2019)",
          },
        ].map((template, index) => (
          <button
            key={index}
            onClick={() => {
              setManualText(template.sample);
              setShowManualInput(true);
            }}
            className="text-left p-3 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="font-medium text-blue-800 mb-1">
              {template.title}
            </div>
            <div className="text-xs text-blue-600">
              Click to load sample resume
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <SparklesIcon className="h-8 w-8 text-purple-600" />
          {/* 🎯 UPDATED: Simplified title */}
          <h1 className="text-3xl font-bold text-white-900">Resume Analyzer</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get intelligent insights, skill analysis, and career recommendations
          with comprehensive resume parsing and analysis.
        </p>
      </motion.div>

      {/* 🎯 REMOVED: Quota Display - no longer showing AI quota */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resume Analysis
        </h3>

        <div className="mb-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setShowManualInput(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showManualInput
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              📄 Use Uploaded Resume
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showManualInput
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              ✏️ Paste Resume Text
            </button>
          </div>

          {!showManualInput && selectedResume ? (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedResume.fileName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Uploaded:{" "}
                    {new Date(selectedResume.analyzedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : !showManualInput ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 text-sm">
                  No resume selected. Please upload a resume or paste text
                  manually.
                </span>
              </div>
            </div>
          ) : null}

          <AnimatePresence>
            {showManualInput && <ManualTextInput />}
          </AnimatePresence>
        </div>

        {resumeText && <ResumeContentValidator />}
        {!textAnalysis.isValid && <SampleResumeTemplates />}

        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !textAnalysis.isValid}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all ${
              isAnalyzing || !textAnalysis.isValid
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {isAnalyzing ? (
              <>
                <ClockIcon className="h-5 w-5 animate-spin" />
                <span>Analyzing Resume...</span>
              </>
            ) : !textAnalysis.isValid ? (
              <>
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Add More Content to Analyze</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                {/* 🎯 UPDATED: Simplified button text */}
                <span>Analyze Resume</span>
              </>
            )}
          </button>

          {analysisResult && (
            <button
              onClick={resetAnalysis}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              New Analysis
            </button>
          )}
        </div>

        {analysisError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <span className="text-red-800">
                Analysis failed: {analysisError.message}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <AnalysisResults result={analysisResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIResumeAnalyzer;
