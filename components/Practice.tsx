import React, { useState } from 'react';
import { QuestionCategory, Question } from '../types';
import { Info, Plus } from 'lucide-react';
import { playHoverSound } from '../utils/sound';

interface PracticeProps {
  category: QuestionCategory;
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
  onAddCustomQuestion: () => void;
}

export const Practice: React.FC<PracticeProps> = ({ category, questions, onSelectQuestion, onAddCustomQuestion }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Background', 'Situational', 'Technical', 'Custom'];

  const filteredQuestions = questions.filter(q => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Custom') return q.type === 'Custom question';
    return q.type === activeFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-xl font-normal text-slate-800">
          Click a question to begin, filter by type, add custom questions
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button 
              key={filter}
              onMouseEnter={playHoverSound}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium transition-colors border
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
              `}
            >
              {filter} 
              {filter === 'All' && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      {questions.length}
                  </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuestions.map((q) => (
          <div 
            key={q.id}
            onMouseEnter={playHoverSound}
            onClick={() => onSelectQuestion(q)}
            // Updated shadow to soft diffused shadow with ambient hover glow (Purple Tinted)
            className="group cursor-pointer bg-white p-6 rounded-2xl border border-transparent shadow-[0_10px_30px_rgba(90,85,120,0.15)] hover:shadow-[0_16px_40px_rgba(165,155,250,0.22)] transition-all h-full min-h-[160px] flex flex-col items-start"
          >
            <span className={`
              inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mb-4
              ${q.type === 'Background' ? 'bg-purple-100 text-purple-700' : 
                q.type === 'Technical' ? 'bg-emerald-100 text-emerald-700' : 
                q.type === 'Situational' ? 'bg-pink-100 text-pink-700' :
                'bg-yellow-100 text-yellow-800'}
            `}>
              <Info className="w-3 h-3 mr-1" />
              {q.type}
            </span>
            <h3 className="text-lg font-medium text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
              {q.text}
            </h3>
          </div>
        ))}
        
        {filteredQuestions.length === 0 && (
           <div className="col-span-full py-12 flex flex-col items-center justify-center">
              {activeFilter === 'Custom' ? (
                <button 
                  onMouseEnter={playHoverSound}
                  onClick={onAddCustomQuestion}
                  className="w-full max-w-md py-4 px-8 bg-blue-600 text-white text-xl font-medium rounded-[20px] hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
                >
                  {/* Removed small Plus icon here */}
                  + Add custom question
                </button>
              ) : (
                <div className="text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl p-8">
                   <p>No questions found for the "{activeFilter}" filter.</p>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};