import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);
  const restartTimerRef = useRef(null);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, []);

  useEffect(() => {
    recognitionRef.current = createRecognition();

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      voicesRef.current = availableVoices;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      }
      window.speechSynthesis.cancel();
    };
  }, [createRecognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
      if (!recognitionRef.current) {
        console.warn('Speech recognition not supported');
        return;
      }
    }

    if (isListening) return;

    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('Speech recognition start error:', e);
      recognitionRef.current = createRecognition();
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e2) {
        console.error('Speech recognition retry error:', e2);
      }
    }
  }, [isListening, createRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text, voiceName, rate, pitch) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate || 0.9;
      utterance.pitch = pitch || 0.8;
      utterance.lang = 'en-GB';

      const currentVoices = voicesRef.current.length > 0 ? voicesRef.current : voices;

      if (currentVoices.length > 0) {
        let selectedVoice = null;

        if (voiceName) {
          selectedVoice = currentVoices.find(v => v.name === voiceName);
        }

        if (!selectedVoice) {
          selectedVoice = currentVoices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
        }

        if (!selectedVoice) {
          selectedVoice = currentVoices.find(v => v.lang.startsWith('en'));
        }

        if (!selectedVoice) {
          selectedVoice = currentVoices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Failed to speak:', e);
      setIsSpeaking(false);
    }
  }, [voices]);

  const cancelSpeech = useCallback(() => {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error('Failed to cancel speech:', e);
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    voices,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    setTranscript,
  };
}
