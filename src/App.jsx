import React, { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import useStore from './store/useStore';
import { useOmniRoute } from './hooks/useOmniRoute';
import Sidebar from './components/Sidebar';
import TitleBar from './components/TitleBar';
import Chat from './components/Chat';
import GothamHologramTable from './components/GothamHologramTable';
import BatComputerSuitLab from './components/BatComputerSuitLab';
import Tasks from './components/Tasks';
import Metrics from './components/Metrics';
import Settings from './components/Settings';
import BatcaveHome from './components/BatcaveHome';

function App() {
  const { activeSection, setActiveSection, setConnected, isConnected } = useStore();
  const { checkConnection } = useOmniRoute();

  useEffect(() => {
    checkConnection().then(ok => setConnected(ok));
    const interval = setInterval(() => checkConnection().then(ok => setConnected(ok)), 15000);
    return () => clearInterval(interval);
  }, [checkConnection, setConnected]);

  const renderSection = () => {
    switch (activeSection) {
      case 'voicehome':
        return (
          <ErrorBoundary name="VoiceHome" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Home screen failed to load. Please restart Alfred.</div>}>
            <BatcaveHome />
          </ErrorBoundary>
        );
      case 'chat':
        return (
          <ErrorBoundary name="Chat" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Chat failed to load. Please restart Alfred.</div>}>
            <Chat />
          </ErrorBoundary>
        );
      case 'agents':
        return (
          <ErrorBoundary name="Agents" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Hologram table failed to load. Please restart Alfred.</div>}>
            <GothamHologramTable />
          </ErrorBoundary>
        );
      case 'hologram-table':
        return (
          <ErrorBoundary name="HologramTable" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Hologram table failed to load. Please restart Alfred.</div>}>
            <GothamHologramTable />
          </ErrorBoundary>
        );
      case 'suit-lab':
        return (
          <ErrorBoundary name="SuitLab" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Suit lab failed to load. Please restart Alfred.</div>}>
            <BatComputerSuitLab />
          </ErrorBoundary>
        );
      case 'tasks':
        return (
          <ErrorBoundary name="Tasks" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Tasks failed to load. Please restart Alfred.</div>}>
            <Tasks />
          </ErrorBoundary>
        );
      case 'metrics':
        return (
          <ErrorBoundary name="Metrics" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Metrics failed to load. Please restart Alfred.</div>}>
            <Metrics />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary name="Settings" fallback={<div className="flex items-center justify-center h-full text-gotham-danger text-sm">Settings failed to load. Please restart Alfred.</div>}>
            <Settings />
          </ErrorBoundary>
        );
      default:
        return <BatcaveHome />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gotham-black font-hud select-none overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} isConnected={isConnected} />
        <main className="flex-1 overflow-hidden bg-gotham-black">
          <div className={`relative flex flex-col h-full ${activeSection === 'agents' || activeSection === 'voicehome' || activeSection === 'hologram-table' || activeSection === 'suit-lab' ? '' : 'max-w-6xl mx-auto px-6 py-4'}`}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App

