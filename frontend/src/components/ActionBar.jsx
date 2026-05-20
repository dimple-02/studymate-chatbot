import React, { useState, useRef } from 'react';
import { MicrophoneStage, FileText, MagicWand, Spinner, UploadSimple, BookOpenText, X } from '@phosphor-icons/react';

export default function ActionBar({ onVivaMode, onSimplifyNotes, onSimplifyFile, onGenerateStudyGuide, onGenerateStudyGuideFile, disabled }) {
  const [notesInput, setNotesInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVivaLoading, setIsVivaLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleVivaClick = () => {
    setIsVivaLoading(true);
    onVivaMode(() => setIsVivaLoading(false));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    e.target.value = ''; // Reset input
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleSimplifyClick = () => {
    if (selectedFile) {
      onSimplifyFile(selectedFile);
      setSelectedFile(null);
    } else if (notesInput.trim()) {
      onSimplifyNotes(notesInput);
      setNotesInput('');
    }
  };

  const handleStudyGuideClick = () => {
    if (selectedFile) {
      onGenerateStudyGuideFile(selectedFile);
      setSelectedFile(null);
    } else if (notesInput.trim()) {
      onGenerateStudyGuide(notesInput);
      setNotesInput('');
    }
  };

  return (
    <section className="action-bar">
      <button 
        className="viva-btn glass-btn" 
        onClick={handleVivaClick}
        style={isVivaLoading ? { background: 'var(--danger)', color: 'white' } : {}}
        disabled={isVivaLoading || disabled}
      >
        {isVivaLoading ? (
          <><Spinner weight="regular" size={20} className="ph-spin" /> Listening...</>
        ) : (
          <><MicrophoneStage weight="regular" size={20} /> Viva Mode</>
        )}
      </button>
      <div className="notes-simplifier">
        {selectedFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--primary-accent)', background: 'var(--glass-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            <span className="truncate" style={{ maxWidth: '150px' }}>📄 {selectedFile.name}</span>
            <button className="icon-btn" onClick={handleClearFile} style={{ width: '20px', height: '20px', background: 'var(--danger)', color: 'white' }}>
              <X weight="bold" size={12} />
            </button>
          </div>
        )}
        <div className="input-wrapper glass-input">
          <FileText weight="regular" size={20} />
          <input 
            type="text" 
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder={selectedFile ? "File attached..." : "Paste notes..."}
            disabled={!!selectedFile || disabled}
            onKeyDown={(e) => e.key === 'Enter' && handleSimplifyClick()}
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt,.md,.csv,application/pdf"
            style={{ display: 'none' }} 
            disabled={disabled}
          />
          <button className="icon-btn sm" onClick={() => fileInputRef.current?.click()} disabled={disabled} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }} title="Attach File">
            <UploadSimple weight="regular" size={18} />
          </button>
          <button className="icon-btn sm" onClick={handleSimplifyClick} disabled={disabled || (!notesInput.trim() && !selectedFile)} title="Simplify">
            <MagicWand weight="regular" size={20} />
          </button>
          <button className="icon-btn sm" onClick={handleStudyGuideClick} disabled={disabled || (!notesInput.trim() && !selectedFile)} style={{ background: 'var(--success)' }} title="Generate Study Guide">
            <BookOpenText weight="regular" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
