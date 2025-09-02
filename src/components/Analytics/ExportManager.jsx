import React, { useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const ExportManager = ({ analyzedResumes, selectedResume }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Comprehensive PDF export with ALL analytics content
  const exportComprehensiveReport = async () => {
    if (!selectedResume) {
      alert("Please select a resume to export.");
      return;
    }

    console.log("🚀 COMPREHENSIVE PDF EXPORT STARTED!");
    setIsExporting(true);
    setExportProgress(5);

    try {
      const pdf = new jsPDF("portrait", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // 1. CREATE TITLE PAGE
      setExportProgress(10);
      await createTitlePage(pdf, selectedResume, margin, pageWidth, pageHeight);

      // 2. ADD EXECUTIVE SUMMARY PAGE
      setExportProgress(20);
      pdf.addPage();
      await createExecutiveSummary(
        pdf,
        selectedResume,
        margin,
        contentWidth,
        pageWidth,
        pageHeight
      );

      // 3. CAPTURE AND ADD VISUAL CHARTS
      setExportProgress(30);
      await addVisualCharts(pdf, margin, contentWidth);

      // 4. ADD DETAILED SKILL ANALYSIS
      setExportProgress(50);
      pdf.addPage();
      await createDetailedSkillAnalysis(
        pdf,
        selectedResume,
        margin,
        contentWidth,
        pageWidth,
        pageHeight
      );

      // 5. ADD QUALITY METRICS BREAKDOWN
      setExportProgress(65);
      pdf.addPage();
      await createQualityMetricsBreakdown(
        pdf,
        selectedResume,
        margin,
        contentWidth,
        pageWidth,
        pageHeight
      );

      // 6. ADD RECOMMENDATIONS SECTION
      setExportProgress(80);
      pdf.addPage();
      await createRecommendationsSection(
        pdf,
        selectedResume,
        margin,
        contentWidth,
        pageWidth,
        pageHeight
      );

      // 7. ADD COMPARISON DATA (if multiple resumes)
      if (analyzedResumes.length > 1) {
        setExportProgress(90);
        pdf.addPage();
        await createComparisonSection(
          pdf,
          analyzedResumes,
          selectedResume,
          margin,
          contentWidth,
          pageWidth,
          pageHeight
        );
      }

      // 8. SAVE THE COMPREHENSIVE PDF
      setExportProgress(95);
      const filename = `${selectedResume.fileName.replace(
        /\.[^/.]+$/,
        ""
      )}_Complete_Analytics_Report.pdf`;
      pdf.save(filename);

      setExportProgress(100);
      console.log("✅ Comprehensive PDF saved successfully!");

      setTimeout(() => {
        alert(
          "✅ Complete analytics report exported successfully! Check your downloads folder."
        );
      }, 500);
    } catch (error) {
      console.error("❌ Comprehensive PDF Export Error:", error);
      alert(`❌ Failed to export comprehensive PDF: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // CREATE TITLE PAGE
  const createTitlePage = async (
    pdf,
    resume,
    margin,
    pageWidth,
    pageHeight
  ) => {
    // Header
    pdf.setFontSize(28);
    pdf.setTextColor(59, 130, 246); // Blue
    pdf.text("RESUME ANALYTICS REPORT", margin, 40);

    // Subtitle
    pdf.setFontSize(16);
    pdf.setTextColor(75, 85, 99); // Gray
    pdf.text("Comprehensive Skill & Quality Analysis", margin, 55);

    // Resume Details Box
    pdf.setFillColor(248, 250, 252); // Light gray background
    pdf.roundedRect(margin, 70, pageWidth - margin * 2, 40, 3, 3, "F");

    pdf.setFontSize(14);
    pdf.setTextColor(17, 24, 39); // Dark
    pdf.text("Resume File:", margin + 10, 85);
    pdf.setFont("helvetica", "bold");
    pdf.text(resume.fileName, margin + 10, 95);

    pdf.setFont("helvetica", "normal");
    pdf.text("Analysis Date:", margin + 10, 105);
    pdf.text(
      new Date(resume.analyzedAt).toLocaleDateString(),
      margin + 80,
      105
    );

    // Key Metrics Overview
    const analysis = resume.analysis;
    const qualityScore =
      analysis.qualityMetrics?.overallScore ||
      Math.round(analysis.confidence * 100);

    pdf.setFontSize(18);
    pdf.setTextColor(59, 130, 246);
    pdf.text("KEY METRICS AT A GLANCE", margin, 140);

    // Metrics boxes
    const metrics = [
      {
        label: "Overall Quality Score",
        value: `${qualityScore}%`,
        color:
          qualityScore >= 80
            ? [34, 197, 94]
            : qualityScore >= 60
            ? [251, 191, 36]
            : [239, 68, 68],
      },
      {
        label: "Total Skills Detected",
        value: analysis.skillAnalysis.totalSkills,
        color: [59, 130, 246],
      },
      {
        label: "High Confidence Skills",
        value:
          analysis.skillAnalysis.highConfidenceSkills ||
          analysis.skillAnalysis.totalSkills,
        color: [168, 85, 247],
      },
      {
        label: "Expert Level Skills",
        value: analysis.skillAnalysis.expertSkills || 0,
        color: [245, 158, 11],
      },
    ];

    let yPos = 155;
    const contentWidth = pageWidth - margin * 2;
    metrics.forEach((metric, index) => {
      const xPos = margin + (index % 2) * (contentWidth / 2);
      if (index === 2) yPos += 25;

      pdf.setFillColor(...metric.color);
      pdf.roundedRect(xPos, yPos, contentWidth / 2 - 10, 20, 2, 2, "F");

      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text(metric.label, xPos + 5, yPos + 8);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(metric.value), xPos + 5, yPos + 16);
      pdf.setFont("helvetica", "normal");
    });

    // Generated timestamp
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(
      `Report generated on ${new Date().toLocaleString()}`,
      margin,
      pageHeight - 20
    );
    pdf.text(
      "Generated by Career Journal Analytics Platform",
      margin,
      pageHeight - 10
    );
  };

  // CREATE EXECUTIVE SUMMARY
  const createExecutiveSummary = async (
    pdf,
    resume,
    margin,
    contentWidth,
    pageWidth,
    pageHeight
  ) => {
    const analysis = resume.analysis;

    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text("EXECUTIVE SUMMARY", margin, 30);

    let yPos = 50;
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);

    // Overall Assessment
    pdf.setFont("helvetica", "bold");
    pdf.text("Overall Assessment:", margin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 7;

    const qualityScore =
      analysis.qualityMetrics?.overallScore ||
      Math.round(analysis.confidence * 100);
    const assessmentText =
      qualityScore >= 80
        ? "Excellent resume with strong skill presentation and comprehensive content."
        : qualityScore >= 60
        ? "Good resume with room for improvement in skill diversity and content depth."
        : "Resume requires significant improvements in multiple areas to be competitive.";

    const wrappedAssessment = pdf.splitTextToSize(assessmentText, contentWidth);
    pdf.text(wrappedAssessment, margin, yPos);
    yPos += wrappedAssessment.length * 7 + 10;

    // Key Strengths
    pdf.setFont("helvetica", "bold");
    pdf.text("Key Strengths:", margin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 7;

    const strengths = [
      `${analysis.skillAnalysis.totalSkills} skills identified across multiple categories`,
      `${
        analysis.skillAnalysis.highConfidenceSkills ||
        analysis.skillAnalysis.totalSkills
      } high-confidence skill matches`,
      analysis.qualityMetrics?.sectionCompleteness >= 80
        ? "Complete resume structure with all essential sections"
        : null,
      analysis.skillAnalysis.expertSkills > 0
        ? `${analysis.skillAnalysis.expertSkills} expert-level skills demonstrated`
        : null,
    ].filter(Boolean);

    strengths.forEach((strength) => {
      pdf.text(`• ${strength}`, margin + 5, yPos);
      yPos += 7;
    });
    yPos += 10;

    // Areas for Improvement
    pdf.setFont("helvetica", "bold");
    pdf.text("Areas for Improvement:", margin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 7;

    const improvements = [
      analysis.qualityMetrics?.sectionCompleteness < 80
        ? "Add missing resume sections for completeness"
        : null,
      analysis.qualityMetrics?.skillDiversity < 70
        ? "Expand skill diversity across different categories"
        : null,
      analysis.qualityMetrics?.contentDepth < 70
        ? "Enhance content depth with more detailed descriptions"
        : null,
      qualityScore < 70
        ? "Overall resume quality needs enhancement for better ATS compatibility"
        : null,
    ].filter(Boolean);

    if (improvements.length === 0) {
      pdf.text(
        "• Resume shows excellent quality across all measured dimensions",
        margin + 5,
        yPos
      );
    } else {
      improvements.forEach((improvement) => {
        pdf.text(`• ${improvement}`, margin + 5, yPos);
        yPos += 7;
      });
    }

    // Top Skills Summary
    yPos += 15;
    pdf.setFont("helvetica", "bold");
    pdf.text("Top Skills Identified:", margin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 7;

    if (analysis.skillAnalysis.topSkills) {
      const topSkillsText = analysis.skillAnalysis.topSkills
        .slice(0, 8)
        .map((skill) => skill.name)
        .join(", ");
      const wrappedSkills = pdf.splitTextToSize(topSkillsText, contentWidth);
      pdf.text(wrappedSkills, margin, yPos);
    }
  };

  // ADD VISUAL CHARTS
  const addVisualCharts = async (pdf, margin, contentWidth) => {
    const chartElements = document.querySelectorAll("[data-export-chart]");

    if (chartElements.length === 0) {
      console.log("No charts found for export");
      return;
    }

    let chartsAdded = 0;
    let currentPage = false;

    for (const chart of chartElements) {
      try {
        // Add new page for charts (except first)
        if (chartsAdded > 0 && chartsAdded % 2 === 0) {
          pdf.addPage();
          currentPage = false;
        }

        if (!currentPage) {
          pdf.setFontSize(20);
          pdf.setTextColor(59, 130, 246);
          pdf.text("VISUAL ANALYTICS CHARTS", margin, 30);
          currentPage = true;
        }

        const canvas = await html2canvas(chart, {
          scale: 1.5,
          backgroundColor: "white",
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = contentWidth;
        const imgHeight = Math.min(
          (canvas.height * imgWidth) / canvas.width,
          120
        );

        const yPos = 50 + (chartsAdded % 2) * 130;
        pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);

        // Add chart title
        const chartTitle =
          chart.getAttribute("data-export-chart") || `Chart ${chartsAdded + 1}`;
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(chartTitle.replace(/-/g, " ").toUpperCase(), margin, yPos - 5);

        chartsAdded++;
      } catch (error) {
        console.warn("Failed to capture chart:", error);
      }
    }

    // If no charts were added, add a placeholder page
    if (chartsAdded === 0) {
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text("VISUAL ANALYTICS CHARTS", margin, 30);

      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(
        "Charts are being processed and will be available in the next version.",
        margin,
        60
      );
    }
  };

  // CREATE DETAILED SKILL ANALYSIS
  const createDetailedSkillAnalysis = async (
    pdf,
    resume,
    margin,
    contentWidth,
    pageWidth,
    pageHeight
  ) => {
    const analysis = resume.analysis.skillAnalysis;

    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text("DETAILED SKILL ANALYSIS", margin, 30);

    let yPos = 50;
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);

    // Skills by Category
    if (analysis.skillsByCategory) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Skills by Category:", margin, yPos);
      pdf.setFont("helvetica", "normal");
      yPos += 10;

      Object.entries(analysis.skillsByCategory).forEach(([category, data]) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 130, 246);
        pdf.text(`${category}:`, margin + 5, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81);
        yPos += 7;

        if (data.skills && Object.keys(data.skills).length > 0) {
          const skills = Object.entries(data.skills).slice(0, 10);
          skills.forEach(([skill, confidence]) => {
            const confidenceText =
              typeof confidence === "number"
                ? ` (${Math.round(confidence * 100)}% confidence)`
                : "";
            pdf.text(`   • ${skill}${confidenceText}`, margin + 10, yPos);
            yPos += 6;
          });
        } else {
          pdf.text(
            "   • No specific skills detected in this category",
            margin + 10,
            yPos
          );
          yPos += 6;
        }
        yPos += 5;
      });
    }

    // Top Skills Detailed
    if (analysis.topSkills && analysis.topSkills.length > 0) {
      if (yPos > 200) {
        pdf.addPage();
        yPos = 30;
      }

      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("Top Skills Ranking:", margin, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 65, 81);
      yPos += 10;

      analysis.topSkills.slice(0, 15).forEach((skill, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 30;
        }

        const level = skill.level || "Detected";
        const confidence = skill.confidence
          ? ` - ${Math.round(skill.confidence * 100)}% confidence`
          : "";

        pdf.text(
          `${index + 1}. ${skill.name} (${level}${confidence})`,
          margin + 5,
          yPos
        );
        yPos += 7;
      });
    }
  };

  // CREATE QUALITY METRICS BREAKDOWN
  const createQualityMetricsBreakdown = async (
    pdf,
    resume,
    margin,
    contentWidth,
    pageWidth,
    pageHeight
  ) => {
    const metrics = resume.analysis.qualityMetrics;

    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text("QUALITY METRICS BREAKDOWN", margin, 30);

    let yPos = 50;
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);

    if (metrics) {
      // Quality Scores Table
      const qualityItems = [
        {
          name: "Overall Quality Score",
          value: metrics.overallScore,
          description: "Comprehensive quality assessment across all dimensions",
        },
        {
          name: "Section Completeness",
          value: metrics.sectionCompleteness,
          description: "Presence of essential resume sections",
        },
        {
          name: "Skill Diversity",
          value: metrics.skillDiversity,
          description: "Variety of skills across different categories",
        },
        {
          name: "Content Depth",
          value: metrics.contentDepth,
          description: "Detailed and comprehensive content quality",
        },
        {
          name: "Contact Completeness",
          value: metrics.contactCompleteness,
          description: "Complete contact information provided",
        },
      ].filter((item) => item.value !== undefined);

      qualityItems.forEach((item) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }

        // Score box with color coding
        const score = item.value;
        const color =
          score >= 80
            ? [34, 197, 94]
            : score >= 60
            ? [251, 191, 36]
            : [239, 68, 68];

        pdf.setFillColor(...color);
        pdf.roundedRect(margin, yPos - 5, 20, 12, 2, 2, "F");

        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${score}%`, margin + 2, yPos + 2);

        // Metric details
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.name, margin + 30, yPos + 2);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        const wrappedDesc = pdf.splitTextToSize(
          item.description,
          contentWidth - 40
        );
        pdf.text(wrappedDesc, margin + 30, yPos + 8);

        yPos += 20 + (wrappedDesc.length - 1) * 4;
      });

      // Quality Improvement Suggestions
      yPos += 20;
      if (yPos > 200) {
        pdf.addPage();
        yPos = 30;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text("Quality Improvement Recommendations:", margin, yPos);
      yPos += 15;

      const suggestions = [];
      if (metrics.sectionCompleteness < 80)
        suggestions.push(
          "Add missing resume sections such as Summary, Projects, or Certifications"
        );
      if (metrics.skillDiversity < 70)
        suggestions.push(
          "Include more diverse skills across technical, soft, and domain-specific categories"
        );
      if (metrics.contentDepth < 70)
        suggestions.push(
          "Expand descriptions with quantified achievements and specific examples"
        );
      if (metrics.contactCompleteness < 90)
        suggestions.push(
          "Complete contact information including LinkedIn profile and portfolio links"
        );

      if (suggestions.length === 0) {
        suggestions.push(
          "Excellent quality across all dimensions - maintain current standards"
        );
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);

      suggestions.forEach((suggestion) => {
        const wrapped = pdf.splitTextToSize(`• ${suggestion}`, contentWidth);
        wrapped.forEach((line) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 30;
          }
          pdf.text(line, margin, yPos);
          yPos += 7;
        });
        yPos += 3;
      });
    } else {
      pdf.text(
        "Quality metrics are being processed and will be available in future analyses.",
        margin,
        yPos
      );
    }
  };

  // CREATE RECOMMENDATIONS SECTION
  const createRecommendationsSection = async (
    pdf,
    resume,
    margin,
    contentWidth,
    pageWidth,
    pageHeight
  ) => {
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text("ACTIONABLE RECOMMENDATIONS", margin, 30);

    let yPos = 50;
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);

    const recommendations = [
      {
        priority: "HIGH",
        title: "Optimize for ATS Systems",
        description:
          "Ensure your resume passes Applicant Tracking Systems by using standard section headers, avoiding complex formatting, and including relevant keywords from job descriptions.",
        color: [239, 68, 68],
      },
      {
        priority: "HIGH",
        title: "Quantify Your Achievements",
        description:
          'Add specific numbers, percentages, and metrics to your accomplishments. For example: "Increased sales by 25%" instead of "Improved sales performance."',
        color: [239, 68, 68],
      },
      {
        priority: "MEDIUM",
        title: "Enhance Technical Skills Section",
        description:
          "Organize technical skills by proficiency level (Expert, Proficient, Familiar) and include relevant certifications or years of experience.",
        color: [251, 191, 36],
      },
      {
        priority: "MEDIUM",
        title: "Add Professional Summary",
        description:
          "Include a 2-3 sentence professional summary highlighting your key strengths, experience level, and career objectives.",
        color: [251, 191, 36],
      },
      {
        priority: "LOW",
        title: "Include Relevant Projects",
        description:
          "Add a projects section showcasing relevant work, personal projects, or contributions that demonstrate your skills in action.",
        color: [34, 197, 94],
      },
    ];

    recommendations.forEach((rec, index) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 30;
      }

      // Priority badge
      pdf.setFillColor(...rec.color);
      pdf.roundedRect(margin, yPos - 3, 25, 10, 2, 2, "F");
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.text(rec.priority, margin + 2, yPos + 3);

      // Recommendation content
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${rec.title}`, margin + 35, yPos + 2);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      const wrapped = pdf.splitTextToSize(rec.description, contentWidth - 40);
      pdf.text(wrapped, margin + 35, yPos + 8);

      yPos += 20 + (wrapped.length - 1) * 4;
    });
  };

  // CREATE COMPARISON SECTION
  const createComparisonSection = async (
    pdf,
    allResumes,
    currentResume,
    margin,
    contentWidth,
    pageWidth,
    pageHeight
  ) => {
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text("RESUME COMPARISON ANALYSIS", margin, 30);

    let yPos = 50;
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);

    // Sort resumes by analysis date
    const sortedResumes = [...allResumes].sort(
      (a, b) => new Date(a.analyzedAt) - new Date(b.analyzedAt)
    );

    pdf.setFont("helvetica", "bold");
    pdf.text("Resume Evolution Timeline:", margin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 15;

    sortedResumes.forEach((resume, index) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 30;
      }

      const isCurrentResume = resume.id === currentResume.id;
      const analysis = resume.analysis;
      const qualityScore =
        analysis.qualityMetrics?.overallScore ||
        Math.round(analysis.confidence * 100);

      // Timeline marker
      pdf.setFillColor(isCurrentResume ? [59, 130, 246] : [156, 163, 175]);
      pdf.circle(margin + 5, yPos - 2, 3, "F");

      // Resume details
      pdf.setFont("helvetica", isCurrentResume ? "bold" : "normal");
      pdf.setTextColor(isCurrentResume ? [59, 130, 246] : [55, 65, 81]);
      pdf.text(
        `${resume.fileName}${isCurrentResume ? " (Current)" : ""}`,
        margin + 15,
        yPos
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(
        `Analyzed: ${new Date(resume.analyzedAt).toLocaleDateString()}`,
        margin + 15,
        yPos + 6
      );
      pdf.text(
        `Quality Score: ${qualityScore}% | Skills: ${analysis.skillAnalysis.totalSkills}`,
        margin + 15,
        yPos + 12
      );

      // Improvement indicator
      if (index > 0) {
        const prevResume = sortedResumes[index - 1];
        const prevScore =
          prevResume.analysis.qualityMetrics?.overallScore ||
          Math.round(prevResume.analysis.confidence * 100);
        const improvement = qualityScore - prevScore;

        if (improvement !== 0) {
          pdf.setFontSize(9);
          const color = improvement > 0 ? [34, 197, 94] : [239, 68, 68];
          pdf.setTextColor(...color);
          pdf.text(
            `${improvement > 0 ? "↑" : "↓"} ${Math.abs(
              improvement
            )}% quality change`,
            margin + 15,
            yPos + 18
          );
        }
      }

      yPos += 25;
      pdf.setFontSize(12);
    });
  };

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          📤 Comprehensive Export & Share
        </h3>
        {isExporting && (
          <div className="flex items-center space-x-2">
            <div className="w-40 bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {exportProgress}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* COMPREHENSIVE PDF Export Button */}
        <button
          onClick={exportComprehensiveReport}
          disabled={isExporting || !selectedResume}
          className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 18h12V6l-4-4H4v16zM9 1H3a1 1 0 00-1 1v16a1 1 0 001 1h14a1 1 0 001-1V5.414a1 1 0 00-.293-.707l-4-4A1 1 0 0013 0H9z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900">Complete Report</span>
          <span className="text-xs text-gray-500 mt-1 text-center">
            All analytics & insights
          </span>
        </button>

        {/* Other export options remain the same... */}
        <button
          onClick={() => alert("Chart-only export coming soon!")}
          disabled={isExporting}
          className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <span className="font-medium text-gray-900">Charts Only</span>
          <span className="text-xs text-gray-500 mt-1">Visual data</span>
        </button>

        <button
          onClick={() => alert("Share feature coming soon!")}
          disabled={isExporting}
          className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">🔗</span>
          </div>
          <span className="font-medium text-gray-900">Share Report</span>
          <span className="text-xs text-gray-500 mt-1">Generate link</span>
        </button>

        <button
          onClick={() => {
            if (!selectedResume) {
              alert("Please select a resume first.");
              return;
            }
            const subject = encodeURIComponent(
              `Comprehensive Resume Analysis Report - ${selectedResume.fileName}`
            );
            const body = encodeURIComponent(
              `Hi,\n\nI've generated a comprehensive resume analysis report using the Career Journal Analytics Platform.\n\n📊 Report Highlights:\n• Resume: ${
                selectedResume.fileName
              }\n• Total Skills Detected: ${
                selectedResume.analysis.skillAnalysis.totalSkills
              }\n• Quality Score: ${
                selectedResume.analysis.qualityMetrics?.overallScore ||
                Math.round(selectedResume.analysis.confidence * 100)
              }%\n• Analysis Date: ${new Date(
                selectedResume.analyzedAt
              ).toLocaleDateString()}\n\nThis detailed report includes:\n✅ Executive Summary\n✅ Visual Analytics Charts\n✅ Comprehensive Skill Analysis\n✅ Quality Metrics Breakdown\n✅ Actionable Recommendations\n✅ Resume Evolution Comparison\n\nBest regards`
            );
            window.open(`mailto:?subject=${subject}&body=${body}`);
          }}
          disabled={isExporting || !selectedResume}
          className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">📧</span>
          </div>
          <span className="font-medium text-gray-900">Email Report</span>
          <span className="text-xs text-gray-500 mt-1">Share via email</span>
        </button>
      </div>

      {isExporting && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-0.5"></div>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                🚀 Generating comprehensive analytics report...
              </p>
              <p className="text-xs text-blue-600">
                Including executive summary, visual charts, detailed analysis,
                quality metrics, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExportManager;
