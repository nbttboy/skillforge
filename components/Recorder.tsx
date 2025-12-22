import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';

interface RecorderProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  onRecordingComplete: (blob: Blob) => void;
}

const Recorder: React.FC<RecorderProps> = ({ appState, setAppState, onRecordingComplete }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
        <div className="relative group cursor-pointer" onClick={startCapture}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <button className="relative bg-slate-900 border border-slate-700 hover:border-primary-500/50 text-white p-12 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-primary-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Turn Actions into Skills
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Perform your task naturally. We'll record it, analyze the workflow with Gemini AI, and generate a reusable automation skill definition instantly.
          </p>
        </div>

        <div className="flex gap-4 text-sm text-slate-500 font-mono mt-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
            <span>Screen Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span>Workflow Extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>JSON Generation</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Recorder;