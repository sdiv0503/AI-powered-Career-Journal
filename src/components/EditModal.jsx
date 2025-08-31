import { useState, useEffect } from 'react';

function EditModal({ entry, onSave, onClose }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(entry);
  }, [entry]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.progress?.trim()) {
      alert('Progress notes are required!');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate save delay
    setTimeout(() => {
      onSave({
        ...formData,
        timestamp: new Date().toISOString() // Update timestamp
      });
      setIsSubmitting(false);
    }, 500);
  };

  const handleTechAdd = (techString) => {
    if (techString && !formData.technologies.includes(techString)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techString]
      }));
    }
  };

  const handleTechRemove = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const moodOptions = [
    { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😊', label: 'Good', value: 'good' },
    { emoji: '🚀', label: 'Energized', value: 'energized' },
    { emoji: '🔥', label: 'On Fire', value: 'fire' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">✏️ Edit Journal Entry</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Entry from {new Date(formData.date).toLocaleDateString()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mood
              </label>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => handleInputChange('mood', mood.value)}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      formData.mood === mood.value
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg">{mood.emoji}</div>
                    <div className="text-xs font-medium">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Energy and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Energy Level: {formData.energy}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy || 5}
                onChange={(e) => handleInputChange('energy', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={formData.timeSpent?.hours || 0}
                onChange={(e) => handleInputChange('timeSpent', {
                  ...formData.timeSpent,
                  hours: parseInt(e.target.value) || 0
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.timeSpent?.minutes || 0}
                onChange={(e) => handleInputChange('timeSpent', {
                  ...formData.timeSpent,
                  minutes: parseInt(e.target.value) || 0
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Today's Progress *
            </label>
            <textarea
              value={formData.progress || ''}
              onChange={(e) => handleInputChange('progress', e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What did you accomplish today?"
              required
            />
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Technologies & Tools
            </label>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Add a technology and press Enter..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTechAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies?.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleTechRemove(tech)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Productivity and Focus */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Productivity: {formData.productivity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.productivity || 5}
                onChange={(e) => handleInputChange('productivity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Focus: {formData.focus}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.focus || 5}
                onChange={(e) => handleInputChange('focus', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Challenges & Solutions
            </label>
            <textarea
              value={formData.challenges || ''}
              onChange={(e) => handleInputChange('challenges', e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What obstacles did you overcome?"
            />
          </div>

          {/* Learnings */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Key Learnings
            </label>
            <textarea
              value={formData.learnings || ''}
              onChange={(e) => handleInputChange('learnings', e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What new concepts did you learn?"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes ✅'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
