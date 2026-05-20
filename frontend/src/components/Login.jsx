import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { GraduationCap, GoogleLogo, EnvelopeSimple, LockKey } from '@phosphor-icons/react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container glass-panel">
      <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>
        <GraduationCap weight="regular" size={48} />
        <h1>StudyMate</h1>
      </div>
      
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{isRegistering ? 'Create an Account' : 'Welcome Back'}</h2>
      
      {error && <div className="error-alert" style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-input">
          <EnvelopeSimple size={20} />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="glass-input">
          <LockKey size={20} />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit" className="glass-btn" disabled={loading} style={{ marginTop: '1rem', background: 'var(--primary-accent)', color: 'white' }}>
          {isRegistering ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
        <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--glass-bg)', padding: '0 10px', fontSize: '0.85rem' }}>OR</span>
      </div>

      <button onClick={handleGoogleSignIn} className="glass-btn" disabled={loading} style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <GoogleLogo size={20} /> Continue with Google
      </button>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
        <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: 'bold' }}>
          {isRegistering ? 'Log In' : 'Sign Up'}
        </span>
      </div>
    </div>
  );
}
