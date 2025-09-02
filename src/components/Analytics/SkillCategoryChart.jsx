import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const SkillCategoryChart = ({ skillAnalysis, title = "Skills by Category" }) => {
  const [viewType, setViewType] = useState('pie'); // 'pie' or 'bar'

  const chartData = skillAnalysis?.skillsByCategory?.map((category, index) => ({
    name: category.category.charAt(0).toUpperCase() + category.category.slice(1),
    value: category.count,
    percentage: Math.round((category.count / skillAnalysis.totalSkills) * 100),
    color: COLORS[index % COLORS.length],
    skills: Object.keys(category.skills).slice(0, 3) // Top 3 skills preview
  })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value} skills ({data.percentage}%)</p>
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Top skills:</p>
            {data.skills.map((skill, index) => (
              <p key={index} className="text-xs text-blue-600">• {skill}</p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('pie')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'pie' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'bar' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontWeight: 'medium' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                label={{ value: 'Skills Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{skillAnalysis.totalSkills}</div>
          <div className="text-sm text-blue-700">Total Skills</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{skillAnalysis.highConfidenceSkills}</div>
          <div className="text-sm text-green-700">High Confidence</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{skillAnalysis.expertSkills}</div>
          <div className="text-sm text-purple-700">Expert Level</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{chartData.length}</div>
          <div className="text-sm text-gray-700">Categories</div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCategoryChart;
