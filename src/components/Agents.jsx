import React from 'react';
import useStore from '../store/useStore';

const statusColors = {
  active: 'bg-gotham-success',
  idle: 'bg-gotham-warning',
  error: 'bg-gotham-danger',
};

function Agents() {
  const { agents } = useStore();

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gotham-accent tracking-widest font-butler mb-1">AGENT BRAIN</h2>
        <p className="text-gotham-muted text-xs">Autonomous business agents at your service</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className="bg-gotham-panel border border-gotham-border rounded-lg p-4 hover:border-gotham-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[agent.status] || 'bg-gotham-muted'}`} />
                <h3 className="text-gotham-text font-bold text-sm tracking-wider">{agent.name}</h3>
              </div>
              <span className="text-[10px] text-gotham-muted uppercase tracking-wider">{agent.status}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gotham-muted">Current Task</span>
                <span className="text-gotham-text">{agent.task}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gotham-muted">Last Active</span>
                <span className="text-gotham-text">{agent.lastActive}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-gotham-dark border border-gotham-border text-gotham-text text-xs py-1.5 rounded hover:border-gotham-accent/50 transition-colors">
                View Logs
              </button>
              <button className="flex-1 bg-gotham-accent/10 border border-gotham-accent/30 text-gotham-accent text-xs py-1.5 rounded hover:bg-gotham-accent/20 transition-colors">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Agents;
