import React from 'react';

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
          <div className="relative h-40 w-40 rounded-2xl overflow-hidden shadow-md select-none group-active:translate-y-1 transition-transform">
            {/* Star symbol fills the entire button */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
              className="absolute inset-0 w-full h-full transform scale-[0.60]"
            >
              <path
                d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"
                fill="url(#starGradient)"
              />
              <defs>
                <radialGradient
                  id="starGradient"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"
                >
                  <stop offset="0.067" stopColor="#9168C0" />
                  <stop offset="0.343" stopColor="#5684D1" />
                  <stop offset="0.672" stopColor="#1BA1E3" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer information */}
      <div className="absolute bottom-20 flex flex-col items-center text-sm text-neutral-500 gap-1">
        <p>Press the button to get started</p>
        {typeof window !== 'undefined' && window.geminiAPI?.port && (
          <p>Local API running on localhost:{window.geminiAPI.port}</p>
        )}
      </div>
    </div>
  );
}; 