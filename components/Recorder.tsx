import React, { useState, useRef, useEffect } from 'react';
import { AppState, GeneratedSkill } from '../types';

interface RecorderProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  onRecordingComplete: (blob: Blob) => void;
  history: GeneratedSkill[];
  onSelectHistory: (skill: GeneratedSkill) => void;
  onDeleteHistory: (id: string) => void;
}

const Recorder: React.FC<RecorderProps> = ({ 
  appState, 
  setAppState, 
  onRecordingComplete,
  history,
  onSelectHistory,
  onDeleteHistory
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appState === AppState.RECORDING) {
      setTimer(0);
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [appState]);

  const startCapture = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor", // or "window", "browser"
        },
        audio: true // Optional: capture system audio if useful for analysis
      });

      setStream(displayStream);
      
      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
        ? 'video/webm; codecs=vp9' 
        : 'video/webm';
        
      const recorder = new MediaRecorder(displayStream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: mimeType });
        onRecordingComplete(fullBlob);
        
        // Stop all tracks to release "sharing" indicator
        displayStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      // Handle user clicking "Stop Sharing" on browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };

      recorder.start();
      setAppState(AppState.RECORDING);

    } catch (err) {
      console.error("Error starting screen capture:", err);
      // Check if it's a permission error or cancellation
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        // User cancelled or permission denied
        return; 
      }
      alert("Could not start screen recording. Please check permissions.");
    }
  };

  const stopCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setAppState(AppState.PREVIEW);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pass the file directly as a Blob
      onRecordingComplete(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(ts));
  };

  if (appState === AppState.RECORDING) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-pulse">
        <div className="glass-panel px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl border-red-500/30 border">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-mono font-bold tracking-widest">{formatTime(timer)}</span>
          </div>
          <div className="h-8 w-px bg-slate-700/50" />
          <button 
            onClick={stopCapture}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            Stop Recording
          </button>
        </div>
      </div>
    );
  }

  // Hero / Start State
  if (appState === AppState.IDLE) {
    return (
      <div className="flex flex-col items-center justify-center py-10 w-full max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Main CTA */}
        <div className="text-center space-y-8 flex flex-col items-center">
          
          <div className="space-y-4 max-w-2xl mb-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Turn Actions into Skills
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Record your screen, or upload a video, PDF, or long screenshot. We'll generate a reusable automation skill definition instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Record Button */}
            <div className="relative group cursor-pointer" onClick={startCapture}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <button className="relative bg-slate-900 border border-slate-700 hover:border-primary-500/50 text-white w-48 h-16 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-2xl flex items-center justify-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-semibold text-lg">Record Screen</span>
              </button>
            </div>

            <span className="text-slate-500 font-mono text-sm">OR</span>

            {/* Upload Button */}
            <div 
              className="relative group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/*,image/*,application/pdf"
                onChange={handleFileUpload}
              />
              <div className="absolute inset-0 bg-slate-800 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <button className="relative bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-500 text-slate-300 w-48 h-16 rounded-full transition-all duration-300 flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="font-semibold text-lg">Upload File</span>
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 font-mono">Supports: Video, Images (Long Screenshots), PDF</p>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="w-full space-y-4">
             <div className="flex items-center gap-2 mb-4">
               <div className="h-px bg-slate-800 flex-grow"></div>
               <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Recent Skills</span>
               <div className="h-px bg-slate-800 flex-grow"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {history.map((skill) => (
                 <div 
                  key={skill.id}
                  className="glass-panel p-5 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer group relative border border-slate-800 hover:border-slate-600"
                  onClick={() => onSelectHistory(skill)}
                 >
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Delete this skill?')) onDeleteHistory(skill.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.55 5.521 2.828 9.15a.75.75 0 0 0 1.44-.44l-2.829-9.15a.75.75 0 0 0-1.44.44ZM11.25 8.5a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75Zm3.352 1.25a.75.75 0 0 0-1.44-.44l-2.829 9.15a.75.75 0 0 0 1.44.44l2.829-9.15Z" clipRule="evenodd" />
                        </svg>
                      </button>
                   </div>
                   
                   <div className="flex flex-col h-full">
                     <div className="mb-2">
                       <h3 className="font-bold text-white text-lg truncate pr-8">{skill.skillPackage.frontmatter.name}</h3>
                       <p className="text-xs text-slate-500 font-mono">{formatDate(skill.createdAt)}</p>
                     </div>
                     <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-grow">
                       {skill.skillPackage.frontmatter.description}
                     </p>
                     <div className="flex items-center gap-2 mt-auto">
                        <span className="text-xs font-mono text-primary-400 bg-primary-900/20 px-2 py-1 rounded">
                          {skill.skillPackage.slug}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {skill.skillPackage.resources.length + 1} files
                        </span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

      </div>
    );
  }

  return null;
};

export default Recorder;