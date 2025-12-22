import React, { useState, useEffect } from 'react';
import { AppState, GeneratedSkill, SkillFile, SkillPackage } from '../types';
import { createSkillZip, downloadBlob } from '../utils/zipUtils';

interface ResultViewProps {
  skillData: GeneratedSkill;
  setAppState: (state: AppState) => void;
  onUpdateSkill?: (updatedSkill: GeneratedSkill) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ skillData, setAppState, onUpdateSkill }) => {
  const { skillPackage } = skillData;
  const [activeFile, setActiveFile] = useState<string>('SKILL.md');
  const [editedPackage, setEditedPackage] = useState<SkillPackage>(skillPackage);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setEditedPackage(skillData.skillPackage);
    setHasUnsavedChanges(false);
  }, [skillData]);

  // Helper to get current content
  const getCurrentContent = () => {
    if (activeFile === 'SKILL.md') {
      return `---
name: ${editedPackage.frontmatter.name}
description: ${editedPackage.frontmatter.description}
---

${editedPackage.body}`;
    }
    return editedPackage.resources.find(f => f.filename === activeFile)?.content || "";
  };

  const handleContentChange = (newContent: string) => {
    setHasUnsavedChanges(true);
    const newPackage = { ...editedPackage };

    if (activeFile === 'SKILL.md') {
      // For SKILL.md, let's allow editing the Body ONLY in the text area to prevent frontmatter corruption.
      newPackage.body = newContent;
    } else {
      const resIndex = newPackage.resources.findIndex(f => f.filename === activeFile);
      if (resIndex !== -1) {
        newPackage.resources[resIndex] = {
          ...newPackage.resources[resIndex],
          content: newContent
        };
      }
    }
    setEditedPackage(newPackage);
  };
  
  const handleSave = () => {
    if (onUpdateSkill) {
      onUpdateSkill({
        ...skillData,
        skillPackage: editedPackage
      });
      setHasUnsavedChanges(false);
    }
  };

  const handleDownload = async () => {
    // Save first if needed
    if (hasUnsavedChanges) handleSave();
    const blob = await createSkillZip(editedPackage);
    // Changed extension from .skill to .zip
    downloadBlob(blob, `${editedPackage.slug}.zip`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-in slide-in-from-bottom-10 duration-700 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             {/* Allow name editing? For now just display */}
            {editedPackage.frontmatter.name}
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
              {editedPackage.slug}
            </span>
            {hasUnsavedChanges && (
                <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Unsaved Changes</span>
            )}
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl line-clamp-2">
            {editedPackage.frontmatter.description}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setAppState(AppState.IDLE)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Back to Home
          </button>
          
          {hasUnsavedChanges && (
            <button 
                onClick={handleSave}
                className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium"
            >
                Save Changes
            </button>
          )}

          <button 
            onClick={handleDownload}
            className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            Download Package (.zip)
          </button>
        </div>
      </div>

      {/* IDE Layout */}
      <div className="flex-grow flex gap-6 overflow-hidden min-h-0">
        
        {/* Sidebar: File Explorer */}
        <div className="w-64 flex-shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explorer</span>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto flex-grow scrollbar-hide">
            
            {/* Root Files */}
            <div 
              onClick={() => setActiveFile('SKILL.md')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-mono transition-colors ${activeFile === 'SKILL.md' ? 'bg-primary-500/20 text-primary-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-500">
                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
              SKILL.md
            </div>

            {/* Helper Functions to render file lists */}
            {['script', 'reference', 'asset'].map(type => {
              const files = editedPackage.resources.filter(r => r.type === type);
              if (files.length === 0) return null;
              
              const folderName = type === 'script' ? 'scripts' : type === 'reference' ? 'references' : 'assets';
              const folderIcon = type === 'script' ? 'text-yellow-500' : type === 'reference' ? 'text-blue-500' : 'text-green-500';

              return (
                <div key={type} className="mt-4">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-500 uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 ${folderIcon}`}>
                      <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75ZM3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75Z" />
                    </svg>
                    {folderName}
                  </div>
                  {files.map((file, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveFile(file.filename)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-mono transition-colors ml-2 border-l border-slate-800 ${activeFile === file.filename ? 'bg-primary-500/20 text-primary-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                      <span>{file.filename}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-grow glass-panel rounded-xl overflow-hidden flex flex-col min-w-0">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <span className="text-sm font-mono text-slate-300">{activeFile}</span>
                 {activeFile === 'SKILL.md' && <span className="text-[10px] text-slate-500 uppercase tracking-wide bg-slate-800 px-1.5 py-0.5 rounded">Body Only</span>}
            </div>
            
            <span className="text-xs text-slate-500">
              {activeFile === 'SKILL.md' ? 'MARKDOWN' : activeFile.split('.').pop()?.toUpperCase() || 'TEXT'}
            </span>
          </div>
          
          <div className="flex-grow bg-[#0d1117] flex flex-col">
            {activeFile === 'SKILL.md' ? (
                // For SKILL.md, we allow editing just the body to be safe
                <textarea 
                    className="flex-grow bg-transparent p-6 text-sm font-mono leading-relaxed text-slate-300 resize-none focus:outline-none"
                    value={editedPackage.body}
                    onChange={(e) => handleContentChange(e.target.value)}
                    spellCheck={false}
                />
            ) : (
                // For other files, full edit
                <textarea 
                    className="flex-grow bg-transparent p-6 text-sm font-mono leading-relaxed text-slate-300 resize-none focus:outline-none"
                    value={getCurrentContent()}
                    onChange={(e) => handleContentChange(e.target.value)}
                    spellCheck={false}
                />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultView;