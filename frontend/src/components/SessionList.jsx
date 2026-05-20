import React from 'react';
import { Plus, Trash, ChatTeardropText } from '@phosphor-icons/react';

export default function SessionList({ sessions, currentSessionId, onSelectSession, onCreateSession, onDeleteSession, disabled }) {
  return (
    <div className="session-list-container">
      <div className="session-header">
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Recent Chats</h3>
        <button 
          className="icon-btn" 
          onClick={onCreateSession} 
          disabled={disabled}
          title="New Chat"
        >
          <Plus weight="bold" size={16} />
        </button>
      </div>
      <div className="sessions-scroll-area">
        {sessions.map(session => (
          <div 
            key={session.id} 
            className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
            onClick={() => !disabled && onSelectSession(session.id)}
          >
            <div className="session-title">
              <ChatTeardropText weight={session.id === currentSessionId ? 'fill' : 'regular'} size={18} />
              <span className="truncate">{session.title || 'New Chat'}</span>
            </div>
            <button 
              className="delete-session-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onDeleteSession(session.id);
              }}
              title="Delete Chat"
            >
              <Trash weight="regular" size={16} />
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="empty-sessions">
            No recent chats.
          </div>
        )}
      </div>
    </div>
  );
}
