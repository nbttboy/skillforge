import React, { useState, useEffect } from 'react';
import { AppState, GeneratedSkill } from './types';
import Recorder from './components/Recorder';
import AnalysisView from './components/AnalysisView';
import ResultView from './components/ResultView';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [generatedSkill, setGeneratedSkill] = useState<GeneratedSkill | null>(null);
  const [history, setHistory] = useState<GeneratedSkill[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('skillforge_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('skillforge_history', JSON.stringify(history));
  }, [history]);

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setAppState(AppState.PREVIEW);
  };

  const handleAnalysisComplete = (skill: GeneratedSkill) => {
    setGeneratedSkill(skill);
    // Add to history
    setHistory(prev => [skill, ...prev]);
    setAppState(AppState.SUCCESS);
  };

  const handleHistorySelect = (skill: GeneratedSkill) => {
    setGeneratedSkill(skill);
    setAppState(AppState.SUCCESS);
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateSkill = (updatedSkill: GeneratedSkill) => {
    setGeneratedSkill(updatedSkill);
    setHistory(prev => prev.map(item => item.id === updatedSkill.id ? updatedSkill : item));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-900/10 rounded-full blur-[128px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-slate-950/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => setAppState(AppState.IDLE)} style={{cursor: 'pointer'}}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SkillForge</span>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${appState === AppState.RECORDING ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-slate-800 bg-slate-900/50 text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${appState === AppState.RECORDING ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
              {appState === AppState.RECORDING ? 'Recording Active' : 'System Ready'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-64px)]">
        
        {/* Error Notification */}
        {appState === AppState.ERROR && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4 text-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="font-bold">Analysis Failed</p>
              <p className="text-sm opacity-80">Could not generate skill from video. Please try a shorter recording or ensure the video content is clear.</p>
            </div>
            <button onClick={() => setAppState(AppState.PREVIEW)} className="ml-auto hover:bg-red-500/20 px-3 py-1 rounded">Dismiss</button>
          </div>
        )}

        {/* View Router */}
        <div className="flex-grow flex flex-col items-center justify-center">
          
          {(appState === AppState.IDLE || appState === AppState.RECORDING) && (
            <Recorder 
              appState={appState} 
              setAppState={setAppState} 
              onRecordingComplete={handleRecordingComplete}
              history={history}
              onSelectHistory={handleHistorySelect}
              onDeleteHistory={handleHistoryDelete}
            />
          )}

          {appState === AppState.PREVIEW && (
            <AnalysisView 
              videoBlob={recordedBlob}
              setAppState={setAppState}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {appState === AppState.ANALYZING && (
            <LoadingScreen />
          )}

          {appState === AppState.SUCCESS && generatedSkill && (
            <ResultView 
              skillData={generatedSkill}
              setAppState={setAppState}
              onUpdateSkill={handleUpdateSkill}
            />
          )}

        </div>
      </main>
    </div>
  );
}

export default App;