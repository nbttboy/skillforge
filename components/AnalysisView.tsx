import React, { useState, useEffect, useRef } from 'react';
import { AppState, GeneratedSkill } from '../types';
import { generateSkillFromVideo } from '../services/geminiService';
import { blobToBase64 } from '../utils/videoUtils';

interface AnalysisViewProps {
  videoBlob: Blob | null; // Note: Despite name, can be any supported media blob
  setAppState: (state: AppState) => void;
  onAnalysisComplete: (result: GeneratedSkill) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ videoBlob, setAppState, onAnalysisComplete }) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  
  const isVideo = videoBlob?.type.startsWith('video/');
  const isImage = videoBlob?.type.startsWith('image/');
  const isPdf = videoBlob?.type === 'application/pdf';

  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  const handleAnalyze = async () => {
    if (!videoBlob) return;
    setIsProcessing(true);
    setAppState(AppState.ANALYZING);

    try {
      const base64 = await blobToBase64(videoBlob);
      const result = await generateSkillFromVideo(base64, videoBlob.type, notes);
      onAnalysisComplete(result);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!videoBlob) return null;

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Media Preview */}
        <div className="space-y-4">
          <div className="glass-panel p-2 rounded-xl flex items-center justify-center min-h-[300px] bg-slate-900/50">
            {isVideo && (
              <video 
                src={mediaUrl || ""} 
                controls 
                className="w-full rounded-lg max-h-[500px] object-contain"
              />
            )}
            {isImage && (
               <img 
                 src={mediaUrl || ""} 
                 className="w-full rounded-lg max-h-[500px] object-contain"
                 alt="Preview"
               />
            )}
            {isPdf && (
              <div className="flex flex-col items-center gap-4 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="font-semibold text-lg">PDF Document Uploaded</span>
                <span className="text-sm text-slate-500">{(videoBlob.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
            {!isVideo && !isImage && !isPdf && (
              <div className="text-slate-400">Preview not available for this file type</div>
            )}
          </div>
          <div className="flex justify-between items-center text-sm text-slate-400 font-mono">
            <span>{(videoBlob.size / (1024 * 1024)).toFixed(2)} MB</span>
            <span>{videoBlob.type}</span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Review & Analyze</h3>
            <p className="text-slate-400">
              Add any specific notes to help the AI understand complex steps, specific logic, or context about the uploaded file.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Context Notes (Optional)</label>
            <textarea
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none h-32"
              placeholder="e.g., 'This PDF explains the new vacation policy...', or 'This screenshot shows the error message...'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setAppState(AppState.IDLE)}
              className="flex-1 px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
            >
              Discard
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                  Generate Skill
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;