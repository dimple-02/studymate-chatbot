import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ActionBar from './components/ActionBar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import Login from './components/Login';
import SessionList from './components/SessionList';
import { useAuth } from './contexts/AuthContext';
import { auth } from './firebase';
import './App.css';

function App() {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('studymate-theme') || 'light');
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const loadedUid = useRef(null);

  useEffect(() => {
    if (currentUser && loadedUid.current !== currentUser.uid) {
      const savedData = localStorage.getItem(`studymate-data-${currentUser.uid}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setSessions(parsed.sessions || []);
          setCurrentSessionId(parsed.currentSessionId || null);
          const active = parsed.sessions?.find(s => s.id === parsed.currentSessionId);
          setMessages(active ? active.messages : []);
        } catch (e) {
          console.error("Failed to parse saved sessions", e);
        }
      } else {
        // Migration from old logic
        const oldMessages = localStorage.getItem(`studymate-messages-${currentUser.uid}`);
        let parsedOld = [];
        try {
          if (oldMessages) parsedOld = JSON.parse(oldMessages);
        } catch(e) {}
        
        const newSessionId = Date.now().toString();
        const initSessions = [{ id: newSessionId, title: parsedOld.length ? 'Old Chat' : 'New Chat', messages: parsedOld }];
        setSessions(initSessions);
        setCurrentSessionId(newSessionId);
        setMessages(parsedOld);
      }
      loadedUid.current = currentUser.uid;
    }
  }, [currentUser]);

  // When messages change, update the current session in the `sessions` array
  useEffect(() => {
    if (currentSessionId && loadedUid.current === currentUser?.uid) {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages } : s));
    }
  }, [messages, currentSessionId, currentUser]);

  // When sessions or currentSessionId change, save to localStorage
  useEffect(() => {
    if (loadedUid.current === currentUser?.uid && sessions.length > 0) {
      localStorage.setItem(`studymate-data-${currentUser.uid}`, JSON.stringify({ sessions, currentSessionId }));
    }
  }, [sessions, currentSessionId, currentUser]);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('studymate-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectSession = (id) => {
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    setMessages(session ? session.messages : []);
  };

  const handleCreateSession = () => {
    const newSessionId = Date.now().toString();
    const newSession = { id: newSessionId, title: 'New Chat', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
  };

  const handleDeleteSession = (id) => {
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== id);
      if (newSessions.length === 0) {
        const newSessionId = Date.now().toString();
        const newSession = { id: newSessionId, title: 'New Chat', messages: [] };
        setTimeout(() => {
           setCurrentSessionId(newSessionId);
           setMessages([]);
        }, 0);
        return [newSession];
      }
      if (currentSessionId === id) {
        setTimeout(() => {
          setCurrentSessionId(newSessions[0].id);
          setMessages(newSessions[0].messages);
        }, 0);
      }
      return newSessions;
    });
  };

  const ensureSession = (titleHint) => {
    if (!currentSessionId) {
       const newSessionId = Date.now().toString();
       setCurrentSessionId(newSessionId);
       setSessions(prev => [{ id: newSessionId, title: titleHint || 'New Chat', messages: [] }, ...prev]);
    } else {
       // update title if it's new chat
       setSessions(prev => prev.map(s => (s.id === currentSessionId && s.messages.length === 0) ? { ...s, title: titleHint || 'New Chat' } : s));
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    let textContent = `StudyMate Chat Export\nDate: ${new Date().toLocaleDateString()}\n\n`;
    messages.forEach(m => {
      textContent += `${m.sender === 'user' ? 'You' : 'StudyMate'}: ${m.text}\n\n`;
    });
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate_chat_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApiRequest = async (endpoint, body) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to AI');
      }

      if (data.remaining !== undefined) {
        setRemainingMessages(data.remaining);
      }

      return data.reply;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSendMessage = async (text) => {
    ensureSession(text.substring(0, 20));
    const userMsg = { text, sender: 'user' };
    const history = [...messages]; 
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const reply = await handleApiRequest('/api/chat', { message: text, history });
      setMessages(prev => [...prev, { text: reply, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai', isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVivaMode = async (stopLoading) => {
    ensureSession("Viva Session");
    try {
      const reply = await handleApiRequest('/api/viva', {});
      setMessages(prev => [...prev, { text: "Here is your Viva question:\n\n" + reply, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai', isError: true }]);
    } finally {
      stopLoading();
    }
  };

  const handleSimplifyNotes = async (notes) => {
    ensureSession("Notes Simplification");
    setMessages(prev => [...prev, { text: `Please simplify these notes: "${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}"`, sender: 'user' }]);
    setIsTyping(true);
    
    try {
      const reply = await handleApiRequest('/api/simplify', { notes });
      setMessages(prev => [...prev, { text: "Here are your simplified notes:\n\n" + reply, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai', isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSimplifyFile = async (file) => {
    ensureSession("File Simplification");
    setMessages(prev => [...prev, { text: `Please simplify the notes in my file: ${file.name}`, sender: 'user' }]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/simplify-file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to simplify file');
      }

      if (data.remaining !== undefined) {
        setRemainingMessages(data.remaining);
      }

      setMessages(prev => [...prev, { text: "Here are the simplified notes from your file:\n\n" + data.reply, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai', isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateStudyGuide = async (notes) => {
    ensureSession("Study Guide");
    setMessages(prev => [...prev, { text: `Please generate a study guide for these notes: "${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}"`, sender: 'user' }]);
    setIsTyping(true);
    
    try {
      const reply = await handleApiRequest('/api/study-guide', { notes });
      setMessages(prev => [...prev, { text: "Here is your Study Guide:\n\n" + reply, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai', isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateStudyGuideFile = async (file) => {
    ensureSession("Study Guide (File)");
    setMessages(prev => [...prev, { text: `Please generate a study guide from my file: ${file.name}`, sender: 'user' }]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/study-guide-file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      if (data.remaining !== undefined) {
        setRemainingMessages(data.remaining);
      }

      setMessages(prev => [...prev, { text: "Here is the Study Guide based on your file:\n\n" + data.reply, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai', isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="app-container glass-panel">
      <div className="sidebar">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          remaining={remainingMessages} 
          onLogout={handleLogout} 
          onExport={handleExportChat}
          disabled={isTyping}
        />
        <SessionList 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          disabled={isTyping}
        />
        <ActionBar 
          onVivaMode={handleVivaMode} 
          onSimplifyNotes={handleSimplifyNotes} 
          onSimplifyFile={handleSimplifyFile} 
          onGenerateStudyGuide={handleGenerateStudyGuide}
          onGenerateStudyGuideFile={handleGenerateStudyGuideFile}
          disabled={isTyping} 
        />
      </div>
      <div className="main-content">
        <ChatArea messages={messages} isTyping={isTyping} onSuggestionClick={handleSendMessage} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}

export default App;
