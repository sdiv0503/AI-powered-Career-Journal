import React from 'react';
import { useNavigate } from 'react-router-dom';

function Hero({ onStartJournal }) {
  const navigate = useNavigate();

  const handleNavigateToAnalyzer = () => {
    navigate('/resume'); 
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Track Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Coding Journey
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Welcome to my AI-powered career journal! Log your daily coding progress, 
          get skill-gap feedback, and visualize your growth as a developer.
        </p>

        {/* Personal Introduction - Fixed Card with Dark Mode */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 mb-10 max-w-2xl mx-auto shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              DS
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Hi, I'm Divyansh! 👋</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            I'm a passionate developer building this career journal to track my coding progress 
            and skill development. Join me on this journey of continuous learning and growth!
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onStartJournal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Start My Journal 🚀
          </button>

          <button
            onClick={handleNavigateToAnalyzer}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          >
            AI Resume Analyzer 📄
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
