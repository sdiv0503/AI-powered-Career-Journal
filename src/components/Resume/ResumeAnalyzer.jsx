import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import { useResumeUpload } from '../../hooks/useResumeUpload';
import { enhancedPdfParser } from '../../utils/pdfParser';
import AnalyticsDashboard from '../Analytics/AnalyticsDashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ResumeAnalyzer = () => {
  const [analyzedResumes, setAnalyzedResumes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false); // NEW: Analytics toggle
  
  const { uploadResumes, uploading, uploadProgress, uploadedResumes } = useResumeUpload();

  const handleFileUpload = async (filesWithMetadata) => {
    try {
      console.log('📤 Starting enhanced file upload process...');
      
      // First, upload files to Supabase
      const uploadResults = await uploadResumes(filesWithMetadata);
      
      // Then, analyze the uploaded files with enhanced parser
      if (uploadResults.length > 0) {
        await analyzeUploadedFilesEnhanced(uploadResults);
      }
    } catch (error) {
      console.error('❌ Enhanced Upload/Analysis error:', error);
      toast.error('Failed to process files');
    }
  };

  const analyzeUploadedFilesEnhanced = async (uploadResults) => {
    setIsAnalyzing(true);
    const results = [];

    try {
      for (const uploadedFile of uploadResults) {
        toast.loading(`🧠 AI analyzing ${uploadedFile.fileName}...`, { id: uploadedFile.id });
        
        try {
          // Parse with enhanced NLP parser
          const analysisResult = await enhancedPdfParser.parseResume(uploadedFile.file);
          
          results.push({
            ...uploadedFile,
            analysis: analysisResult,
            analyzedAt: new Date()
          });

          toast.success(`✅ AI analysis complete: ${uploadedFile.fileName}`, { id: uploadedFile.id });
          
        } catch (parseError) {
          console.error(`Parse error for ${uploadedFile.fileName}:`, parseError);
          toast.error(`Failed to analyze ${uploadedFile.fileName}`, { id: uploadedFile.id });
          
          results.push({
            ...uploadedFile,
            analysis: null,
            error: parseError.message,
            analyzedAt: new Date()
          });
        }
      }

      setAnalyzedResumes(prev => [...prev, ...results]);
      
      const successCount = results.filter(r => r.analysis).length;
      if (successCount > 0) {
        toast.success(`🎉 Enhanced analysis complete! Processed ${successCount} resume(s) with AI`);
      }

    } catch (error) {
      console.error('Bulk analysis error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveResume = (resumeId) => {
    setAnalyzedResumes(prev => prev.filter(resume => resume.id !== resumeId));
    toast.success('Resume removed');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 AI Resume Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered resume analysis with context-aware skill extraction, 
            quality metrics, and personalized improvement recommendations.
          </p>
        </div>

        {/* Upload Component */}
        <div className="mb-12">
          <ResumeUploader 
            onFileUpload={handleFileUpload}
            maxFiles={5}
          />
        </div>

        {/* Analysis Status */}
        {(uploading || isAnalyzing) && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">
                {uploading ? '📤 Uploading to secure cloud storage...' : '🧠 AI analyzing with NLP...'}
              </h3>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <div className="text-blue-700 text-sm">
              {uploading 
                ? 'Securely uploading your files with end-to-end encryption...'
                : 'Extracting skills, analyzing context, calculating quality metrics, and generating personalized recommendations...'
              }
            </div>
          </div>
        )}

        {/* Results Display */}
        {analyzedResumes.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                📊 AI Analysis Results ({analyzedResumes.length})
              </h2>
              <div className="text-sm text-gray-500">
                Powered by Natural Language Processing
              </div>
            </div>
            
            <div className="space-y-6">
              {analyzedResumes.map((resume) => (
                <EnhancedResumeAnalysisCard 
                  key={resume.id} 
                  resume={resume}
                  onRemove={handleRemoveResume}
                />
              ))}
            </div>

            {/* NEW: Analytics Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center space-x-2 shadow-lg"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>{showAnalytics ? 'Hide Advanced Analytics' : 'View Advanced Analytics'}</span>
              </button>
            </div>
          </div>
        )}

        {/* NEW: Analytics Dashboard */}
        {showAnalytics && analyzedResumes.length > 0 && (
          <div className="mt-12">
            <AnalyticsDashboard analyzedResumes={analyzedResumes} />
          </div>
        )}

        {/* Empty State */}
        {!uploading && !isAnalyzing && analyzedResumes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready for AI-Powered Analysis
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Upload your resume to get detailed insights with our advanced NLP engine.
              We'll analyze skills, quality metrics, and provide personalized recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Analysis Results Card Component
const EnhancedResumeAnalysisCard = ({ resume, onRemove }) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    skills: false,
    quality: false,
    recommendations: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { analysis, fileName, analyzedAt, error } = resume;

  if (error || !analysis) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-600">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">{fileName}</h3>
              <p className="text-sm text-red-500">{error || 'Analysis failed'}</p>
            </div>
          </div>
          <button
            onClick={() => onRemove(resume.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <span className="sr-only">Remove</span>
            &times;
          </button>
        </div>
      </div>
    );
  }

  const { skillAnalysis, qualityMetrics } = analysis;
  const overallScore = qualityMetrics?.overallScore || Math.round(analysis.confidence * 100);

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{fileName}</h3>
            <p className="text-sm text-gray-500">
              Analyzed {new Date(analyzedAt).toLocaleDateString()} • 
              {analysis.pageCount} pages • 
              {analysis.sectionCount || 'Multiple'} sections
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </div>
              <p className="text-xs text-gray-500 mt-1">{getScoreLabel(overallScore)}</p>
            </div>
            <button
              onClick={() => onRemove(resume.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="p-6 bg-gray-50 border-b border-gray-100">
        <button
          onClick={() => toggleSection('overview')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-semibold text-gray-900">📊 Quick Overview</h4>
          <span className="text-gray-400">
            {expandedSections.overview ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections.overview && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{skillAnalysis.totalSkills}</div>
              <div className="text-xs text-gray-600">Total Skills</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{skillAnalysis.highConfidenceSkills || skillAnalysis.totalSkills}</div>
              <div className="text-xs text-gray-600">High Confidence</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{skillAnalysis.expertSkills || 0}</div>
              <div className="text-xs text-gray-600">Expert Level</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.round(analysis.confidence * 100)}%</div>
              <div className="text-xs text-gray-600">Parse Confidence</div>
            </div>
          </div>
        )}
      </div>

      {/* Skills Analysis */}
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={() => toggleSection('skills')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-semibold text-gray-900">💼 Skills Analysis</h4>
          <span className="text-gray-400">
            {expandedSections.skills ? '▼' : '▶'}
          </span>
        </button>

        {expandedSections.skills && (
          <div className="mt-4 space-y-4">
            {/* Top Skills */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">🏆 Top Skills</h5>
              <div className="flex flex-wrap gap-2">
                {skillAnalysis.topSkills?.slice(0, 8).map((skill, index) => (
                  <span
                    key={skill.name}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      index < 3
                        ? 'bg-blue-100 text-blue-800'
                        : index < 6
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {skill.name} ({skill.level || 'Detected'})
                  </span>
                )) || (
                  <span className="text-gray-500">No skills detected with high confidence</span>
                )}
              </div>
            </div>

            {/* Skills by Category */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">📂 By Category</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillAnalysis.skillsByCategory?.map(category => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700 capitalize">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.count} skills
                      </span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(category.skills || {}).slice(0, 5).map(([skillName, skillData]) => (
                        <div key={skillName} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{skillName}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">{skillData.level || 'Detected'}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              (skillData.confidence || 0.8) > 0.8 ? 'bg-green-400' :
                              (skillData.confidence || 0.6) > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )) || (
                  <div className="text-gray-500 col-span-2">No categorized skills detected</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quality Metrics */}
      {qualityMetrics && (
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={() => toggleSection('quality')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-lg font-semibold text-gray-900">📈 Resume Quality</h4>
            <span className="text-gray-400">
              {expandedSections.quality ? '▼' : '▶'}
            </span>
          </button>

          {expandedSections.quality && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QualityMetric
                  label="Section Completeness"
                  score={qualityMetrics.sectionCompleteness}
                  description="Essential sections present"
                />
                <QualityMetric
                  label="Skill Diversity"
                  score={qualityMetrics.skillDiversity}
                  description="Range of technical skills"
                />
                <QualityMetric
                  label="Content Depth"
                  score={qualityMetrics.contentDepth}
                  description="Detail level of descriptions"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="p-6">
        <button
          onClick={() => toggleSection('recommendations')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-semibold text-gray-900">💡 Recommendations</h4>
          <span className="text-gray-400">
            {expandedSections.recommendations ? '▼' : '▶'}
          </span>
        </button>

        {expandedSections.recommendations && (
          <div className="mt-4 space-y-3">
            {/* Smart Skill Recommendations */}
            {skillAnalysis.recommendations?.map((rec, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-1">{rec.title}</h5>
                <p className="text-blue-700 text-sm mb-2">{rec.description}</p>
                <div className="flex flex-wrap gap-1">
                  {rec.skills?.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )) || (
              <div className="text-gray-500">No specific recommendations available</div>
            )}

            {/* Quality Recommendations */}
            {qualityMetrics?.recommendations?.map((rec, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">{rec}</p>
              </div>
            ))}

            {/* Contact Information */}
            {analysis.contact && Object.keys(analysis.contact).length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">📞 Contact Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {analysis.contact.email && (
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-600">{analysis.contact.email}</span>
                    </div>
                  )}
                  {analysis.contact.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-600">{analysis.contact.phone}</span>
                    </div>
                  )}
                  {analysis.contact.linkedin && (
                    <div>
                      <span className="font-medium text-gray-700">LinkedIn:</span>
                      <span className="ml-2 text-blue-600">{analysis.contact.linkedin}</span>
                    </div>
                  )}
                  {analysis.contact.github && (
                    <div>
                      <span className="font-medium text-gray-700">GitHub:</span>
                      <span className="ml-2 text-blue-600">{analysis.contact.github}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Quality Metric Component
const QualityMetric = ({ label, score, description }) => {
  const getColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900">{score}%</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
};

export default ResumeAnalyzer;
