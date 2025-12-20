import React from 'react';
import { QuestionCategory } from '../types';
import { playHoverSound } from '../utils/sound';

interface FieldSelectionProps {
  onSelectCategory: (category: QuestionCategory) => void;
  selectedCategory: QuestionCategory | null;
}

export const FieldSelection: React.FC<FieldSelectionProps> = ({ 
  onSelectCategory, 
  selectedCategory 
}) => {
  const categories = Object.values(QuestionCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
      <h1 className="text-3xl font-bold text-center text-slate-900 mb-12">
        What field do you want to practice for?
      </h1>

      <div className="space-y-6">
        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onMouseEnter={playHoverSound}
              onClick={() => onSelectCategory(cat)}
              className={`
                w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 transform active:scale-[0.99]
                ${selectedCategory === cat 
                  ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-[0_10px_30px_rgba(37,99,235,0.1)]' 
                  : 'bg-white border-transparent text-slate-800 shadow-[0_10px_30px_rgba(90,85,120,0.15)] hover:border-blue-400 hover:text-blue-600 hover:shadow-[0_16px_40px_rgba(165,155,250,0.22)]'}
              `}
            >
              <span className="text-lg font-semibold">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
