import { create } from 'zustand';

const useStore = create((set, get) => ({
  messages: [],
  isConnected: false,
  isThinking: false,
  alfredModel: 'openrouter/free',
  input: '',
  activeSection: 'voicehome',

  agents: [
    { id: 'alfred',    name: 'Alfred',       status: 'active', task: 'Orchestrating Engine A flywheel', lastActive: 'now',        district: 'alfred',    landmark: 'Wayne Manor' },
    { id: 'riddler',   name: 'Riddler',      status: 'active', task: 'GoMining weekly research',       lastActive: '2 min ago',  district: 'riddler',   landmark: 'Gotham Library' },
    { id: 'joker',     name: 'Joker',        status: 'active', task: 'Scripting: mining angle v1',     lastActive: '5 min ago',  district: 'joker',     landmark: 'Amusement Mile' },
    { id: 'scarecrow', name: 'Scarecrow',    status: 'idle',   task: 'Awaiting first asset review',    lastActive: '30 min ago', district: 'scarecrow', landmark: 'Arkham Asylum' },
    { id: 'twoface',   name: 'Two-Face',     status: 'idle',   task: 'A/B testing — Phase 2',          lastActive: '—',          district: 'twoface',   landmark: 'Gotham Courthouse' },
    { id: 'poisonivy', name: 'Poison Ivy',    status: 'idle',   task: 'Generation queue — Phase 2',     lastActive: '—',          district: 'poisonivy', landmark: 'Botanical Gardens' },
    { id: 'mrfeeze',   name: 'Mr. Freeze',   status: 'idle',   task: 'Scheduling — Phase 2',           lastActive: '—',          district: 'mrfeeze',   landmark: 'Cryo-Lab' },
    { id: 'penguin',   name: 'Penguin',      status: 'idle',   task: 'Revenue reporting — Phase 2',    lastActive: '—',          district: 'penguin',   landmark: 'Iceberg Lounge' },
    { id: 'clayface',  name: 'Clayface',     status: 'idle',   task: 'Repurposing — Phase 2',          lastActive: '—',          district: 'clayface',  landmark: 'Crime Alley' },
    { id: 'harley',    name: 'Harley Quinn', status: 'idle',   task: 'Community — Phase 2',            lastActive: '—',          district: 'harley',    landmark: 'Carnival District' },
    { id: 'catwoman',  name: 'Catwoman',     status: 'idle',   task: 'Partnerships — Phase 2',         lastActive: '—',          district: 'catwoman',  landmark: 'East End' },
    { id: 'bane',      name: 'Bane',         status: 'idle',   task: 'Scaling — Phase 3',              lastActive: '—',          district: 'bane',      landmark: 'Blackgate Prison' },
  ],

  tasks: [],
  selectedTask: null,
  taskFilter: 'WORKING',
  taskView: 'PIPELINE',
  tasksLoading: false,

  metrics: {
    ambassadorSignups: 0,
    adRpm: 0.0,
    videosPublished: 0,
    activeAgents: 3,
    pipelineHealth: 'green',
    avgWatchTime: '0:00',
  },

  voiceEnabled: true,
  isListening: false,
  alfredVoice: 'Google UK English Male',
  voiceRate: 0.9,
  voicePitch: 0.8,
  voices: [],

  setInput: (value) => set({ input: value }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setTaskFilter: (filter) => set({ taskFilter: filter }),
  setTaskView: (view) => set({ taskView: view }),
  setTasksLoading: (loading) => set({ tasksLoading: loading }),
  setIsThinking: (value) => set({ isThinking: value }),
  setConnected: (value) => set({ isConnected: value }),
  setAlfredModel: (model) => set({ alfredModel: model }),
  setActiveSection: (section) => set({ activeSection: section }),
  setVoiceEnabled: (value) => set({ voiceEnabled: value }),
  setIsListening: (value) => set({ isListening: value }),
  setAlfredVoice: (voice) => set({ alfredVoice: voice }),
  setVoiceRate: (rate) => set({ voiceRate: rate }),
  setVoicePitch: (pitch) => set({ voicePitch: pitch }),
  setVoices: (voices) => set({ voices }),

  sendMessage: async (text) => {
    const userMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    const currentMessages = get().messages;

    set({ messages: [...currentMessages, userMessage], input: '', isThinking: true });

    // Lazy-hydrate memory from backend on first interaction
    if (get().events.length === 0) {
      get().loadMemoryFromBackend();
    }

    try {
      const res = await (window.alfred?.fetch || fetch)('http://127.0.0.1:3001/api/orchestrator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: currentMessages }),
      });

      const data = await res.json();
      const agentName = data.agent || 'alfred';
      const alfredReply = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        meta: { agent: agentName, action: data.action },
      };
      set(state => ({ messages: [...state.messages, alfredReply], isThinking: false }));
    } catch (err) {
      const errorReply = { id: crypto.randomUUID(), role: 'assistant', content: 'The orchestrator seems unreachable, sir. Please ensure the backend is running.', timestamp: Date.now(), isError: true };
      set(state => ({ messages: [...state.messages, errorReply], isThinking: false }));
    }
  },

  // --- Inter-agent event bus ---------------------------------
  events: [],

  postEvent: (agent, channel, type, payload = {}) => {
    const event = {
      id: crypto.randomUUID(),
      agent,
      channel: channel || null,
      type,
      payload,
      timestamp: Date.now(),
    };
    set(state => ({ events: [event, ...state.events].slice(0, 500) }));

    (window.alfred?.fetch || fetch)('http://127.0.0.1:3001/api/memory/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, channel, type, payload }),
    }).catch(() => {});

    return event;
  },

  getEvents: (filter = {}) => {
    const { agent, channel, type, limit = 50 } = filter;
    let events = get().events;
    if (agent)   events = events.filter(e => e.agent === agent);
    if (channel) events = events.filter(e => e.channel === channel);
    if (type)    events = events.filter(e => e.type === type);
    return events.slice(0, limit);
  },

  // --- Persistent memory helpers -----------------------------
  agentMemory: {},

  remember: (agent, channel, key, value) => {
    const memKey = `${agent}|${channel || ''}|${key}`;
    set(state => ({
      agentMemory: { ...state.agentMemory, [memKey]: value },
    }));
    (window.alfred?.fetch || fetch)('http://127.0.0.1:3001/api/memory/remember', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, channel, key, value }),
    }).catch(() => {});
  },

  recall: (agent, channel, key) => {
    const memKey = `${agent}|${channel || ''}|${key}`;
    return get().agentMemory[memKey] || null;
  },

  loadMemoryFromBackend: async () => {
    try {
      const [eventsRes] = await Promise.all([
        (window.alfred?.fetch || fetch)('http://127.0.0.1:3001/api/memory/events?agent=alfred&limit=100'),
      ]);
      const data = await eventsRes.json();
      set({ events: Array.isArray(data.events) ? data.events : [] });
    } catch {
      // backend not running yet — silent
    }
  },

  loadTasks: async () => {
    try {
      const res = await (window.alfred?.fetch || fetch)('http://127.0.0.1:3001/api/worker/tasks');
      const data = await res.json();
      if (data && Array.isArray(data.tasks)) {
        set({ tasks: data.tasks });
      }
    } catch {
      // backend not running — keep existing tasks
    }
  },

  dispatchTask: async (taskId) => {
    try {
      const res = await (window.alfred?.fetch || fetch)(`http://127.0.0.1:3001/api/worker/dispatch/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data && data.ok) {
        // Refresh tasks after successful dispatch
        get().loadTasks();
      }
      return data;
    } catch {
      return { ok: false, error: 'Worker unreachable' };
    }
  },
  dispatchHeroReview: async (hero, taskId) => {
    try {
      const res = await (window.alfred?.fetch || fetch)(`http://127.0.0.1:3001/api/worker/review/${hero}/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data && data.ok) {
        get().loadTasks();
      }
      return data;
    } catch {
      return { ok: false, error: 'Worker unreachable' };
    }
  },
}));

export default useStore;




