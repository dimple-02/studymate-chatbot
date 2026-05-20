import React, { useEffect, useRef } from 'react';
import { Robot, SpeakerHigh } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ErrorBoundary from '../ErrorBoundary';

export default function ChatArea({ messages, isTyping, onSuggestionClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handlePlayVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser doesn't support Text-to-Speech.");
    }
  };

  return (
    <main className="chat-area">
      {messages.length === 0 && (
        <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
          <Robot weight="regular" size={48} style={{ marginBottom: '1rem', color: 'var(--primary-accent)' }} />
          <h3>Welcome to StudyMate!</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Ask me anything or try a suggestion below:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <button className="glass-btn" onClick={() => onSuggestionClick("Explain quantum computing simply.")} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Explain quantum computing simply
            </button>
            <button className="glass-btn" onClick={() => onSuggestionClick("What are the best study techniques?")} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              What are the best study techniques?
            </button>
          </div>
        </div>
      )}

      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
          {msg.sender === 'ai' && (
            <div className="avatar"><Robot weight="regular" size={20} /></div>
          )}
          <div className={`bubble ${msg.sender === 'user' ? 'solid-bubble' : 'glass-bubble'}`} style={msg.isError ? { border: '1px solid var(--danger)', color: 'var(--danger)' } : {}}>
            {msg.sender === 'ai' && !msg.isError ? (
              <ErrorBoundary>
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text ? String(msg.text) : " "}
                  </ReactMarkdown>
                </div>
                <button 
                  className="play-voice-btn"
                  onClick={() => handlePlayVoice(msg.text)}
                  title="Read Aloud"
                >
                  <SpeakerHigh weight="fill" /> Listen
                </button>
              </ErrorBoundary>
            ) : (
              <p>{msg.text ? String(msg.text) : " "}</p>
            )}
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="message ai-message">
          <div className="avatar"><Robot weight="regular" size={20} /></div>
          <div className="bubble glass-bubble typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </main>
  );
}
