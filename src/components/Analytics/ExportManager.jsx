import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// ✅ Import the chart components
import SkillRadarChart from "./SkillRadarChart";
import SkillCategoryChart from "./SkillCategoryChart";
import QualityMetricsChart from "./QualityMetricsChart";

const ExportManager = ({
  analyzedResumes = [],
  selectedResume,
  aiInsights,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Helper function to fix oklch colors before capturing
  const fixOklchColors = (element) => {
    const allElements = [element, ...element.querySelectorAll('*')];
    const originalStyles = [];
    
    allElements.forEach((el, index) => {
      const computedStyle = window.getComputedStyle(el);
      const originalStyle = {};
      
      // Check for oklch colors and convert them
      ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(prop => {
        const value = computedStyle[prop];
        if (value && value.includes('oklch')) {
          originalStyle[prop] = el.style[prop];
          // Convert oklch to a fallback color
          el.style[prop] = convertOklchToHex(value);
        }
      });
      
      originalStyles[index] = originalStyle;
    });
    
    return () => {
      // Restore original styles
      allElements.forEach((el, index) => {
        const original = originalStyles[index];
        Object.keys(original).forEach(prop => {
          if (original[prop]) {
            el.style[prop] = original[prop];
          } else {
            el.style.removeProperty(prop);
          }
        });
      });
    };
  };

  // ✅ Convert oklch to hex (simplified conversion)
  const convertOklchToHex = (oklchString) => {
    // This is a simplified conversion - in production you might want to use a proper library
    const fallbackColors = {
      'oklch(0.7 0.15 142)': '#22c55e', // green-500
      'oklch(0.6 0.2 250)': '#3b82f6',  // blue-500
      'oklch(0.65 0.25 310)': '#a855f7', // purple-500
      'oklch(0.75 0.2 85)': '#eab308',   // yellow-500
      'oklch(0.65 0.2 15)': '#ef4444',   // red-500
    };
    
    // Try to find a close match or return a default color
    return fallbackColors[oklchString] || '#6b7280'; // gray-500 as fallback
  };

  const generatePDFReport = async () => {
    if (!selectedResume?.analysis) {
      toast.error("A successful analysis is required to export.");
      return;
    }

    setIsExporting(true);
  };

  useEffect(() => {
    if (isExporting) {
      const performPdfGeneration = async () => {
        const toastId = "pdf-export";
        toast.loading("📄 Generating comprehensive PDF report...", {
          id: toastId,
        });

        // Allow time for charts to render
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });
          const resumeName =
            selectedResume.name || selectedResume.fileName || "Untitled";

          // Page 1: Title Page & Executive Summary
          createTitlePage(doc, selectedResume, aiInsights);

          // Page 2: Visual Analytics Charts
          doc.addPage();
          await createChartsPage(doc);

          // Page 3: Detailed Analysis
          doc.addPage();
          createDetailedAnalysisPage(doc, selectedResume);

          if (aiInsights) {
            doc.addPage();
            createAIInsightsPage(doc, aiInsights);
          }

          addFooters(doc);

          const fileName = `Resume_Analysis_${resumeName.replace(
            /\.[^/.]+$/,
            ""
          )}_${new Date().toISOString().split("T")[0]}.pdf`;
          doc.save(fileName);

          toast.success("✅ PDF report generated successfully!", {
            id: toastId,
          });
        } catch (error) {
          console.error("PDF generation error:", error);
          toast.error(`Failed to generate PDF: ${error.message}`, {
            id: toastId,
          });
        } finally {
          setIsExporting(false);
        }
      };

      performPdfGeneration();
    }
  }, [isExporting, selectedResume, analyzedResumes, aiInsights]);

  const createTitlePage = (doc, resume, insights) => {
    const { analysis } = resume;
    const qualityScore =
      analysis.qualityMetrics?.overallScore ||
      Math.round(analysis.confidence * 100);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor("#2563EB");
    doc.text("Comprehensive Resume Analysis Report", 105, 40, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor("#4B5563");
    doc.text(resume.name || resume.fileName, 105, 55, { align: "center" });

    doc.setDrawColor("#E5E7EB");
    doc.setFillColor("#F9FAFB");
    doc.roundedRect(20, 70, 170, 55, 3, 3, "FD");

    doc.setFontSize(11);
    doc.setTextColor("#1F2937");
    doc.text(
      `Analysis Date: ${new Date(resume.analyzedAt).toLocaleDateString()}`,
      25,
      80
    );
    doc.text(`Overall Quality Score: ${qualityScore}%`, 25, 88);
    doc.text(
      `Total Skills Detected: ${analysis.skillAnalysis?.totalSkills || 0}`,
      25,
      96
    );
    doc.text(
      `AI Score: ${insights?.overallAssessment?.score || "N/A"}`,
      25,
      104
    );

    if (insights?.overallAssessment?.strengths) {
      doc.setFont("helvetica", "bold");
      doc.text("AI First Impression:", 25, 115);
      doc.setFont("helvetica", "italic");
      const summaryText = doc.splitTextToSize(
        `"${insights.overallAssessment.strengths[0]}"`,
        160
      );
      doc.text(summaryText, 25, 122);
    }
  };

  // ✅ FIXED: Enhanced chart capture with oklch color handling
  const createChartsPage = async (doc) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#1F2937");
    doc.text("Visual Analytics", 20, 25);

    const chartElements = document.querySelectorAll(
      "#pdf-export-container [data-export-chart]"
    );
    let yPosition = 40;

    if (chartElements.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("#EF4444");
      doc.text("No chart elements were found to render.", 20, yPosition);
      return;
    }

    for (const chartEl of chartElements) {
      let restoreStyles = null;
      
      try {
        // Fix oklch colors before capture
        restoreStyles = fixOklchColors(chartEl);
        
        // Enhanced html2canvas options for better compatibility
        const canvas = await html2canvas(chartEl, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          logging: false,
          removeContainer: true,
          imageTimeout: 15000,
          // Ignore problematic CSS properties
          ignoreElements: (element) => {
            return element.classList?.contains('ignore-export') || false;
          },
          onclone: (clonedDoc) => {
            // Additional cleanup for cloned document
            const clonedElements = clonedDoc.querySelectorAll('*');
            clonedElements.forEach(el => {
              const style = el.style;
              // Remove problematic CSS properties
              ['filter', 'backdrop-filter', 'mask', 'clip-path'].forEach(prop => {
                if (style[prop]) {
                  style.removeProperty(prop);
                }
              });
            });
          }
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > 280 && chartEl !== chartElements[0]) {
          doc.addPage();
          yPosition = 25;
        }

        doc.addImage(
          imgData,
          "PNG",
          20,
          yPosition,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error("Failed to capture chart:", error);
        
        // Fallback: Add a placeholder
        doc.setDrawColor("#E5E7EB");
        doc.setFillColor("#F9FAFB");
        doc.roundedRect(20, yPosition, 170, 60, 3, 3, "FD");
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor("#6B7280");
        doc.text("Chart could not be rendered", 105, yPosition + 30, { align: "center" });
        doc.setFontSize(10);
        doc.text("(Modern CSS features not supported in export)", 105, yPosition + 40, { align: "center" });
        
        yPosition += 70;
      } finally {
        // Restore original styles
        if (restoreStyles) {
          restoreStyles();
        }
      }
    }
  };

  const createDetailedAnalysisPage = (doc, resume) => {
    const { skillAnalysis, qualityMetrics } = resume.analysis;
    let yPosition = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#1F2937");
    doc.text("Skills & Quality Breakdown", 20, yPosition);
    yPosition += 15;

    // Skills table with better error handling
    const skillsData = skillAnalysis?.topSkills || skillAnalysis?.skills || [];
    const formattedSkills = Array.isArray(skillsData) 
      ? skillsData.slice(0, 10).map((skill) => {
          if (typeof skill === 'object') {
            return [
              skill.name || skill.skill || 'Unknown',
              skill.level || 'N/A',
              skill.confidence ? `${Math.round(skill.confidence * 100)}%` : 'N/A'
            ];
          }
          return [skill, 'N/A', 'N/A'];
        })
      : [['No skills detected', 'N/A', 'N/A']];

    autoTable(doc, {
      startY: yPosition,
      head: [["Top Skills", "Level", "Confidence"]],
      body: formattedSkills,
      theme: "grid",
      headStyles: { fillColor: "#2563EB" },
      margin: { left: 20, right: 20 },
    });
    yPosition = doc.lastAutoTable.finalY + 15;

    // Quality Metrics Table with safe access
    const metrics = qualityMetrics || {};
    autoTable(doc, {
      startY: yPosition,
      head: [["Quality Metric", "Score", "Description"]],
      body: [
        [
          "Section Completeness",
          `${metrics.sectionCompleteness || 0}%`,
          "Presence of essential resume sections",
        ],
        [
          "Skill Diversity",
          `${metrics.skillDiversity || 0}%`,
          "Variety of skills across different categories",
        ],
        [
          "Content Depth",
          `${metrics.contentDepth || 0}%`,
          "Detail and comprehensiveness of content",
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: "#10B981" },
      margin: { left: 20, right: 20 },
    });
  };

  const createAIInsightsPage = (doc, insights) => {
    let yPosition = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#1F2937");
    doc.text("AI-Powered Insights", 20, yPosition);
    yPosition += 15;

    // Career Recommendations with error handling
    const recommendations = insights?.careerRecommendations || [];
    if (recommendations.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [["Recommended Role", "Match Score", "Reasoning"]],
        body: recommendations.map((rec) => [
          rec.role || 'Unknown Role',
          `${rec.matchScore || 0}%`,
          rec.reasoning || 'No reasoning provided',
        ]),
        theme: "striped",
        headStyles: { fillColor: "#8B5CF6" },
        margin: { left: 20, right: 20 },
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Skill Gap Analysis
    if (insights?.skillGapAnalysis) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Skill Gap Analysis", 20, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Missing Skills: ${(insights.skillGapAnalysis.missingSkills || []).join(", ") || "None identified"}`,
        22,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Emerging Skills: ${(insights.skillGapAnalysis.emergingSkills || []).join(", ") || "None identified"}`,
        22,
        yPosition
      );
      yPosition += 10;
    }

    // Market Insights
    if (insights?.marketInsights) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Market Insights", 20, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Demand Level: ${insights.marketInsights.demandLevel || 'Unknown'}`,
        22,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Salary Range: ${insights.marketInsights.salaryRange || 'Not available'}`,
        22,
        yPosition
      );
    }
  };

  const addFooters = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount} | AI Resume Analyzer`,
        doc.internal.pageSize.getWidth() / 2,
        287,
        { align: "center" }
      );
    }
  };

  // ✅ ENHANCED: Chart export with oklch handling
  const exportCharts = async () => {
    setIsExporting(true);

    try {
      toast.loading("🖼️ Exporting charts...", { id: "chart-export" });

      const chartElements = document.querySelectorAll("[data-export-chart]");

      if (chartElements.length === 0) {
        toast.error("No charts found to export");
        return;
      }

      let exportCount = 0;

      for (let i = 0; i < chartElements.length; i++) {
        const chartElement = chartElements[i];
        const chartId = chartElement.getAttribute("data-export-chart");
        let restoreStyles = null;

        try {
          // Fix oklch colors before capture
          restoreStyles = fixOklchColors(chartElement);
          
          const canvas = await html2canvas(chartElement, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            logging: false,
            removeContainer: true,
            onclone: (clonedDoc) => {
              // Additional cleanup for cloned document
              const clonedElements = clonedDoc.querySelectorAll('*');
              clonedElements.forEach(el => {
                const style = el.style;
                ['filter', 'backdrop-filter', 'mask', 'clip-path'].forEach(prop => {
                  if (style[prop]) {
                    style.removeProperty(prop);
                  }
                });
              });
            }
          });

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${chartId}_${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          exportCount++;
        } catch (chartError) {
          console.error(`Error exporting chart ${chartId}:`, chartError);
        } finally {
          if (restoreStyles) {
            restoreStyles();
          }
        }
      }

      if (exportCount > 0) {
        toast.success(`✅ Exported ${exportCount} chart(s)!`, {
          id: "chart-export",
        });
      } else {
        toast.error("Failed to export charts", { id: "chart-export" });
      }
    } catch (error) {
      console.error("Chart export error:", error);
      toast.error("Chart export failed", { id: "chart-export" });
    } finally {
      setIsExporting(false);
    }
  };

  const shareReport = () => {
    if (!selectedResume) {
      toast.error("Please select a resume to share");
      return;
    }

    const shareText = `Check out my Resume Analysis! Quality Score: ${
      selectedResume.analysis.qualityMetrics?.overallScore ||
      Math.round(selectedResume.analysis.confidence * 100)
    }%, Skills: ${selectedResume.analysis.skillAnalysis?.totalSkills || 0}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Resume Analysis Report",
          text: shareText,
          url: window.location.href,
        })
        .then(() => {
          toast.success("📱 Report shared successfully!");
        });
    } else {
      navigator.clipboard
        .writeText(`${shareText}\n${window.location.href}`)
        .then(() => toast.success("🔗 Report link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy to clipboard"));
    }
  };

  const emailReport = () => {
    if (!selectedResume) {
      toast.error("Please select a resume to share");
      return;
    }

    const { skillAnalysis, qualityMetrics } = selectedResume.analysis;

    const resumeName = selectedResume.name || selectedResume.fileName;
    const subject = encodeURIComponent(
      `Resume Analysis Report - ${resumeName}`
    );
    const body = encodeURIComponent(`Hi,

I've generated a comprehensive resume analysis report:

📁 File: ${resumeName}
📅 Analysis Date: ${new Date(selectedResume.analyzedAt).toLocaleDateString()}
📈 Quality Score: ${
      qualityMetrics?.overallScore ||
      Math.round(selectedResume.analysis.confidence * 100)
    }%

💼 Skills Summary:
• Total Skills: ${skillAnalysis?.totalSkills || 0}
• High Confidence: ${skillAnalysis?.highConfidenceSkills || 0}
• Expert Level: ${skillAnalysis?.expertSkills || 0}

🎯 Top Skills: ${
      skillAnalysis?.topSkills
        ?.slice(0, 5)
        .map((skill) => skill.name || skill)
        .join(", ") || "None detected"
    }

Generated by AI Resume Analyzer
${window.location.origin}`);

    window.open(`mailto:?subject=${subject}&body=${body}`);
    toast.success("📧 Email client opened with report!");
  };

  return (
    <>
      {/* ✅ Hidden container with enhanced styling for better rendering */}
      {isExporting && (
        <div
          id="pdf-export-container"
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: "800px",
            backgroundColor: "white",
            zIndex: -100,
            fontFamily: "Arial, sans-serif", // Use web-safe fonts
          }}
        >
          {selectedResume?.analysis && (
            <>
              <div
                data-export-chart="skill-radar"
                style={{
                  width: "800px",
                  height: "600px",
                  padding: "20px",
                  backgroundColor: "white",
                  color: "#000000", // Force black text
                }}
              >
                <SkillRadarChart
                  skillAnalysis={selectedResume.analysis.skillAnalysis}
                />
              </div>
              <div
                data-export-chart="skill-categories"
                style={{
                  width: "800px",
                  height: "600px",
                  padding: "20px",
                  backgroundColor: "white",
                  color: "#000000",
                }}
              >
                <SkillCategoryChart
                  skillAnalysis={selectedResume.analysis.skillAnalysis}
                />
              </div>
              <div
                data-export-chart="quality-progression"
                style={{
                  width: "800px",
                  height: "600px",
                  padding: "20px",
                  backgroundColor: "white",
                  color: "#000000",
                }}
              >
                <QualityMetricsChart
                  analyzedResumes={analyzedResumes}
                  selectedResumeId={selectedResume.id}
                />
              </div>
            </>
          )}
        </div>
      )}

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Export & Share
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Share your analysis results
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={generatePDFReport}
            disabled={isExporting || !selectedResume}
            className="flex flex-col items-center p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-2xl mb-2">📄</div>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {isExporting ? "Generating..." : "Export PDF Report"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Full detailed report
            </span>
          </button>

          <button
            onClick={exportCharts}
            disabled={isExporting}
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              Export Charts
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PNG images
            </span>
          </button>

          <button
            onClick={shareReport}
            disabled={isExporting || !selectedResume}
            className="flex flex-col items-center p-4 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-2xl mb-2">🔗</div>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              Share Report
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Generate link
            </span>
          </button>

          <button
            onClick={emailReport}
            disabled={isExporting || !selectedResume}
            className="flex flex-col items-center p-4 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-2xl mb-2">📧</div>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              Email Report
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Send via email
            </span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default ExportManager;
