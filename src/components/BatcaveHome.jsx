import React from 'react';
import IframeContent from './IframeContent';

function BatcaveHome({ onNavigateToChat, onToggleVoice }) {
  return (
    <div className="relative w-full h-full">
      <IframeContent
        src="/batcomputer-suit-lab.html"
        title="Batcomputer Home"
      />
    </div>
  );
}

export default BatcaveHome;
