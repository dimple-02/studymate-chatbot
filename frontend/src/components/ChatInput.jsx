import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, PaperPlaneRight, Microphone } from '@phosphor-icons/react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev + ' ' + transcript).trim().substring(0, 100));
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser doesn't support speech recognition.");
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    if (val.length <= 100) {
      setInput(val);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="chat-input-area">
      <div className="input-wrapper glass-input" style={disabled ? { opacity: 0.7 } : {}}>
        <button 
          className={`icon-btn attach-btn ${isListening ? 'mic-active' : ''}`} 
          onClick={toggleListen}
          aria-label="Voice Input" 
          disabled={disabled}
          title="Voice Input"
        >
          <Microphone weight={isListening ? 'fill' : 'regular'} size={24} />
        </button>
        <textarea 
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "StudyMate is thinking..." : (isListening ? "Listening..." : "Ask StudyMate anything...")}
          rows="1"
          disabled={disabled}
          maxLength={100}
        />
        <button 
          className="send-btn" 
          onClick={handleSend} 
          aria-label="Send Message"
          disabled={disabled}
          style={disabled ? { background: 'var(--text-muted)', cursor: 'not-allowed', transform: 'none' } : {}}
        >
          <PaperPlaneRight weight="fill" size={20} />
        </button>
      </div>
    </footer>
  );
}
