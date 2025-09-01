import { useState } from 'react';

function EntryCard({ entry, onEdit, onDelete }) {
  const [showFullProgress, setShowFullProgress] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      'tired': '😴',
      'okay': '😐', 
      'good': '😊',
      'energized': '🚀',
      'fire': '🔥'
    };
    return moodMap[mood] || '😊';
  };

  const getTimeSpentText = (timeSpent = { hours: 0, minutes: 0 }) => {
    const { hours = 0, minutes = 0 } = timeSpent || {};
    if (hours === 0 && minutes === 0) return 'No time';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (score >= 6) return 'bg-blue-50 border-blue-200 text-blue-700';
    if (score >= 4) return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-red-50 border-red-200 text-red-700';
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex flex-col">
      {/* Header Section */}
      <header className="p-6 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {formatDate(entry.date)}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(entry)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Edit Entry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete Entry"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Mood Section */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-3 min-h-[60px]">
            <div className="text-2xl mb-1">{getMoodEmoji(entry.mood)}</div>
            <span className="text-xs font-medium text-gray-600">Mood</span>
          </div>
          
          {/* Time Section */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-3 min-h-[60px] overflow-hidden">
            <div className="flex items-center justify-center w-full px-1">
              <svg className="w-3 h-3 text-gray-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span 
                className="text-xs font-semibold text-gray-900 truncate text-center flex-1"
                title={getTimeSpentText(entry.timeSpent) === 'No time' ? 'No time logged' : getTimeSpentText(entry.timeSpent)}
              >
                {getTimeSpentText(entry.timeSpent)}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-600 mt-1">Time</span>
          </div>
          
          {/* Energy Section */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-3 min-h-[60px]">
            <div className="flex items-center text-sm font-semibold text-gray-900 mb-1">
              <svg className="w-4 h-4 text-amber-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{entry.energy || 5}/10</span>
            </div>
            <span className="text-xs font-medium text-gray-600">Energy</span>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <main className="p-6 pt-4 space-y-4 flex-1">
        {/* Progress Section */}
        <section>
          <div className="flex items-center mb-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full mr-3"></div>
            <h4 className="font-semibold text-gray-900 text-sm">Progress</h4>
          </div>
          <div className="pl-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {showFullProgress 
                ? entry.progress 
                : (entry.progress?.length > 120 
                    ? `${entry.progress.slice(0, 120)}...` 
                    : entry.progress || 'No progress details available')
              }
            </p>
            {entry.progress?.length > 120 && (
              <button
                onClick={() => setShowFullProgress(!showFullProgress)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium"
              >
                {showFullProgress ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </section>

        {/* Technologies & Activities Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Technologies */}
          <div>
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <h4 className="font-semibold text-gray-900 text-xs">Technologies</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.technologies && entry.technologies.length > 0 ? (
                entry.technologies.slice(0, 2).map((tech, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-medium"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">None</span>
              )}
              {entry.technologies && entry.technologies.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                  +{entry.technologies.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h4 className="font-semibold text-gray-900 text-xs">Activities</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.activities && entry.activities.length > 0 ? (
                entry.activities.slice(0, 2).map((activity, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium"
                  >
                    {activity}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">None</span>
              )}
              {entry.activities && entry.activities.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                  +{entry.activities.length - 2}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl border-2 p-4 text-center transition-all duration-200 ${getScoreColor(entry.productivity || 5)}`}>
            <div className="text-2xl font-bold mb-1">{entry.productivity || 5}</div>
            <div className="text-xs font-semibold opacity-80">Productivity</div>
          </div>
          <div className={`rounded-xl border-2 p-4 text-center transition-all duration-200 ${getScoreColor(entry.focus || 5)}`}>
            <div className="text-2xl font-bold mb-1">{entry.focus || 5}</div>
            <div className="text-xs font-semibold opacity-80">Focus</div>
          </div>
        </section>

        {/* Additional Sections - Optional */}
        {(entry.quickWins?.some(win => win?.trim()) || entry.challenges?.trim() || entry.learnings?.trim()) && (
          <section className="space-y-3 pt-2 border-t border-gray-100">
            {/* Quick Wins */}
            {entry.quickWins?.some(win => win?.trim()) && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <h4 className="font-semibold text-gray-900 text-xs">🎉 Quick Wins</h4>
                </div>
                <div className="text-xs text-gray-700 space-y-1 pl-3">
                  {entry.quickWins.filter(win => win?.trim()).slice(0, 2).map((win, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-emerald-500 mr-2 mt-0.5 text-xs">•</span>
                      <span className="line-clamp-1 leading-relaxed">{win}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges & Learnings - Compact Layout */}
            {(entry.challenges?.trim() || entry.learnings?.trim()) && (
              <div className="grid grid-cols-2 gap-3">
                {entry.challenges?.trim() && (
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="w-1 h-3 bg-red-500 rounded-full mr-2"></div>
                      <h4 className="font-semibold text-gray-900 text-xs">🚧 Challenges</h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pl-3">{entry.challenges}</p>
                  </div>
                )}
                
                {entry.learnings?.trim() && (
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="w-1 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <h4 className="font-semibold text-gray-900 text-xs">💡 Learnings</h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pl-3">{entry.learnings}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </article>
  );
}

export default EntryCard;
