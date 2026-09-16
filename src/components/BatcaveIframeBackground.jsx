import React, { useEffect, useRef } from 'react';

function BatcaveIframeBackground() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const interval = setInterval(() => {
      if (!iframe.contentWindow) return;
      const agents = window.__ALFRED_AGENTS__ || [];
      iframe.contentWindow.postMessage(
        { type: 'ALFRED_AGENT_STATUS', agents },
        '*'
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/batcave-command-center.html"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ border: 'none', opacity: 0.9 }}
      title="Batcave Background"
    />
  );
}

export default BatcaveIframeBackground;
