import React from 'react';
import icon from '../../icon.png';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white select-none">
      <div className="absolute top-12 text-center flex flex-col items-center">
        <span className="px-3 py-1 text-xs rounded-full bg-neutral-800 border border-neutral-700 mb-4">
          Built for Gemini
        </span>
        <h1 className="text-5xl font-bold tracking-wider mb-3">gemiwin</h1>
        <p className="uppercase tracking-widest text-sm text-neutral-400">gemini-cli desktop app</p>
      </div>

      {/* Vintage keycap style */}
      <div className="relative mt-12">
        <div
          role="button"
          tabIndex={0}
          onClick={onContinue}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onContinue()}
          className="group cursor-pointer focus:outline-none"
        >
          {/* Side / base */}
          <div className="absolute inset-0 h-40 w-40 rounded-2xl bg-gray-200 translate-y-3 group-active:translate-y-1 transition-transform" />

          {/* Keycap */}
          <div className="relative h-40 w-40 rounded-2xl bg-white shadow-md flex items-center justify-center select-none group-active:translate-y-1 transition-transform">
            <img src={icon} alt="logo" className="h-20 w-20" />
          </div>
        </div>
      </div>

      <p className="absolute bottom-20 text-sm text-neutral-500">Press the button to get started</p>
    </div>
  );
}; 