import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const QualityMetricsChart = ({ analyzedResumes, selectedResumeId }) => {
  const [chartType, setChartType] = useState('line'); // 'line' | 'area' | 'bar'
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Transform resume data for chart visualization
  const chartData = React.useMemo(() => {
    if (!analyzedResumes?.length) return [];

    // Sort resumes by analysis date
    const sortedResumes = [...analyzedResumes]
      .filter(resume => resume.analysis?.qualityMetrics)
      .sort((a, b) => new Date(a.analyzedAt) - new Date(b.analyzedAt))
      .map((resume, index) => ({
        version: `V${index + 1}`,
        fileName: resume.fileName.substring(0, 15) + '...',
        date: new Date(resume.analyzedAt).toLocaleDateString(),
        overallScore: resume.analysis.qualityMetrics?.overallScore || Math.round(resume.analysis.confidence * 100),
        sectionCompleteness: resume.analysis.qualityMetrics?.sectionCompleteness || 70,
        skillDiversity: resume.analysis.qualityMetrics?.skillDiversity || 60,
        contentDepth: resume.analysis.qualityMetrics?.contentDepth || 65,
        contactCompleteness: resume.analysis.qualityMetrics?.contactCompleteness || 80,
        totalSkills: resume.analysis.skillAnalysis?.totalSkills || 0,
        highConfidenceSkills: resume.analysis.skillAnalysis?.highConfidenceSkills || 0
      }));

    return sortedResumes;
  }, [analyzedResumes]);

  const qualityMetrics = [
    { key: 'overallScore', name: 'Overall Quality', color: '#3B82F6' },
    { key: 'sectionCompleteness', name: 'Section Completeness', color: '#10B981' },
    { key: 'skillDiversity', name: 'Skill Diversity', color: '#F59E0B' },
    { key: 'contentDepth', name: 'Content Depth', color: '#EF4444' },
    { key: 'contactCompleteness', name: 'Contact Info', color: '#8B5CF6' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label} - ${payload[0]?.payload?.fileName}`}</p>
          <p className="text-sm text-gray-500 mb-2">{payload[0]?.payload?.date}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${entry.dataKey.includes('Skills') ? '' : '%'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {qualityMetrics.map((metric) => (
                <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="version" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {qualityMetrics
              .filter(metric => selectedMetric === 'all' || selectedMetric === metric.key)
              .map((metric) => (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  fillOpacity={0.3}
                  fill={`url(#gradient-${metric.key})`}
                  strokeWidth={2}
                  name={metric.name}
                />
              ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="version" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {qualityMetrics
              .filter(metric => selectedMetric === 'all' || selectedMetric === metric.key)
              .map((metric) => (
                <Bar
                  key={metric.key}
                  dataKey={metric.key}
                  fill={metric.color}
                  name={metric.name}
                  radius={[2, 2, 0, 0]}
                />
              ))}
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="version" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {qualityMetrics
              .filter(metric => selectedMetric === 'all' || selectedMetric === metric.key)
              .map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  name={metric.name}
                />
              ))}
          </LineChart>
        );
    }
  };

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Quality Progression</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Upload multiple resume versions to see quality progression over time</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">📈 Quality Progression Analysis</h3>
        
        <div className="flex items-center space-x-4">
          {/* Metric Filter */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Metrics</option>
            {qualityMetrics.map((metric) => (
              <option key={metric.key} value={metric.key}>{metric.name}</option>
            ))}
          </select>

          {/* Chart Type Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['line', 'area', 'bar'].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Progress Summary */}
      {chartData.length > 1 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {qualityMetrics.slice(0, 4).map((metric) => {
            const firstScore = chartData[0][metric.key];
            const lastScore = chartData[chartData.length - 1][metric.key];
            const improvement = lastScore - firstScore;
            
            return (
              <div key={metric.key} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement}%
                </div>
                <div className="text-xs text-gray-600">{metric.name}</div>
                <div className="text-xs text-gray-500">
                  {firstScore}% → {lastScore}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default QualityMetricsChart;
