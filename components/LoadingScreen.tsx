import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Analyzing Video Stream</h2>
      <p className="text-slate-400 text-center max-w-md">
        Gemini is processing your screen recording, identifying UI elements, and abstracting the logic into a skill definition...
      </p>
      
      <div className="mt-8 flex gap-2">
        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 animate-[loading_1.5s_ease-in-out_0.2s_infinite]"></div>
        </div>
        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 animate-[loading_1.5s_ease-in-out_0.4s_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
