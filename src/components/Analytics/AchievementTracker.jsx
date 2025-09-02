import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementTracker = ({ analyzedResumes, skillAnalysis, qualityMetrics }) => {
  // Define achievement definitions
  const achievementDefinitions = [
    {
      id: 'first_analysis',
      title: 'Getting Started',
      description: 'Complete your first resume analysis',
      icon: '🎯',
      category: 'milestone',
      requirement: { type: 'resumes_analyzed', value: 1 },
      points: 10
    },
    {
      id: 'skill_diversifier',
      title: 'Skill Diversifier',
      description: 'Detect 15+ different skills',
      icon: '🌟',
      category: 'skills',
      requirement: { type: 'total_skills', value: 15 },
      points: 25
    },
    {
      id: 'quality_improver',
      title: 'Quality Improver',
      description: 'Achieve 80%+ overall quality score',
      icon: '📈',
      category: 'quality',
      requirement: { type: 'quality_score', value: 80 },
      points: 30
    },
    {
      id: 'expert_level',
      title: 'Expert Level',
      description: 'Have 5+ expert-level skills',
      icon: '🏆',
      category: 'skills',
      requirement: { type: 'expert_skills', value: 5 },
      points: 50
    },
    {
      id: 'completion_master',
      title: 'Completion Master',
      description: 'Achieve 100% section completeness',
      icon: '✅',
      category: 'quality',
      requirement: { type: 'section_completeness', value: 100 },
      points: 40
    },
    {
      id: 'tech_stack_complete',
      title: 'Tech Stack Complete',
      description: 'Master a complete technology stack',
      icon: '⚡',
      category: 'skills',
      requirement: { type: 'complete_stack', value: 1 },
      points: 35
    },
    {
      id: 'iteration_master',
      title: 'Iteration Master',
      description: 'Upload and analyze 5 resume versions',
      icon: '🔄',
      category: 'milestone',
      requirement: { type: 'resumes_analyzed', value: 5 },
      points: 45
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Achieve 95%+ in all quality metrics',
      icon: '💎',
      category: 'quality',
      requirement: { type: 'all_metrics_high', value: 95 },
      points: 100
    }
  ];

  // Calculate current achievements
  const { achievements, totalPoints, progress } = useMemo(() => {
    if (!analyzedResumes?.length) return { achievements: [], totalPoints: 0, progress: {} };

    const currentStats = {
      resumes_analyzed: analyzedResumes.length,
      total_skills: skillAnalysis?.totalSkills || 0,
      expert_skills: skillAnalysis?.expertSkills || 0,
      quality_score: qualityMetrics?.overallScore || 0,
      section_completeness: qualityMetrics?.sectionCompleteness || 0,
      skill_diversity: qualityMetrics?.skillDiversity || 0,
      content_depth: qualityMetrics?.contentDepth || 0,
      contact_completeness: qualityMetrics?.contactCompleteness || 0
    };

    // Check for complete tech stacks
    const techStacks = [
      { name: 'Frontend', skills: ['JavaScript', 'React', 'CSS'] },
      { name: 'Backend', skills: ['Node.js', 'Python', 'SQL'] },
      { name: 'DevOps', skills: ['Docker', 'AWS', 'Git'] }
    ];

    const currentSkills = new Set(
      Object.values(skillAnalysis?.skillsByCategory || {})
        .flatMap(category => Object.keys(category.skills || {}))
    );

    const completeStacks = techStacks.filter(stack => 
      stack.skills.every(skill => currentSkills.has(skill))
    ).length;

    currentStats.complete_stack = completeStacks;

    // Check if all quality metrics are above threshold
    const allQualityMetrics = [
      currentStats.quality_score,
      currentStats.section_completeness,
      currentStats.skill_diversity,
      currentStats.content_depth
    ];
    const allMetricsHigh = Math.min(...allQualityMetrics);
    currentStats.all_metrics_high = allMetricsHigh;

    const earnedAchievements = [];
    const progressData = {};

    achievementDefinitions.forEach(achievement => {
      const { requirement } = achievement;
      const currentValue = currentStats[requirement.type] || 0;
      const isEarned = currentValue >= requirement.value;
      const progressPercent = Math.min((currentValue / requirement.value) * 100, 100);

      progressData[achievement.id] = {
        current: currentValue,
        required: requirement.value,
        percent: Math.round(progressPercent),
        isEarned
      };

      if (isEarned) {
        earnedAchievements.push({
          ...achievement,
          earnedAt: new Date(), // In real app, this would be stored
          progress: progressData[achievement.id]
        });
      }
    });

    const points = earnedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

    return {
      achievements: earnedAchievements,
      totalPoints: points,
      progress: progressData
    };
  }, [analyzedResumes, skillAnalysis, qualityMetrics]);

  const unearned = achievementDefinitions.filter(def => 
    !achievements.some(earned => earned.id === def.id)
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'skills': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quality': return 'bg-green-100 text-green-800 border-green-200';
      case 'milestone': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const AchievementCard = ({ achievement, isEarned = false }) => {
    const progressInfo = progress[achievement.id];
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.02 }}
        className={`p-4 rounded-lg border-2 transition-all ${
          isEarned
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-md'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${isEarned ? 'filter-none' : 'grayscale opacity-50'}`}>
              {achievement.icon}
            </div>
            <div>
              <h4 className={`font-semibold ${isEarned ? 'text-yellow-800' : 'text-gray-700'}`}>
                {achievement.title}
              </h4>
              <p className={`text-sm ${isEarned ? 'text-yellow-700' : 'text-gray-500'}`}>
                {achievement.description}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(achievement.category)}`}>
              {achievement.category}
            </span>
            <span className={`text-sm font-medium ${isEarned ? 'text-yellow-600' : 'text-gray-400'}`}>
              {achievement.points} pts
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {progressInfo && (
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className={isEarned ? 'text-yellow-700' : 'text-gray-600'}>
                Progress: {progressInfo.current}/{progressInfo.required}
              </span>
              <span className={isEarned ? 'text-yellow-600' : 'text-gray-500'}>
                {progressInfo.percent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isEarned ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressInfo.percent}%` }}
              />
            </div>
          </div>
        )}

        {isEarned && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-2 border-t border-yellow-300"
          >
            <span className="text-xs text-yellow-600 font-medium">
              ✨ Achievement Unlocked!
            </span>
            <span className="text-xs text-yellow-600">
              {achievement.earnedAt?.toLocaleDateString() || 'Just now'}
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">🏆 Achievement Tracker</h3>
          <p className="text-sm text-gray-600">Track your resume improvement milestones</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
          <div className="text-xs text-gray-500">Total Points</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">{achievements.length}</div>
          <div className="text-xs text-yellow-700">Earned</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-600">{unearned.length}</div>
          <div className="text-xs text-gray-700">Remaining</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">
            {Math.round((achievements.length / achievementDefinitions.length) * 100)}%
          </div>
          <div className="text-xs text-blue-700">Complete</div>
        </div>
      </div>

      {/* Earned Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-yellow-500 mr-2">🏅</span>
            Earned Achievements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {achievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isEarned={true}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upcoming Achievements */}
      {unearned.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-gray-400 mr-2">🎯</span>
            Next Achievements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unearned
              .sort((a, b) => (progress[b.id]?.percent || 0) - (progress[a.id]?.percent || 0))
              .slice(0, 4)
              .map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isEarned={false}
                />
              ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Pro tip:</strong> {
            achievements.length === 0 ? 
            "Upload your first resume to start earning achievements!" :
            achievements.length < 3 ?
            "You're off to a great start! Keep improving to unlock more achievements." :
            achievements.length < 6 ?
            "Excellent progress! You're becoming a resume optimization expert." :
            "Outstanding! You've mastered resume optimization. Share your success with others!"
          }
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementTracker;
