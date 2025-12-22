import React from 'react';
import { AppState, GeneratedSkill } from '../types';
import { downloadJson } from '../utils/videoUtils';

interface ResultViewProps {
  skillData: GeneratedSkill;
  setAppState: (state: AppState) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ skillData, setAppState }) => {
  const { skill } = skillData;

  return (
    <div className="max-w-6xl mx-auto w-full animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Skill Generated Successfully</h2>
          <p className="text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Ready for automation integration
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setAppState(AppState.IDLE)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Create New
          </button>
          <button 
            onClick={() => downloadJson(skill, `${skill.name}.json`)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Human Readable Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-primary-500">
            <h3 className="text-lg font-semibold text-white mb-1">{skill.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{skill.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 font-mono border border-slate-700">
                {skill.tool_software}
              </span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 font-mono border border-slate-700">
                {skill.estimated_duration}
              </span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Workflow Steps</h4>
            <div className="space-y-4">
              {skill.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-primary-400 border border-slate-700">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Parameters</h4>
             <div className="space-y-3">
              {(!skill.parameters || skill.parameters.length === 0) && <p className="text-slate-500 italic text-sm">No parameters detected</p>}
              {skill.parameters && skill.parameters.map((param, idx) => (
                <div key={idx} className="flex flex-col bg-slate-800/50 p-3 rounded border border-slate-700/50">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-accent-400 text-sm font-semibold">{param.name}</span>
                    <span className="text-xs text-slate-500 uppercase">{param.type}</span>
                  </div>
                  <p className="text-sm text-slate-400">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code/Schema View */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full">
            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">schema_definition.json</span>
              <span className="text-xs font-mono text-green-500">Valid JSON</span>
            </div>
            <div className="p-0 overflow-x-auto bg-[#0d1117] flex-grow">
              <pre className="text-xs sm:text-sm font-mono leading-relaxed p-6 text-slate-300">
                <code dangerouslySetInnerHTML={{ 
                  __html: JSON.stringify(skill, null, 2)
                    .replace(/"keys":/g, '<span class="text-purple-400">"keys":</span>')
                    .replace(/"string"/g, '<span class="text-green-400">"string"</span>')
                    .replace(/"number"/g, '<span class="text-orange-400">"number"</span>')
                }} />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;