import React, { useState } from 'react';
import { Info, Edit2, ChevronDown } from 'lucide-react';
import { playHoverSound } from '../utils/sound';

interface CustomQuestionInputProps {
  onAdd: (questionText: string) => void;
}

export const CustomQuestionInput: React.FC<CustomQuestionInputProps> = ({ onAdd }) => {
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Updated shadow with Purple Tint */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(90,85,120,0.15)]">
        <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium mb-6">
          <Info className="w-3 h-3 mr-2" />
          Custom question
        </span>

        <div className="relative mb-8 flex items-center">
            {/* Input with white bg and black text, no blue focus ring */}
            <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question here"
            className="w-full text-2xl md:text-3xl font-medium text-black placeholder:text-slate-300 border border-black focus:border-black focus:ring-0 focus:outline-none p-4 rounded-xl bg-white"
            autoFocus
            />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Edit2 className="w-6 h-6 text-slate-400" />
            </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mb-8">
          <div className="flex items-center justify-between text-slate-800 mb-4">
            <div className="flex items-center text-lg font-medium">
               <ChevronDown className="w-5 h-5 mr-3" />
               Your answer
            </div>
          </div>
          
          {/* Textarea with white bg, black text, icon inside, and no blue focus ring */}
          <div className="relative">
            <textarea
               value={answerText}
               onChange={(e) => setAnswerText(e.target.value)}
               className="w-full min-h-[120px] bg-white rounded-xl p-4 border border-slate-200 resize-none focus:outline-none focus:border-slate-400 text-black placeholder:text-slate-400 pr-10"
               placeholder="Type your answer here..."
            />
            <div className="absolute top-4 right-4 pointer-events-none text-blue-500">
               <Edit2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <button
          onMouseEnter={playHoverSound}
          onClick={() => onAdd(questionText)}
          disabled={!questionText.trim()}
          className="px-10 py-3 bg-blue-600 text-white font-semibold rounded-[20px] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
};