import React from 'react';
import IframeContent from './IframeContent';

function HologramTable() {
  return (
    <div className="relative w-full h-full">
      <IframeContent
        src="/gotham-hologram.html"
        title="Gotham Hologram Table"
      />
    </div>
  );
}

export default HologramTable;
