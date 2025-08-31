function EntryCard({ entry, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      'tired': '😴',
      'okay': '😐', 
      'good': '😊',
      'energized': '🚀',
      'fire': '🔥'
    };
    return moodMap[mood] || '😐';
  };

  // ✅ FIXED: Safe destructuring with default values
  const getTimeSpentText = (timeSpent = { hours: 0, minutes: 0 }) => {
    const { hours = 0, minutes = 0 } = timeSpent || {};
    if (hours === 0 && minutes === 0) return 'No time logged';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {formatDate(entry.date)}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
              <span className="text-sm text-gray-600">
                ⏱️ {getTimeSpentText(entry.timeSpent)}
              </span>
              <span className="text-sm text-gray-600">
                ⚡ Energy: {entry.energy || 5}/10
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(entry)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200"
              title="Edit Entry"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
              title="Delete Entry"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Progress */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            📈 Progress
          </h4>
          <p className="text-gray-700 text-sm line-clamp-3">
            {entry.progress || 'No progress notes'}
          </p>
        </div>

        {/* Technologies - Safe handling */}
        {entry.technologies && entry.technologies.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              💻 Technologies
            </h4>
            <div className="flex flex-wrap gap-1">
              {entry.technologies.slice(0, 4).map((tech, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {entry.technologies.length > 4 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{entry.technologies.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Activities - Safe handling */}
        {entry.activities && entry.activities.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">🎯 Activities</h4>
            <div className="flex flex-wrap gap-1">
              {entry.activities.slice(0, 3).map((activity, index) => (
                <span
                  key={index}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                >
                  {activity}
                </span>
              ))}
              {entry.activities.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{entry.activities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Productivity & Focus - Safe handling */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{entry.productivity || 5}/10</div>
            <div className="text-xs text-gray-600">Productivity</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{entry.focus || 5}/10</div>
            <div className="text-xs text-gray-600">Focus</div>
          </div>
        </div>

        {/* Quick Wins - Safe handling */}
        {entry.quickWins && Array.isArray(entry.quickWins) && entry.quickWins.some(win => win && win.trim()) && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">🎉 Quick Wins</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {entry.quickWins.filter(win => win && win.trim()).slice(0, 2).map((win, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="line-clamp-1">{win}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Challenges */}
        {entry.challenges && entry.challenges.trim() && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">🚧 Challenges</h4>
            <p className="text-gray-700 text-sm line-clamp-2">
              {entry.challenges}
            </p>
          </div>
        )}

        {/* Learnings */}
        {entry.learnings && entry.learnings.trim() && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Learnings</h4>
            <p className="text-gray-700 text-sm line-clamp-2">
              {entry.learnings}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          Created: {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown date'}
        </div>
      </div>
    </div>
  );
}

export default EntryCard;
