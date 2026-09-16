import React, { useEffect, useRef } from 'react';

function IframeContent({ src, title, onReady }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      if (onReady) onReady(iframe.contentWindow);
      const interval = setInterval(() => {
        if (!iframe.contentWindow) return;
        const agents = window.__ALFRED_AGENTS__ || [];
        iframe.contentWindow.postMessage(
          { type: 'ALFRED_AGENT_STATUS', agents },
          '*'
        );
      }, 2000);
      return () => clearInterval(interval);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [onReady]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      className="w-full h-full border-none"
      style={{ display: 'block' }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

export default IframeContent;
