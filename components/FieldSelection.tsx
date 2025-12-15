import React, { useRef, useEffect } from 'react';
import { QuestionCategory } from '../types';
import { ArrowRight } from 'lucide-react';
import { playHoverSound } from '../utils/sound';

interface FieldSelectionProps {
  onSelectCategory: (category: QuestionCategory) => void;
  onStartPractice: () => void;
  onSeeAllQuestions: () => void;
  selectedCategory: QuestionCategory | null;
}

export const FieldSelection: React.FC<FieldSelectionProps> = ({ 
  onSelectCategory, 
  onStartPractice, 
  onSeeAllQuestions,
  selectedCategory 
}) => {
  const categories = Object.values(QuestionCategory);
  const startSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== QuestionCategory.CUSTOM && startSectionRef.current) {
      // Scroll to the top of the start section
      startSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

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
              // Updated soft shadows with ambient glow hover using purple tints
              className={`
                w-full text-left p-6 rounded-2xl border transition-all duration-200
                ${selectedCategory === cat 
                  ? 'bg-white border-blue-200 shadow-[0_10px_30px_rgba(90,85,120,0.15)] ring-1 ring-blue-100' 
                  : 'bg-white border-transparent shadow-[0_10px_30px_rgba(90,85,120,0.15)] hover:shadow-[0_16px_40px_rgba(165,155,250,0.22)]'}
              `}
            >
              <span className={`text-lg font-medium ${selectedCategory === cat ? 'text-blue-700' : 'text-slate-800'}`}>
                {cat}
              </span>
            </button>
          ))}
        </div>

        {/* Revealed Section - Only show if selected category is NOT custom */}
        {selectedCategory && selectedCategory !== QuestionCategory.CUSTOM && (
          <div 
            ref={startSectionRef}
            className="mt-8 min-h-[90vh] flex flex-col justify-center animate-fade-in-up" 
          >
            {/* Start Card with new Shadow - Centered */}
            <div className="bg-white rounded-3xl p-12 border border-white shadow-[0_10px_30px_rgba(90,85,120,0.15)] mb-6 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8 text-center">
                Practice with 5 interview questions
              </h2>
              
              {/* Long button design: w-full max-w-md py-4 */}
              <button 
                onMouseEnter={playHoverSound}
                onClick={onStartPractice}
                className="w-full max-w-md py-4 px-8 bg-blue-600 text-white text-xl font-medium rounded-[20px] hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
              >
                Start
                <ArrowRight className="w-6 h-6 ml-2" />
              </button>
            </div>
            
            <div className="flex justify-center">
                <button 
                  onMouseEnter={playHoverSound}
                  onClick={onSeeAllQuestions}
                  className="w-full max-w-md px-6 py-4 text-slate-800 font-semibold text-base rounded-[20px] transition-all bg-white hover:shadow-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.34)' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.77)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.34)')}
                  onMouseDown={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,1)')}
                  onMouseUp={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.77)')}
                >
                  See all the questions
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};