function SuccessMessage({ onBackToHome, streak = 1 }) {
  const getStreakMessage = (days) => {
    if (days === 1) return "Great start! You've begun your coding journal journey! 🌱";
    if (days < 7) return `Amazing! ${days} days in a row! You're building momentum! 🚀`;
    if (days < 30) return `Incredible! ${days} day streak! You're developing a solid habit! 🔥`;
    return `Phenomenal! ${days} days strong! You're a consistency champion! 🏆`;
  };

  const getAchievementBadge = (days) => {
    if (days === 1) return { emoji: '🌱', title: 'First Step', color: 'from-green-400 to-emerald-500' };
    if (days === 7) return { emoji: '🚀', title: 'Week Warrior', color: 'from-blue-400 to-cyan-500' };
    if (days === 30) return { emoji: '🔥', title: 'Month Master', color: 'from-orange-400 to-red-500' };
    if (days === 100) return { emoji: '🏆', title: 'Century Champion', color: 'from-yellow-400 to-orange-500' };
    return { emoji: '⭐', title: 'Daily Developer', color: 'from-purple-400 to-pink-500' };
  };

  const achievement = getAchievementBadge(streak);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Streak Display */}
        <div className="mb-6">
          <div className={`w-24 h-24 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce`}>
            <span className="text-4xl text-white">{achievement.emoji}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Entry Saved Successfully!
          </h2>
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 mb-4">
            <p className="text-2xl font-bold text-gray-800">🔥 {streak} Day Streak!</p>
            <p className="text-sm text-gray-600 mt-1">{getStreakMessage(streak)}</p>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
          <div className="flex items-center justify-center mb-3">
            <span className="text-3xl mr-3">{achievement.emoji}</span>
            <h3 className="text-xl font-bold text-purple-800">{achievement.title}</h3>
          </div>
          <p className="text-purple-700">You're building an incredible coding habit!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{streak}</div>
            <div className="text-xs text-blue-500">Day Streak</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">📈</div>
            <div className="text-xs text-green-500">Growing</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">💪</div>
            <div className="text-xs text-purple-500">Consistent</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onBackToHome}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-300"
          >
            Add Another Entry
          </button>
        </div>

        {/* Motivational Quote */}
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700 italic">
            "The journey of a thousand miles begins with a single step." - Keep coding! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuccessMessage;
