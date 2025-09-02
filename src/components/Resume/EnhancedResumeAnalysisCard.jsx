import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
            ✕
          </button>
        </div>
      </div>
    );
  }

  const { skillAnalysis, qualityMetrics } = analysis;
  const overallScore = qualityMetrics.overallScore;

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
              {analysis.sectionCount} sections
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
              ✕
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
          {expandedSections.overview ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.overview && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{skillAnalysis.totalSkills}</div>
              <div className="text-xs text-gray-600">Total Skills</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{skillAnalysis.highConfidenceSkills}</div>
              <div className="text-xs text-gray-600">High Confidence</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{skillAnalysis.expertSkills}</div>
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
          {expandedSections.skills ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {expandedSections.skills && (
          <div className="mt-4 space-y-4">
            {/* Top Skills */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">🏆 Top Skills</h5>
              <div className="flex flex-wrap gap-2">
                {skillAnalysis.topSkills.slice(0, 8).map((skill, index) => (
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
                    {skill.name} ({skill.level})
                  </span>
                ))}
              </div>
            </div>

            {/* Skills by Category */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">📂 By Category</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillAnalysis.skillsByCategory.map(category => (
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
                      {Object.entries(category.skills).slice(0, 5).map(([skillName, skillData]) => (
                        <div key={skillName} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{skillName}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">{skillData.level}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              skillData.confidence > 0.8 ? 'bg-green-400' :
                              skillData.confidence > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quality Metrics */}
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={() => toggleSection('quality')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-semibold text-gray-900">📈 Resume Quality</h4>
          {expandedSections.quality ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          )}
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

      {/* Recommendations */}
      <div className="p-6">
        <button
          onClick={() => toggleSection('recommendations')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-semibold text-gray-900">💡 Recommendations</h4>
          {expandedSections.recommendations ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {expandedSections.recommendations && (
          <div className="mt-4 space-y-3">
            {/* Smart Skill Recommendations */}
            {skillAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-1">{rec.title}</h5>
                <p className="text-blue-700 text-sm mb-2">{rec.description}</p>
                <div className="flex flex-wrap gap-1">
                  {rec.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Quality Recommendations */}
            {qualityMetrics.recommendations.map((rec, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">{rec}</p>
              </div>
            ))}
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

export default EnhancedResumeAnalysisCard;
