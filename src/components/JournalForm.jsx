import { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SuccessMessage from "./SuccessMessage";
import { updateUserStreak } from '../services/streakService';

function JournalForm({ onBackToHome, onViewDashboard }) {
  const { currentUser } = useAuth();

  const initialFormData = {
    date: new Date().toISOString().split("T")[0],
    mood: "",
    energy: 5,
    timeSpent: { hours: 0, minutes: 0 },
    activities: [],
    technologies: [],
    productivity: 5,
    focus: 5,
    progress: "",
    challenges: "",
    learnings: "",
    codeSnippet: "",
    quickWins: ["", "", ""],
    tomorrowGoals: "",
    reflectionAnswers: {},
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);

  // Mood options
  const moodOptions = [
    { emoji: "😴", label: "Tired", value: "tired" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "😊", label: "Good", value: "good" },
    { emoji: "🚀", label: "Energized", value: "energized" },
    { emoji: "🔥", label: "On Fire", value: "fire" },
  ];

  // Activity options
  const activityOptions = [
    { label: "💻 Coding", value: "coding", color: "bg-blue-100 text-blue-800" },
    {
      label: "📚 Learning",
      value: "learning",
      color: "bg-green-100 text-green-800",
    },
    {
      label: "🐛 Debugging",
      value: "debugging",
      color: "bg-red-100 text-red-800",
    },
    {
      label: "📖 Reading",
      value: "reading",
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "🎥 Tutorial",
      value: "tutorial",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "🤝 Collaboration",
      value: "collaboration",
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  // Popular technologies for autocomplete
  const popularTechs = [
    "React",
    "JavaScript",
    "Python",
    "Node.js",
    "TypeScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "MongoDB",
    "Express",
    "Git",
    "Docker",
    "AWS",
    "Next.js",
    "Vue.js",
    "Angular",
    "Java",
    "C++",
    "SQL",
    "PostgreSQL",
    "Redis",
    "GraphQL",
  ];

  // Daily reflection prompts (rotates based on day)
  const reflectionPrompts = [
    { id: "improvement", question: "What skill did I improve today?" },
    { id: "challenge", question: "What was the biggest challenge I overcame?" },
    { id: "discovery", question: "What new concept did I discover today?" },
    { id: "efficiency", question: "How could I be more efficient tomorrow?" },
    {
      id: "collaboration",
      question: "How did I help or learn from others today?",
    },
    {
      id: "creativity",
      question: "What creative solution did I come up with?",
    },
    { id: "milestone", question: "What milestone am I working toward?" },
  ];

  // Get today's prompt based on day of week
  const todaysPrompt = reflectionPrompts[new Date().getDay()];

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      localStorage.setItem("journalDraft", JSON.stringify(formData));
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem("journalDraft");
    if (draft) {
      const draftData = JSON.parse(draft);
      if (draftData.date === formData.date) {
        setFormData(draftData);
      }
    }

    // Calculate streak
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    setStreak(calculateStreak(entries));
  }, []);

  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleTechAdd = (tech) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, tech],
      }));
    }
  };

  const handleTechRemove = (tech) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleQuickWinChange = (index, value) => {
    const newQuickWins = [...formData.quickWins];
    newQuickWins[index] = value;
    handleInputChange("quickWins", newQuickWins);
  };

  // Navigation functions with proper event prevention
  const nextStep = (e) => {
    e?.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    e?.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


// In your handleSubmit function, add this after saving the entry:
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert('You must be logged in to create a journal entry.');
    return;
  }

  try {
    setIsSubmitting(true);

    const entryDate = new Date().toISOString().slice(0, 10);
    
    const entryData = {
      date: entryDate,
      timestamp: new Date(),
      progress: formData.progress,
      mood: formData.mood,
      technologies: formData.technologies,
      activities: formData.activities,
      energy: formData.energy,
      productivity: formData.productivity,
      focus: formData.focus,
      learnings: formData.learnings,
      challenges: formData.challenges,
      timeSpent: formData.timeSpent,
      codeSnippet: formData.codeSnippet,
      quickWins: formData.quickWins,
      tomorrowGoals: formData.tomorrowGoals,
      reflectionAnswers: formData.reflectionAnswers,
      userId: currentUser.uid,
      createdAt: new Date(),
    };

    console.log("Saving entry with data:", entryData);

    const docRef = await addDoc(
      collection(db, "users", currentUser.uid, "journalEntries"),
      entryData
    );

    console.log("Entry saved with ID:", docRef.id);

    // Update streak after successful entry save
    const updatedStreakData = await updateUserStreak(currentUser.uid, entryDate);
    console.log("Streak updated:", updatedStreakData);

    // Clear draft and reset form
    localStorage.removeItem("journalDraft");
    setFormData(initialFormData);
    setCurrentStep(1);
    setShowSuccess(true);
    
  } catch (error) {
    console.error("Error saving entry:", error);
    alert('Failed to save entry. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  if (showSuccess) {
    return (
      <SuccessMessage
        onBackToHome={onBackToHome}
        onViewDashboard={onViewDashboard}
        streak={streak + 1}
      />
    );
  }

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Streak */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Daily Coding Journal
            </h1>
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full">
              🔥 {streak} day streak
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Mood, Energy & Time */}
            {currentStep === 1 && (
              <div className="p-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  How are you feeling today?
                </h2>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Mood
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => handleInputChange("mood", mood.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.mood === mood.value
                            ? "border-blue-500 bg-blue-50 scale-110"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <div className="text-sm font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Energy Level: {formData.energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energy}
                    onChange={(e) =>
                      handleInputChange("energy", parseInt(e.target.value))
                    }
                    className="range-slider w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Time Spent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Time spent coding today
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={formData.timeSpent.hours}
                        onChange={(e) =>
                          handleInputChange("timeSpent", {
                            ...formData.timeSpent,
                            hours: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Minutes
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.timeSpent.minutes}
                        onChange={(e) =>
                          handleInputChange("timeSpent", {
                            ...formData.timeSpent,
                            minutes: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Activities & Technologies */}
            {currentStep === 2 && (
              <div className="p-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What did you work on?
                </h2>

                {/* Activities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Activities (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {activityOptions.map((activity) => (
                      <button
                        key={activity.value}
                        type="button"
                        onClick={() =>
                          handleArrayToggle("activities", activity.value)
                        }
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.activities.includes(activity.value)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${activity.color}`}
                        >
                          {activity.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Technologies & Tools
                  </label>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Type a technology and press Enter..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleTechAdd(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>

                  {/* Popular tech suggestions */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Popular technologies:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularTechs.slice(0, 8).map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => handleTechAdd(tech)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300"
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected technologies */}
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech) => (
                      <span
                        key={tech}
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
              </div>
            )}

            {/* Step 3: Progress & Reflection */}
            {currentStep === 3 && (
              <div className="p-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Reflect on your progress
                </h2>

                {/* Productivity & Focus Ratings */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Productivity: {formData.productivity}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.productivity}
                      onChange={(e) =>
                        handleInputChange(
                          "productivity",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Focus: {formData.focus}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.focus}
                      onChange={(e) =>
                        handleInputChange("focus", parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Main Progress */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Today's Progress *
                  </label>
                  <textarea
                    value={formData.progress}
                    onChange={(e) =>
                      handleInputChange("progress", e.target.value)
                    }
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="What did you accomplish today? What features did you build? What bugs did you fix?"
                    required
                  />
                </div>

                {/* Quick Wins */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🎉 Three Quick Wins Today
                  </label>
                  {formData.quickWins.map((win, index) => (
                    <input
                      key={index}
                      type="text"
                      value={win}
                      onChange={(e) =>
                        handleQuickWinChange(index, e.target.value)
                      }
                      placeholder={`Quick win #${index + 1}...`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                    />
                  ))}
                </div>

                {/* Daily Reflection Prompt */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <label className="block text-sm font-semibold text-purple-700 mb-3">
                    💭 Daily Reflection: {todaysPrompt.question}
                  </label>
                  <textarea
                    value={formData.reflectionAnswers[todaysPrompt.id] || ""}
                    onChange={(e) =>
                      handleInputChange("reflectionAnswers", {
                        ...formData.reflectionAnswers,
                        [todaysPrompt.id]: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="Take a moment to reflect..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Challenges, Learning & Code */}
            {currentStep === 4 && (
              <div className="p-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Challenges, learnings & code
                </h2>

                {/* Challenges */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🚧 Challenges & How You Solved Them
                  </label>
                  <textarea
                    value={formData.challenges}
                    onChange={(e) =>
                      handleInputChange("challenges", e.target.value)
                    }
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="What roadblocks did you hit? How did you overcome them? What resources helped?"
                  />
                </div>

                {/* Key Learnings */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💡 Key Learnings & Insights
                  </label>
                  <textarea
                    value={formData.learnings}
                    onChange={(e) =>
                      handleInputChange("learnings", e.target.value)
                    }
                    rows="4"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="What new concepts did you learn? What 'aha!' moments did you have?"
                  />
                </div>

                {/* Code Snippet */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💻 Code Snippet or Notes
                  </label>
                  <textarea
                    value={formData.codeSnippet}
                    onChange={(e) =>
                      handleInputChange("codeSnippet", e.target.value)
                    }
                    rows="6"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-50"
                    placeholder="Paste important code snippets, commands, or technical notes here..."
                  />
                </div>

                {/* Tomorrow's Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🎯 Tomorrow's Main Goal
                  </label>
                  <textarea
                    value={formData.tomorrowGoals}
                    onChange={(e) =>
                      handleInputChange("tomorrowGoals", e.target.value)
                    }
                    rows="3"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="What's the ONE main thing you want to accomplish tomorrow?"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="bg-gray-50 px-8 py-6 flex justify-between">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-300"
                >
                  🏠 Home
                </button>
                <button
                  type="button"
                  onClick={onViewDashboard}
                  className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-lg transition duration-300"
                >
                  📊 Dashboard
                </button>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-300"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition duration-300"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Complete Entry 🎉"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Auto-save indicator */}
        <div className="text-center mt-4 text-sm text-gray-500">
          💾 Auto-saving your progress...
        </div>
      </div>
    </div>
  );
}

export default JournalForm;
