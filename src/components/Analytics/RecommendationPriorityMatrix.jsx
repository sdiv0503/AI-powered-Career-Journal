import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const RecommendationPriorityMatrix = ({ skillAnalysis, qualityMetrics }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState('all');

  // Helper functions moved to the top (before useMemo)
  const generateMissingSkillRecommendations = (skillAnalysis) => {
    if (!skillAnalysis?.skillsByCategory) return [];

    const commonTechStacks = [
      { stack: 'Frontend', skills: ['React', 'JavaScript', 'CSS'], impact: 7, effort: 5 },
      { stack: 'Backend', skills: ['Node.js', 'Python', 'SQL'], impact: 8, effort: 6 },
      { stack: 'DevOps', skills: ['Docker', 'AWS', 'Git'], impact: 6, effort: 7 },
      { stack: 'Mobile', skills: ['React Native', 'Swift', 'Kotlin'], impact: 5, effort: 8 }
    ];

    const currentSkills = new Set(
      Object.values(skillAnalysis.skillsByCategory)
        .flatMap(category => Object.keys(category.skills || {}))
    );

    return commonTechStacks
      .filter(stack => {
        const hasSkills = stack.skills.some(skill => currentSkills.has(skill));
        const missingSkills = stack.skills.filter(skill => !currentSkills.has(skill));
        return hasSkills && missingSkills.length > 0;
      })
      .map(stack => ({
        name: `Complete ${stack.stack} Stack`,
        fullName: `Add missing ${stack.stack} technologies to complete your skill set`,
        impact: stack.impact,
        effort: stack.effort,
        type: 'stack',
        category: 'Technology Stack',
        skills: stack.skills.filter(skill => !currentSkills.has(skill))
      }));
  };

  const generateSectionRecommendations = (qualityMetrics) => {
    if (!qualityMetrics) return [];

    const recommendations = [];
    
    if (qualityMetrics.sectionCompleteness < 80) {
      recommendations.push({
        name: 'Add Missing Resume Sections',
        fullName: 'Include essential sections like Projects, Certifications, or Awards',
        impact: 9,
        effort: 2,
        type: 'section',
        category: 'Resume Structure'
      });
    }

    if (qualityMetrics.contactCompleteness < 90) {
      recommendations.push({
        name: 'Complete Contact Information',
        fullName: 'Add missing contact details like phone, LinkedIn, or portfolio',
        impact: 8,
        effort: 1,
        type: 'contact',
        category: 'Contact Info'
      });
    }

    return recommendations;
  };

  const getQuadrant = (impact, effort) => {
    if (impact >= 6 && effort <= 5) return 'high-impact-low-effort';
    if (impact >= 6 && effort > 5) return 'high-impact-high-effort';
    if (impact < 6 && effort <= 5) return 'low-impact-low-effort';
    return 'low-impact-high-effort';
  };

  // Transform recommendations into priority matrix data
  const matrixData = useMemo(() => {
    const baseRecommendations = [
      // Quality-based recommendations
      ...(qualityMetrics?.recommendations || []).map(rec => ({
        name: rec.substring(0, 30) + '...',
        fullName: rec,
        impact: 8,
        effort: 3,
        type: 'quality',
        category: 'Quality Improvement'
      })),
      
      // Skill-based recommendations
      ...(skillAnalysis?.recommendations || []).map(rec => ({
        name: rec.title?.substring(0, 30) + '...' || 'Skill Enhancement',
        fullName: rec.title || rec.description || 'Enhance skills',
        impact: rec.priority ? Math.round(rec.priority * 10) : 6,
        effort: rec.skills?.length || 4,
        type: 'skill',
        category: 'Skill Enhancement',
        skills: rec.skills || []
      })),

      // Missing skills recommendations
      ...generateMissingSkillRecommendations(skillAnalysis),
      
      // Section completeness recommendations
      ...generateSectionRecommendations(qualityMetrics)
    ];

    return baseRecommendations.map((item, index) => ({
      ...item,
      id: index,
      size: Math.max(20, Math.min(60, item.impact * 6)),
      quadrant: getQuadrant(item.impact, item.effort)
    }));
  }, [skillAnalysis, qualityMetrics]);

  const quadrantColors = {
    'high-impact-low-effort': '#10B981', // Green - Quick wins
    'high-impact-high-effort': '#3B82F6', // Blue - Major projects  
    'low-impact-low-effort': '#F59E0B',   // Yellow - Fill-ins
    'low-impact-high-effort': '#EF4444'   // Red - Avoid
  };

  const quadrantLabels = {
    'high-impact-low-effort': 'Quick Wins',
    'high-impact-high-effort': 'Major Projects',
    'low-impact-low-effort': 'Fill-ins',
    'low-impact-high-effort': 'Money Pit'
  };

  const filteredData = selectedQuadrant === 'all' 
    ? matrixData 
    : matrixData.filter(item => item.quadrant === selectedQuadrant);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-2">{data.fullName}</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Impact:</span> {data.impact}/10</p>
            <p><span className="font-medium">Effort:</span> {data.effort}/10</p>
            <p><span className="font-medium">Category:</span> {data.category}</p>
            <p><span className="font-medium">Priority:</span> {quadrantLabels[data.quadrant]}</p>
            {data.skills && data.skills.length > 0 && (
              <div>
                <span className="font-medium">Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!matrixData.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Recommendation Priority Matrix</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No recommendations available yet. Upload a resume to see priority analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">🎯 Recommendation Priority Matrix</h3>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedQuadrant}
            onChange={(e) => setSelectedQuadrant(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Recommendations</option>
            <option value="high-impact-low-effort">Quick Wins</option>
            <option value="high-impact-high-effort">Major Projects</option>
            <option value="low-impact-low-effort">Fill-ins</option>
            <option value="low-impact-high-effort">Money Pit</option>
          </select>
        </div>
      </div>

      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number" 
              dataKey="effort" 
              domain={[0, 10]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Effort Required', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="impact" 
              domain={[0, 10]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Impact Level', angle: -90, position: 'insideLeft' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Scatter data={filteredData}>
              {filteredData.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={quadrantColors[entry.quadrant]}
                  stroke={quadrantColors[entry.quadrant]}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(quadrantLabels).map(([key, label]) => {
          const count = matrixData.filter(item => item.quadrant === key).length;
          return (
            <div 
              key={key} 
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedQuadrant === key || selectedQuadrant === 'all'
                  ? 'border-gray-300' 
                  : 'border-gray-100 opacity-50'
              }`}
              onClick={() => setSelectedQuadrant(selectedQuadrant === key ? 'all' : key)}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: quadrantColors[key] }}
                />
                <span className="font-medium text-sm">{label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{count} recommendations</p>
            </div>
          );
        })}
      </div>

      {/* Action Items */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Recommended Action Plan</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>1. <strong>Start with Quick Wins</strong> - High impact, low effort items for immediate improvements</p>
          <p>2. <strong>Plan Major Projects</strong> - Schedule high-impact items that require more effort</p>
          <p>3. <strong>Use Fill-ins Strategically</strong> - Low effort items to complete during downtime</p>
          <p>4. <strong>Avoid Money Pit</strong> - High effort, low impact items should be deprioritized</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationPriorityMatrix;
