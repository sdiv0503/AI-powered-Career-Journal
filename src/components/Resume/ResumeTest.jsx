// src/components/Resume/ResumeTest.jsx
import React from 'react';

const ResumeTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          🎉 Resume Analyzer is Working!
        </h1>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">
            Congratulations! Your resume analyzer route is now accessible.
          </p>
          <p className="text-gray-500">
            You can now see the Phase 4 components are properly integrated.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTest;
