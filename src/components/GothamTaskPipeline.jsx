import React, { useEffect, useState } from 'react'
import useStore from '../store/useStore'

window.__GOTHAM_API_BASE__ = window.__GOTHAM_API_BASE__ || '/api/worker'

window.__GOTHAM_SWAP__ = window.__GOTHAM_SWAP__ || {
  swapped: true,
  before: 'Scarecrow order 4 critical true -> MrFreeze order 5 critical false',
  after: 'MrFreeze order 4 critical true active true role Compliance & Risk critical gate -> Scarecrow order 5 critical false active false role Scheduling & Publishing',
  logic: 'Swapped compliance gate before publishing to enforce risk check prior to schedule.'
}

const AGENTS = [
  { id: 'alfred', displayId: 'ALFRED', order: 1, role: 'Mission Control & Orchestration', critical: true, active: true, does: 'Parses mission intent, delegates to pipeline, monitors health, British male voice fallback.', inputs: ['mission brief'], outputs: ['agent assignments'], blockers: [] },
  { id: 'oracle', displayId: 'ORACLE', order: 2, role: 'Intel & Recon', critical: false, active: true, does: 'Aggregates Gotham intel, maps districts, enriches tasks with location data.', inputs: ['raw intel'], outputs: ['enriched tasks'], blockers: [] },
  { id: 'batman', displayId: 'BATMAN', order: 3, role: 'Execution & Tactics', critical: true, active: true, does: 'Executes primary objectives, coordinates field ops, escalates blockers.', inputs: ['enriched tasks'], outputs: ['field results'], blockers: [] },
  { id: 'mrfreeze', displayId: 'MRFREEZE', order: 4, role: 'Compliance & Risk - critical gate', critical: true, active: true, does: 'Critical compliance gate. Validates risk, legal, and safety before publishing. Blocks pipeline if failed.', inputs: ['field results'], outputs: ['risk clearance'], blockers: ['legal', 'safety'] },
  { id: 'scarecrow', displayId: 'SCARECROW', order: 5, role: 'Scheduling & Publishing', critical: false, active: false, does: 'Schedules approved tasks for publishing, manages release windows, non-critical path.', inputs: ['risk clearance'], outputs: ['publish schedule'], blockers: [] },
  { id: 'nightwing', displayId: 'NIGHTWING', order: 6, role: 'Review & QA', critical: false, active: true, does: 'Reviews scheduled tasks, flags issues, approves for hero pool.', inputs: ['publish schedule'], outputs: ['review verdict'], blockers: [] },
  { id: 'batgirl', displayId: 'BATGIRL', order: 7, role: 'Dispatch & Archive', critical: false, active: true, does: 'Final dispatch to Gotham systems and archive to ledger.', inputs: ['review verdict'], outputs: ['archive'], blockers: [] },
]

const PIPELINE = AGENTS.filter(a=> a.order<=7).sort((a,b)=> a.order-b.order)

window.__GOTHAM_AGENTS__ = AGENTS
window.__GOTHAM_PIPELINE__ = PIPELINE

