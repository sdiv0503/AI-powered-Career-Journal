import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

const DraggableSkillList = ({ skills, onReorder, title = "Prioritize Your Skills" }) => {
  const [skillList, setSkillList] = useState(skills || []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(skillList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSkillList(items);
    if (onReorder) onReorder(items);
  };

  const getSkillColor = (skill) => {
    if (skill.confidence > 0.8) return 'bg-green-100 border-green-300 text-green-800';
    if (skill.confidence > 0.6) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Drag to reorder by importance
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="skills">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 p-4 rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
              }`}
            >
              {skillList.map((skill, index) => (
                <Draggable key={skill.name} draggableId={skill.name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 rounded-lg border-2 cursor-move transition-all ${
                        snapshot.isDragging 
                          ? 'shadow-lg scale-105 rotate-1' 
                          : 'hover:shadow-md'
                      } ${getSkillColor(skill)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-xs opacity-75">
                              {skill.level} • {skill.matches} mentions
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {Math.round(skill.confidence * 100)}%
                            </div>
                            <div className="text-xs opacity-75">confidence</div>
                          </div>
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        💡 <strong>Pro tip:</strong> Drag skills to prioritize them for your career goals. 
        Higher priority skills will be emphasized in recommendations.
      </div>
    </motion.div>
  );
};

export default DraggableSkillList;
