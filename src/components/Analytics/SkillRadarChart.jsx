import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const SkillRadarChart = ({ skillAnalysis, title = "Skill Coverage Analysis" }) => {
  // Transform skill data for radar chart
  const radarData = skillAnalysis?.skillsByCategory?.map(category => ({
    category: category.category.charAt(0).toUpperCase() + category.category.slice(1),
    value: Math.min(category.count * 20, 100), // Scale to 0-100
    fullMark: 100
  })) || [];

  const getScoreColor = (value) => {
    if (value >= 80) return '#10B981'; // Green
    if (value >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Max Score: 100
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid 
              stroke="#E5E7EB" 
              strokeWidth={1}
            />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              className="font-medium"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickCount={5}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {radarData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getScoreColor(item.value) }}
            />
            <span className="text-sm font-medium text-gray-700">
              {item.category}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillRadarChart;
