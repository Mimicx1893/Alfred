import React, { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { useVoice } from '../hooks/useVoice';

const BRITISH_MALE_PRESETS = [
  'Microsoft David',
  'Microsoft Mark',
  'Google UK English Male',
  'Apple Daniel',
];

function isBritishMaleVoice(voiceName) {
  return BRITISH_MALE_PRESETS.some(preset => preset.toLowerCase() === (voiceName || '').toLowerCase());
}

function Chat() {
  const { messages, input, isThinking, isConnected, setInput, sendMessage, voiceEnabled, alfredVoice, voiceRate, voicePitch, events, setAlfredVoice, setVoiceRate, setVoicePitch } = useStore();
  const { isListening, transcript, startListening, stopListening, isSpeaking, cancelSpeech, speak } = useVoice();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      inputRef.current?.focus();
    }
  }, [transcript, setInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isError && voiceEnabled) {
      speak(lastMessage.content, alfredVoice, voiceRate, voicePitch);
    }
  }, [messages, voiceEnabled, alfredVoice, voiceRate, voicePitch, speak]);

  // Post Alfred replies to event bus
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isError) {
      useStore.getState().postEvent('alfred', null, 'decision', {
        direction: 'inbound',
        message: lastMessage.content,
      });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    useStore.getState().postEvent('user', null, 'decision', { message: trimmed });
    sendMessage(trimmed);
    inputRef.current?.focus();
  };

  const butlerGreetings = [
    "At your service, sir. What do you require?",
    "Good evening. The Batcave systems are operational.",
    "How may I assist you tonight, sir?",
    "Ready when you are, Master Wayne.",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <svg viewBox="0 0 100 100" className="w-24 h-24 mb-6 opacity-40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#00d4ff" strokeWidth="1"/>
              <path d="M30 65 L50 35 L70 65 M35 55 L65 55" stroke="#00d4ff" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
            <p className="text-gotham-accent text-sm tracking-widest mb-2">INITIALIZING BAT-SYSTEMS</p>
            <p className="text-gotham-muted text-xs">{butlerGreetings[0]}</p>
            <p className="text-gotham-muted/50 text-[10px] mt-4 tracking-wider">Type a message below to begin, sir.</p>
            {events.length > 0 && (
              <div className="mt-4 text-[10px] text-gotham-muted/40 tracking-wider animate-fadeInUp">
                ◆ {events.length} events in session log
              </div>
            )}
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gotham-accent/10 border border-gotham-accent/30 text-gotham-text rounded-br-none'
                : msg.isError
                  ? 'bg-gotham-danger/10 border border-gotham-danger/30 text-gotham-danger rounded-bl-none'
                  : 'bg-gotham-panel border border-gotham-border text-gotham-text rounded-bl-none'
            }`}>
              {msg.role === 'assistant' && !msg.isError && (
                <div className="text-gotham-accent text-[10px] tracking-widest mb-1 uppercase opacity-70">
{msg.meta?.agent === 'alfred' ? 'Alfred' : `Gotham · ${msg.meta?.agent || 'Alfred'}`}
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className="text-[10px] text-gotham-muted mt-2 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-gotham-panel border border-gotham-border rounded-lg rounded-bl-none px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="text-gotham-accent text-[10px] tracking-widest uppercase opacity-70">Alfred</div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gotham-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }}/>
                  <div className="w-1.5 h-1.5 bg-gotham-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }}/>
                  <div className="w-1.5 h-1.5 bg-gotham-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }}/>
                </div>
              </div>
              <p className="text-gotham-muted text-xs mt-1 italic">Processing, sir...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gotham-border">
        <div className="flex items-center gap-3 bg-gotham-dark border border-gotham-border rounded-lg px-4 py-3 focus-within:border-gotham-accent/50 transition-colors">
          <span className="text-gotham-accent text-xs opacity-50 select-none">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Speak, sir..."
            disabled={isThinking}
            className="flex-1 bg-transparent text-gotham-text text-sm placeholder-gotham-muted/50 outline-none disabled:opacity-50"
            autoFocus
          />
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isThinking}
            className={`text-xs tracking-widest uppercase transition-all px-2 ${
              isListening ? 'text-gotham-danger animate-pulse' : 'text-gotham-muted hover:text-gotham-accent'
            } disabled:opacity-30`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v.01M12 11a3 3 0 013 3v1a3 3 0 01-3 3m0-10a3 3 0 00-3 3v1a3 3 0 003 3" />
            </svg>
          </button>
          {isSpeaking && (
            <button
              type="button"
              onClick={cancelSpeech}
              className="text-gotham-accent text-xs tracking-widest uppercase hover:opacity-80 transition-opacity px-2"
              title="Stop speaking"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="text-gotham-accent text-xs tracking-widest uppercase disabled:opacity-30 hover:opacity-80 transition-opacity px-2"
          >
            SEND
          </button>
        </div>
        {voiceEnabled && (
          <div className="mt-2 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              {isBritishMaleVoice(alfredVoice) && (
                <span className="text-[10px] tracking-wider uppercase text-gotham-accent border border-gotham-accent/40 rounded px-2 py-0.5">
                  British Male Voice
                </span>
              )}
              <span className="text-[10px] text-gotham-muted truncate max-w-[180px]">
                Voice: {alfredVoice || 'Default'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {BRITISH_MALE_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAlfredVoice(preset); }}
                  className={`text-[10px] border rounded px-2 py-1 transition-colors truncate max-w-[120px] ${
                    alfredVoice === preset
                      ? 'border-gotham-accent/60 text-gotham-accent'
                      : 'border-gotham-border text-gotham-muted hover:text-gotham-text hover:border-gotham-accent/40'
                  }`}
                  title={preset}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default Chat;

