import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Check, ArrowLeft, ChartBarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../Header';
import { enhancedPdfParser } from '../../utils/pdfParser';
import AnalyticsDashboard from '../Analytics/AnalyticsDashboard';

const ResumeAnalyzer = () => {
  // Combined state management
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzedResumes, setAnalyzedResumes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  // File validation
  const validateFile = (file) => {
    const validTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    if (!validTypes.includes(file.type)) {
      throw new Error(`${file.name}: Only PDF files are allowed`);
    }
    if (file.size > maxSize) {
      throw new Error(`${file.name}: File size must be less than 10MB`);
    }
    return true;
  };

  // Combined upload and analysis handler
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    console.log('📁 Files dropped:', { accepted: acceptedFiles.length, rejected: rejectedFiles.length });
    
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        toast.error(`${file.name}: ${error.message}`);
      });
    });

    // Process accepted files
    const validFiles = [];
    for (const file of acceptedFiles) {
      try {
        validateFile(file);
        validFiles.push(file);
        console.log('✅ Valid file:', file.name);
      } catch (error) {
        toast.error(error.message);
      }
    }

    if (validFiles.length === 0) return;

    setIsProcessing(true);

    try {
      // Create file metadata
      const filesWithMetadata = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploaded',
        progress: 100
      }));

      setUploadedFiles(prev => [...prev, ...filesWithMetadata]);
      
      // Immediately start analysis
      await analyzeUploadedFiles(filesWithMetadata);
      
      toast.success(`Successfully processed ${validFiles.length} file(s)!`);
      
    } catch (error) {
      toast.error('Failed to process uploaded files');
      console.error('❌ Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Analysis logic
  const analyzeUploadedFiles = async (filesWithMetadata) => {
    setIsAnalyzing(true);
    const results = [];

    try {
      for (const fileData of filesWithMetadata) {
        toast.loading(`🧠 AI analyzing ${fileData.name}...`, { id: fileData.id });
        
        try {
          const analysisResult = await enhancedPdfParser.parseResume(fileData.file);
          
          results.push({
            ...fileData,
            analysis: analysisResult,
            analyzedAt: new Date()
          });

          toast.success(`✅ Analysis complete: ${fileData.name}`, { id: fileData.id });
          
        } catch (parseError) {
          console.error(`Parse error for ${fileData.name}:`, parseError);
          toast.error(`Failed to analyze ${fileData.name}`, { id: fileData.id });
          
          results.push({
            ...fileData,
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

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: isProcessing
  });

  // Dynamic styling for dropzone
  const getDropzoneClassName = () => {
    let baseClasses = "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer";
    
    if (isDragAccept) return `${baseClasses} border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300`;
    if (isDragReject) return `${baseClasses} border-rose-300 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300`;
    if (isDragActive) return `${baseClasses} border-blue-300 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300`;
    return `${baseClasses} border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50`;
  };

  // File management
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setAnalyzedResumes(prev => prev.filter(resume => resume.id !== fileId));
    toast.success('File removed');
  };

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleSection = (resumeId, section) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${resumeId}-${section}`]: !prev[`${resumeId}-${section}`]
    }));
  };

  return (
    <>
      {/* Header */}
      <Header />
      
      {/* Main Content with Dark Mode Support */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Resume Analyzer</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Upload your PDF resume for comprehensive AI-powered analysis including skill detection, 
              ATS compatibility, and personalized recommendations.
            </p>
          </div>

          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8">
            <div {...getRootProps()} className={getDropzoneClassName()}>
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center space-y-6">
                {/* Dynamic Icon */}
                <div className="relative">
                  {isDragActive ? (
                    <div className="animate-bounce">
                      <Upload className="h-16 w-16 text-blue-500" />
                    </div>
                  ) : (
                    <FileText className="h-16 w-16 text-gray-300 dark:text-gray-500" />
                  )}
                  {(isProcessing || isAnalyzing) && (
                    <div className="absolute -top-2 -right-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent bg-white dark:bg-gray-800"></div>
                    </div>
                  )}
                </div>

                {/* Dynamic Text */}
                <div className="text-center space-y-2">
                  {isDragReject ? (
                    <div className="text-rose-600 dark:text-rose-400">
                      <p className="text-lg font-semibold">Invalid file type</p>
                      <p className="text-sm text-rose-500 dark:text-rose-300">Please upload PDF files only</p>
                    </div>
                  ) : isDragActive ? (
                    <div className="text-blue-600 dark:text-blue-400">
                      <p className="text-lg font-semibold">Release to upload</p>
                      <p className="text-sm text-blue-500 dark:text-blue-300">Drop your files here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {isProcessing ? 'Processing...' : isAnalyzing ? 'Analyzing...' : 'Drop your resume here'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        or <button type="button" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">browse files</button>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        PDF • Max 5 files • 10MB each
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Status */}
          {(isProcessing || isAnalyzing) && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {isProcessing ? '📤 Processing files...' : '🧠 AI analyzing with NLP...'}
                </h3>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <div className="text-blue-700 dark:text-blue-300 text-sm">
                {isProcessing 
                  ? 'Validating and processing your uploaded files...'
                  : 'Extracting skills, analyzing context, calculating quality metrics, and generating personalized recommendations...'
                }
              </div>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Uploaded Files
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-3">
                {uploadedFiles.map((fileData) => (
                  <div 
                    key={fileData.id} 
                    className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{fileData.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(fileData.size)} • {fileData.uploadedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                        <Check className="h-3 w-3" />
                        <span className="text-xs font-medium">Ready</span>
                      </div>
                      
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        title="Remove file"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analyzedResumes.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  📊 AI Analysis Results ({analyzedResumes.length})
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by Natural Language Processing
                </div>
              </div>
              
              <div className="space-y-6">
                {analyzedResumes.map((resume) => (
                  <EnhancedResumeAnalysisCard 
                    key={resume.id} 
                    resume={resume}
                    onRemove={removeFile}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  />
                ))}
              </div>

              {/* Analytics Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center space-x-2 shadow-lg"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>{showAnalytics ? 'Hide Advanced Analytics' : 'View Advanced Analytics'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          {showAnalytics && analyzedResumes.length > 0 && (
            <div className="mt-12">
              <AnalyticsDashboard analyzedResumes={analyzedResumes} />
            </div>
          )}

          {/* Empty State */}
          {!isProcessing && !isAnalyzing && analyzedResumes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ready for AI-Powered Analysis
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Upload your resume to get detailed insights with our advanced NLP engine.
                We'll analyze skills, quality metrics, and provide personalized recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Enhanced Analysis Results Card Component
const EnhancedResumeAnalysisCard = ({ resume, onRemove, expandedSections, toggleSection }) => {
  const { analysis, fileName, analyzedAt, error, id } = resume;

  if (error || !analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">{fileName}</h3>
              <p className="text-sm text-red-500 dark:text-red-300">{error || 'Analysis failed'}</p>
            </div>
          </div>
          <button
            onClick={() => onRemove(id)}
            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{fileName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getScoreLabel(overallScore)}</p>
            </div>
            <button
              onClick={() => onRemove(id)}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => toggleSection(id, 'overview')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 Quick Overview</h4>
          <span className="text-gray-400 dark:text-gray-500">
            {expandedSections[`${id}-overview`] ? '▼' : '▶'}
          </span>
        </button>
        
        {expandedSections[`${id}-overview`] && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{skillAnalysis?.totalSkills || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Skills</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{skillAnalysis?.highConfidenceSkills || skillAnalysis?.totalSkills || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">High Confidence</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{skillAnalysis?.expertSkills || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Expert Level</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{Math.round(analysis.confidence * 100)}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Parse Confidence</div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      {analysis.contact && Object.keys(analysis.contact).length > 0 && (
        <div className="p-6">
          <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📞 Contact Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {analysis.contact.email && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{analysis.contact.email}</span>
              </div>
            )}
            {analysis.contact.phone && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{analysis.contact.phone}</span>
              </div>
            )}
            {analysis.contact.linkedin && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">LinkedIn:</span>
                <span className="ml-2 text-blue-600 dark:text-blue-400">{analysis.contact.linkedin}</span>
              </div>
            )}
            {analysis.contact.github && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">GitHub:</span>
                <span className="ml-2 text-blue-600 dark:text-blue-400">{analysis.contact.github}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
