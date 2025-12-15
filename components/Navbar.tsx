import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { playHoverSound } from '../utils/sound';

interface NavbarProps {
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onBack, onForward, canGoBack, canGoForward }) => {
  const [isSoundOn, setIsSoundOn] = useState(true);

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    // In a real app, this would toggle a global sound context or local storage preference
  };

  return (
    <nav className="sticky top-0 z-50 bg-white h-20 flex items-center border-b border-slate-100/50 shadow-sm">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Left Side: Back Button */}
        <button 
          onClick={onBack} 
          onMouseEnter={isSoundOn ? playHoverSound : undefined}
          disabled={!canGoBack}
          className={`
            w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 text-black
            ${canGoBack 
              ? 'bg-[#D9D9D9]/30 hover:bg-[#D9D9D9]/60 cursor-pointer' 
              : 'bg-[#D9D9D9]/10 cursor-default opacity-50'}
          `}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Right Side: Sound Toggle & Forward Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSound}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors mr-2"
            title={isSoundOn ? "Mute" : "Unmute"}
          >
            {isSoundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={onForward}
            onMouseEnter={isSoundOn ? playHoverSound : undefined}
            disabled={!canGoForward}
            className={`
              w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 text-black
              ${canGoForward 
                ? 'bg-[#D9D9D9]/30 hover:bg-[#D9D9D9]/60 cursor-pointer' 
                : 'bg-[#D9D9D9]/10 cursor-default opacity-50'}
            `}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};