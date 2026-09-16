import { useState, useCallback } from 'react';

export function useOmniRoute() {
  const [isConnected, setIsConnected] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setIsConnected(res.ok);
      return res.ok;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  const sendMessage = useCallback(async (message, history = []) => {
    setIsThinking(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      return data.reply;
    } catch (err) {
      return `I seem to be experiencing a connectivity issue, sir. Perhaps we can discuss this later. (${err.message})`;
    } finally {
      setIsThinking(false);
    }
  }, []);

  return { isConnected, isThinking, checkConnection, sendMessage };
}