window.__GOTHAM_API__ = window.__GOTHAM_API__ || {
  loadTasks: async ()=> {
    const base = window.__GOTHAM_API_BASE__ || '/api/worker'
    const res = await fetch(`${base}/tasks`)
    return res.json()
  },
  dispatchReview: async (reviewer, agentId, verdict)=> {
    const base = window.__GOTHAM_API_BASE__ || '/api/worker'
    return fetch(`${base}/review`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reviewer, agentId, verdict }) })
  },
  updateTaskStatus: async (taskId, status)=> {
    const base = window.__GOTHAM_API_BASE__ || '/api/worker'
    return fetch(`${base}/tasks/${taskId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
  }
}

function AgentCard({ agent, selected, onSelect }){
  return (
    <div
      data-id={agent.id}
      onClick={()=> onSelect(agent.id)}
      className="relative min-w-[224px] w-[224px] rounded-[14px] border p-[16px_14px_14px] cursor-pointer transition-all"
      style={{
        background:'linear-gradient(180deg, #1a1a25 0%, #0a0a0f 100%)',
        borderColor: selected ? '#00d4ff' : '#2a2a3a',
        boxShadow: selected ? '0 0 0 1px #00d4ff inset, 0 12px 40px rgba(0,212,255,0.18)' : 'none',
        borderLeft: agent.critical ? '3px solid #ff4444' : '1px solid #2a2a3a',
        transition: 'left 900ms ease, top 900ms ease, transform 900ms ease, opacity 400ms ease, border-color 220ms ease, box-shadow 220ms ease'
      }}
    >
      {(agent.id==='mrfreeze' || agent.id==='scarecrow') && (
        <span className="absolute top-[10px] right-[10px] text-[8px] tracking-[0.14em] font-bold px-[6px] py-[2px] rounded-[4px]" style={{ background:'#ffaa00', color:'#0a0a0f' }}>SWAPPED</span>
      )}
      <div className="flex items-center justify-between mb-[10px]">
        <span className="text-[11px] font-bold tracking-[0.12em]" style={{color:'#00d4ff'}}>{agent.displayId}</span>
        <span className="text-[10px] px-[6px] py-[2px] rounded-full" style={{ background:'#2a2a3a', color:'#6b6b80' }}>#{String(agent.order).padStart(2,'0')}</span>
      </div>
      <div className="text-[13px] font-bold tracking-[0.08em] mb-1" style={{color:'#c8c8d0'}}>{agent.role}</div>
      <div className="text-[10px] leading-[1.5] rounded-[8px] border p-[8px_9px] min-h-[68px] mb-[10px]" style={{ background:'#0a0a0f', borderColor:'#2a2a3a', color:'#c8c8d0' }}>{agent.does}</div>
      <div className="flex flex-wrap gap-[5px]">
        {agent.critical && <span className="text-[8px] tracking-[0.08em] font-bold px-[6px] py-[3px] rounded-full border" style={{ color:'#ff4444', borderColor:'rgba(255,68,68,0.35)', background:'rgba(255,68,68,0.08)' }}>CRITICAL</span>}
        <span className="text-[8px] tracking-[0.08em] font-bold px-[6px] py-[3px] rounded-full border" style={{ color: agent.active ? '#00ff88' : '#ffaa00', borderColor: agent.active ? 'rgba(0,255,136,0.32)' : 'rgba(255,170,0,0.32)', background: agent.active ? 'rgba(0,255,136,0.08)' : 'rgba(255,170,0,0.08)' }}>{agent.active ? 'ACTIVE' : 'IDLE'}</span>
      </div>
    </div>
  )
}

export default function GothamTaskPipeline(){
  const { tasks, loadTasks, setSelectedTask } = useStore()
  const [selected, setSelected] = useState('alfred')
  const [filter, setFilter] = useState('WORKING')
  const [view, setView] = useState('PIPELINE')
  const [log, setLog] = useState([])

  useEffect(()=>{ loadTasks() }, [])

  const selectedAgent = AGENTS.find(a=> a.id===selected)

  const handleReview = async (reviewer, agentId, verdict)=>{
    const msg = `${new Date().toLocaleTimeString()} - ${reviewer.toUpperCase()} ${verdict} ${agentId.toUpperCase()}`
    setLog(prev=> [{ ts: Date.now(), msg }, ...prev].slice(0,20))
    window.postMessage({ type:'ALFRED_AGENT_STATUS', agents:[{ id: agentId, status: verdict==='APPROVE' ? 'active' : verdict==='FLAG' ? 'blocked' : 'error' }] }, '*')
    try{ await window.__GOTHAM_API__.dispatchReview(reviewer, agentId, verdict) }catch{}
  }

  const filtered = filter==='WORKING' ? PIPELINE.filter(a=> a.active) : filter==='CRITICAL' ? AGENTS.filter(a=> a.critical) : AGENTS

  return (
    <div className="max-w-[1440px] mx-auto" style={{ fontFamily:'JetBrains Mono, monospace' }}>
      <div className="flex items-center justify-between gap-5 p-[18px_22px] rounded-[14px] border" style={{ background:'#1a1a25', borderColor:'rgba(0,212,255,0.14)', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-[14px]">
          <div className="w-10 h-10 rounded-[9px] grid place-items-center font-bold" style={{ background:'#00d4ff', color:'#0a0a0f', boxShadow:'0 0 22px rgba(0,212,255,0.35)' }}>G</div>
          <div>
            <h1 className="text-[14px] tracking-[0.12em] font-bold" style={{color:'#c8c8d0'}}>GOTHAM TASK PIPELINE - KILO READABLE</h1>
            <p className="text-[11px] tracking-[0.06em] mt-[2px]" style={{color:'#6b6b80'}}>{tasks.length} TASKS - {window.__GOTHAM_SWAP__.after}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded-[10px] border p-[3px]" style={{ background:'#1a1a25', borderColor:'#2a2a3a' }}>
            {['WORKING','CRITICAL','ALL'].map(f=>(
              <button key={f} onClick={()=> setFilter(f)} className={`px-[14px] py-[8px] rounded-[7px] text-[11px] tracking-[0.08em] font-bold transition-all ${filter===f ? 'bg-[#00d4ff] text-[#0a0a0f] shadow-[0_2px_14px_rgba(0,212,255,0.35)]' : 'text-[#6b6b80] hover:text-[#c8c8d0]'}`}>{f}</button>
            ))}
          </div>
          <div className="flex rounded-[10px] border p-[3px]" style={{ background:'#1a1a25', borderColor:'#2a2a3a' }}>
            {['PIPELINE','TABLE'].map(v=>(
              <button key={v} onClick={()=> setView(v)} className={`px-[14px] py-[8px] rounded-[7px] text-[11px] tracking-[0.08em] font-bold ${view===v ? 'bg-[#00d4ff] text-[#0a0a0f]' : 'text-[#6b6b80]'}`}>{v}</button>
            ))}
          </div>
          <button onClick={()=> { loadTasks(); setLog(prev=> [{ts:Date.now(), msg:'[SIMULATE] loadTasks()'}, ...prev]) }} className="border rounded-[9px] px-4 py-[9px] text-[11px] font-bold tracking-[0.1em]" style={{ borderColor:'rgba(0,255,136,0.28)', background:'rgba(0,255,136,0.08)', color:'#00ff88' }}>SIMULATE</button>
        </div>
      </div>

      {view==='PIPELINE' && filter==='WORKING' && (
        <div className="mt-6">
          <div className="text-[10px] tracking-[0.18em] mb-[14px] flex gap-[10px] items-center" style={{color:'#6b6b80'}}><i className="inline-block w-7 h-[1px]" style={{background:'rgba(0,212,255,0.14)'}} /> WORKING PIPELINE - {filtered.length} AGENTS</div>
          <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
            {filtered.sort((a,b)=> a.order-b.order).map((agent, idx)=>(
              <React.Fragment key={agent.id}>
                <AgentCard agent={agent} selected={selected===agent.id} onSelect={setSelected} />
                {idx < filtered.length-1 && <div className="grid place-items-center w-[38px] min-w-[38px] text-[16px] select-none" style={{color:'rgba(0,212,255,0.14)'}}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {view==='TABLE' && (
        <div className="mt-6 rounded-[12px] border overflow-hidden" style={{ background:'#1a1a25', borderColor:'#2a2a3a' }}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor:'#2a2a3a' }}>
                {['ORDER','ID','ROLE','CRITICAL','ACTIVE','DOES'].map(h=>(
                  <th key={h} className="px-4 py-3 text-[10px] tracking-[0.12em]" style={{color:'#6b6b80'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a,b)=> a.order-b.order).map(agent=>(
                <tr key={agent.id} data-id={agent.id} onClick={()=> setSelected(agent.id)} className="border-b cursor-pointer hover:bg-[rgba(0,212,255,0.04)]" style={{ borderColor:'#2a2a3a', background: selected===agent.id ? 'rgba(0,212,255,0.06)' : undefined }}>
                  <td className="px-4 py-3 text-[11px]" style={{color:'#c8c8d0'}}>#{String(agent.order).padStart(2,'0')}</td>
                  <td className="px-4 py-3 text-[11px] font-bold" style={{color:'#00d4ff'}}>{agent.displayId}</td>
                  <td className="px-4 py-3 text-[11px]" style={{color:'#c8c8d0'}}>{agent.role}</td>
                  <td className="px-4 py-3 text-[10px]" style={{color: agent.critical ? '#ff4444' : '#6b6b80'}}>{agent.critical ? 'YES' : '—'}</td>
                  <td className="px-4 py-3 text-[10px]" style={{color: agent.active ? '#00ff88' : '#ffaa00'}}>{agent.active ? 'ACTIVE' : 'IDLE'}</td>
                  <td className="px-4 py-3 text-[10px] max-w-[360px] truncate" style={{color:'#c8c8d0'}}>{agent.does}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view==='PIPELINE' && filter!=='WORKING' && (
        <div className="mt-6">
          <div className="text-[10px] tracking-[0.18em] mb-[14px]" style={{color:'#6b6b80'}}>{filter} POOL - {filtered.length} AGENTS</div>
          <div className="flex flex-wrap gap-3">
            {filtered.map(agent=> <AgentCard key={agent.id} agent={agent} selected={selected===agent.id} onSelect={setSelected} />)}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-[14px] border p-[18px]" style={{ background:'#1a1a25', borderColor:'#2a2a3a', borderStyle:'dashed' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] tracking-[0.18em] font-bold" style={{color:'#c8c8d0'}}>HERO POOL - REVIEW GATE</h2>
          <span className="text-[10px]" style={{color:'#6b6b80'}}>APPROVE / FLAG / BLOCK dispatches to __GOTHAM_API__.dispatchReview</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-[12px] border p-4" style={{ background:'#0a0a0f', borderColor:'#2a2a3a' }}>
            <h3 className="text-[12px] font-bold tracking-[0.08em]" style={{color:'#c8c8d0'}}>{selectedAgent ? `${selectedAgent.displayId} - ${selectedAgent.role}` : 'SELECT AN AGENT'}</h3>
            <p className="text-[11px] leading-[1.6] mt-2" style={{color:'#c8c8d0'}}>{selectedAgent ? selectedAgent.does : 'Click any card. Selected agent details appear here. Use Approve / Flag to simulate reviewer actions.'}</p>
            {selectedAgent && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={()=> handleReview('alfred', selectedAgent.id, 'APPROVE')} className="px-3 py-2 rounded-[8px] text-[10px] font-bold tracking-widest border" style={{ background:'rgba(0,255,136,0.1)', borderColor:'rgba(0,255,136,0.25)', color:'#00ff88' }}>APPROVE - ALFRED → {selectedAgent.displayId}</button>
                <button onClick={()=> handleReview('nightwing', selectedAgent.id, 'FLAG')} className="px-3 py-2 rounded-[8px] text-[10px] font-bold tracking-widest border" style={{ background:'rgba(255,170,0,0.1)', borderColor:'rgba(255,170,0,0.25)', color:'#ffaa00' }}>FLAG - NIGHTWING → {selectedAgent.displayId}</button>
                <button onClick={()=> handleReview('batgirl', selectedAgent.id, 'BLOCK')} className="px-3 py-2 rounded-[8px] text-[10px] font-bold tracking-widest border" style={{ background:'rgba(255,68,68,0.1)', borderColor:'rgba(255,68,68,0.25)', color:'#ff4444' }}>BLOCK - BATGIRL → {selectedAgent.displayId}</button>
              </div>
            )}
            <div className="mt-4 text-[10px] leading-[1.6]" style={{color:'#6b6b80'}}>
              <div>INPUTS: {selectedAgent ? selectedAgent.inputs.join(', ') : '—'}</div>
              <div>OUTPUTS: {selectedAgent ? selectedAgent.outputs.join(', ') : '—'}</div>
              <div>BLOCKERS: {selectedAgent ? (selectedAgent.blockers.join(', ') || 'none') : '—'}</div>
            </div>
          </div>
          <div className="rounded-[12px] border p-4 flex flex-col" style={{ background:'#0a0a0f', borderColor:'#2a2a3a' }}>
            <h3 className="text-[11px] tracking-[0.08em] font-bold" style={{color:'#c8c8d0'}}>EVENT LOG - ALFRED_AGENT_STATUS</h3>
            <div className="mt-3 grid gap-1.5 max-h-[180px] overflow-y-auto">
              {log.length===0 && <p className="text-[10px]" style={{color:'#6b6b80'}}>No events yet. Click SIMULATE or trigger a review.</p>}
              {log.map((e,i)=>(
                <div key={i} className="text-[10px] rounded-[7px] border px-2 py-1.5" style={{ background:'#1a1a25', borderColor:'#2a2a3a', color:'#c8c8d0' }}><span style={{color:'#6b6b80'}}>{new Date(e.ts).toLocaleTimeString()}</span> - {e.msg}</div>
              ))}
            </div>
            <div className="mt-4 p-2.5 rounded-[8px] border" style={{ background:'rgba(0,212,255,0.06)', borderColor:'rgba(0,212,255,0.14)' }}>
              <div className="text-[10px] font-bold tracking-[0.08em] mb-1" style={{color:'#00d4ff'}}>SWAP LOGIC</div>
              <div className="text-[10px] leading-[1.5]" style={{color:'#c8c8d0'}}>Before: Scarecrow critical gate, MrFreeze scheduling.<br/>After: MrFreeze critical gate (pos4), Scarecrow scheduling (pos5).<br/>{window.__GOTHAM_SWAP__.logic}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[10px] tracking-[0.06em]" style={{color:'#6b6b80'}}>Kilo Code · Readable JSX · Golden tokens · JetBrains Mono · Transitions left 900ms ease, top 900ms ease</div>
    </div>
  )
}
