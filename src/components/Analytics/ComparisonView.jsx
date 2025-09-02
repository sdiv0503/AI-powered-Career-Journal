import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import Highlighter from 'react-highlight-words';
import { diffLines, diffWords } from 'diff';

const ComparisonView = ({ analyzedResumes }) => {
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [availableResumes, setAvailableResumes] = useState(analyzedResumes || []);
  const [comparisonMode, setComparisonMode] = useState('skills');

  // Custom Diff Viewer Component (React 19 Compatible)
  const CustomDiffViewer = ({ oldText, newText, title1, title2 }) => {
    const diffResult = useMemo(() => {
      const lines = diffLines(oldText || '', newText || '');
      return lines.map((line, index) => ({
        id: index,
        type: line.added ? 'added' : line.removed ? 'removed' : 'unchanged',
        content: line.value,
        count: line.count
      }));
    }, [oldText, newText]);

    return (
      <div className="diff-viewer border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
          <div className="px-4 py-2 font-medium text-gray-700 border-r border-gray-200">
            {title1}
          </div>
          <div className="px-4 py-2 font-medium text-gray-700">
            {title2}
          </div>
        </div>

        {/* Diff Content */}
        <div className="grid grid-cols-2 max-h-96 overflow-auto">
          <div className="border-r border-gray-200">
            {diffResult.map((line, index) => (
              <div
                key={index}
                className={`px-4 py-1 text-sm font-mono ${
                  line.type === 'removed' ? 'bg-red-50 text-red-800' :
                  line.type === 'unchanged' ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <span className="inline-block w-8 text-gray-400 select-none">
                  {index + 1}
                </span>
                <span className={line.type === 'removed' ? 'bg-red-100' : ''}>
                  {line.content.split('\n')[0]}
                </span>
              </div>
            ))}
          </div>
          <div>
            {diffResult.map((line, index) => (
              <div
                key={index}
                className={`px-4 py-1 text-sm font-mono ${
                  line.type === 'added' ? 'bg-green-50 text-green-800' :
                  line.type === 'unchanged' ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <span className="inline-block w-8 text-gray-400 select-none">
                  {index + 1}
                </span>
                <span className={line.type === 'added' ? 'bg-green-100' : ''}>
                  {line.content.split('\n')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    
    if (!destination) return;

    if (source.droppableId === 'available' && destination.droppableId === 'selected') {
      if (selectedResumes.length >= 3) return;
      
      const resume = availableResumes[source.index];
      if (selectedResumes.find(r => r.id === resume.id)) return;
      
      const newAvailable = [...availableResumes];
      const newSelected = [...selectedResumes];
      
      newAvailable.splice(source.index, 1);
      newSelected.splice(destination.index, 0, resume);
      
      setAvailableResumes(newAvailable);
      setSelectedResumes(newSelected);
    } else if (source.droppableId === 'selected' && destination.droppableId === 'available') {
      const resume = selectedResumes[source.index];
      const newSelected = [...selectedResumes];
      const newAvailable = [...availableResumes];
      
      newSelected.splice(source.index, 1);
      newAvailable.splice(destination.index, 0, resume);
      
      setSelectedResumes(newSelected);
      setAvailableResumes(newAvailable);
    } else if (source.droppableId === destination.droppableId) {
      const list = source.droppableId === 'available' ? availableResumes : selectedResumes;
      const setList = source.droppableId === 'available' ? setAvailableResumes : setSelectedResumes;
      
      const newList = [...list];
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);
      
      setList(newList);
    }
  };

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (selectedResumes.length < 2) return null;

    return selectedResumes.map((resume, index) => {
      const analysis = resume.analysis;
      const previousResume = index > 0 ? selectedResumes[index - 1] : null;
      
      const improvements = previousResume ? {
        skillsGained: analysis.skillAnalysis.totalSkills - previousResume.analysis.skillAnalysis.totalSkills,
        qualityImprovement: (analysis.qualityMetrics?.overallScore || 0) - (previousResume.analysis.qualityMetrics?.overallScore || 0),
        expertSkillsGained: (analysis.skillAnalysis.expertSkills || 0) - (previousResume.analysis.skillAnalysis.expertSkills || 0)
      } : null;

      return {
        resume,
        improvements,
        timeline: new Date(resume.analyzedAt)
      };
    });
  }, [selectedResumes]);

  const ResumeCard = ({ resume, index, isDragging, droppableId }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg border-2 transition-all ${
        isDragging 
          ? 'shadow-lg scale-105 border-blue-300 bg-blue-50' 
          : 'hover:shadow-md border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 truncate">{resume.fileName}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(resume.analyzedAt).toLocaleDateString()}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {resume.analysis.skillAnalysis.totalSkills} skills
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {resume.analysis.qualityMetrics?.overallScore || Math.round(resume.analysis.confidence * 100)}% quality
            </span>
          </div>
        </div>
        
        {droppableId === 'selected' && (
          <button
            onClick={() => {
              const newSelected = selectedResumes.filter(r => r.id !== resume.id);
              setSelectedResumes(newSelected);
              setAvailableResumes([...availableResumes, resume]);
            }}
            className="ml-2 text-red-400 hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );

  const SkillsComparison = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {selectedResumes.map((resume, index) => (
        <motion.div
          key={resume.id}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <h4 className="font-bold text-gray-900 mb-4 truncate">{resume.fileName}</h4>
          
          {/* Skills Overview */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {resume.analysis.skillAnalysis.totalSkills}
              </div>
              <div className="text-xs text-blue-700">Total Skills</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {resume.analysis.skillAnalysis.expertSkills || 0}
              </div>
              <div className="text-xs text-purple-700">Expert Level</div>
            </div>
          </div>

          {/* Top Skills */}
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Top Skills</h5>
            <div className="space-y-1">
              {resume.analysis.skillAnalysis.topSkills?.slice(0, 5).map((skill, skillIndex) => (
                <div key={skillIndex} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{skill.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                    skill.level === 'Proficient' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {skill.level || 'Detected'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Indicators */}
          {comparisonMetrics?.[index]?.improvements && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-700 mb-2">Changes from Previous</h5>
              <div className="space-y-1 text-sm">
                <div className={`flex items-center justify-between ${
                  comparisonMetrics[index].improvements.skillsGained >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>Skills</span>
                  <span>{comparisonMetrics[index].improvements.skillsGained >= 0 ? '+' : ''}{comparisonMetrics[index].improvements.skillsGained}</span>
                </div>
                <div className={`flex items-center justify-between ${
                  comparisonMetrics[index].improvements.qualityImprovement >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>Quality</span>
                  <span>{comparisonMetrics[index].improvements.qualityImprovement >= 0 ? '+' : ''}{Math.round(comparisonMetrics[index].improvements.qualityImprovement)}%</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const ContentComparison = () => {
    if (selectedResumes.length !== 2) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
          <p className="text-gray-500">Select exactly 2 resumes to see content comparison</p>
        </div>
      );
    }

    const [resume1, resume2] = selectedResumes;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-gray-900">Content Comparison</h4>
          <div className="text-sm text-gray-500">
            {resume1.fileName} ↔ {resume2.fileName}
          </div>
        </div>
        
        <CustomDiffViewer
          oldText={resume1.analysis.rawText || 'Content not available'}
          newText={resume2.analysis.rawText || 'Content not available'}
          title1={resume1.fileName}
          title2={resume2.fileName}
        />
      </div>
    );
  };

  const renderComparisonContent = () => {
    if (selectedResumes.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Ready for Comparison Analysis
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Drag resumes from the available list to the comparison area to start analyzing differences.
          </p>
        </div>
      );
    }

    switch (comparisonMode) {
      case 'skills':
        return <SkillsComparison />;
      case 'content':
        return <ContentComparison />;
      default:
        return <SkillsComparison />;
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔄 Multi-Resume Comparison Tool
        </h2>
        <p className="text-gray-600">
          Drag and drop resumes to analyze improvements and skill changes side by side.
        </p>
      </div>

      {/* Drag and Drop Interface */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Resumes */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📋 Available Resumes ({availableResumes.length})
            </h3>
            <Droppable droppableId="available">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-32 p-4 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <AnimatePresence>
                    {availableResumes.map((resume, index) => (
                      <Draggable key={resume.id} draggableId={`available-${resume.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ResumeCard 
                              resume={resume} 
                              index={index} 
                              isDragging={snapshot.isDragging}
                              droppableId="available"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                  {availableResumes.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      All resumes selected for comparison
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Selected for Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🔍 Compare Resumes ({selectedResumes.length}/3)
            </h3>
            <Droppable droppableId="selected">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-32 p-4 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <AnimatePresence>
                    {selectedResumes.map((resume, index) => (
                      <Draggable key={resume.id} draggableId={`selected-${resume.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ResumeCard 
                              resume={resume} 
                              index={index} 
                              isDragging={snapshot.isDragging}
                              droppableId="selected"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                  {selectedResumes.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">👆</div>
                      <p className="font-medium">Drag resumes here to compare</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* Comparison Results */}
      {selectedResumes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">📊 Comparison Analysis</h3>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setComparisonMode('skills')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  comparisonMode === 'skills'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                💼 Skills
              </button>
              <button
                onClick={() => setComparisonMode('content')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  comparisonMode === 'content'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📝 Content
              </button>
            </div>
          </div>

          {renderComparisonContent()}
        </div>
      )}
    </motion.div>
  );
};

export default ComparisonView;
