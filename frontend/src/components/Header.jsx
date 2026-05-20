import React from 'react';
import { GraduationCap, Moon, Sun, SignOut, DownloadSimple } from '@phosphor-icons/react';

export default function Header({ theme, toggleTheme, remaining, onLogout, onExport, disabled }) {
  return (
    <header className="app-header" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="logo">
          <GraduationCap weight="regular" size={28} />
          <h1 style={{ fontSize: '1.2rem' }}>StudyMate</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="icon-btn" onClick={onExport} aria-label="Export Chat" disabled={disabled} style={{ width: '36px', height: '36px' }} title="Export Chat">
            <DownloadSimple weight="regular" size={20} />
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: '36px', height: '36px' }}>
            {theme === 'dark' ? <Sun weight="regular" size={20} /> : <Moon weight="regular" size={20} />}
          </button>
          <button className="icon-btn" onClick={onLogout} aria-label="Log Out" style={{ width: '36px', height: '36px', color: 'var(--danger)' }}>
            <SignOut weight="regular" size={20} />
          </button>
        </div>
      </div>
      <div style={{ background: 'var(--glass-bg)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', width: '100%', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>
          {remaining} / 10 free messages
        </span>
      </div>
    </header>
  );
}
