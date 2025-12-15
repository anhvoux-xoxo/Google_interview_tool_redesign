import React from 'react';
import { QuestionCategory, Question } from '../types';
import { Info } from 'lucide-react';
import { playHoverSound } from '../utils/sound';

interface PracticeProps {
  category: QuestionCategory;
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
}

export const Practice: React.FC<PracticeProps> = ({ category, questions, onSelectQuestion }) => {
  const filters = ['All', 'Background', 'Situational', 'Technical', 'Custom question'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-xl font-normal text-slate-800">
          Click a question to begin, filter by type, add custom questions
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {filters.map((filter, idx) => (
          <button 
            key={filter}
            onMouseEnter={playHoverSound}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-colors border
              ${idx === 0 
                ? 'bg-blue-600 text-black border-blue-600' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
            `}
            style={idx === 0 ? { color: 'black' } : {}}
          >
            {filter} 
            {idx === 0 && (
                <span className="ml-2 bg-white text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                    50
                </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.map((q) => (
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
              {q.type} question
            </span>
            <h3 className="text-lg font-medium text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
              {q.text}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};