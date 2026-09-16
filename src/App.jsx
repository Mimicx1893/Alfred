import { useState } from "react"
import { useAgentFeed } from "./hooks/useAgentFeed"
import { HologramMap } from "./components/HologramMap"
import { RosterPanel } from "./components/RosterPanel"
import { StatusLegend } from "./components/StatusLegend"
import { CommsFeed } from "./components/CommsFeed"
import { assertRosterIntegrity } from "./data/agents"

if (import.meta.env.DEV) {
	assertRosterIntegrity() // throws loudly in dev if the roster ever drifts
}

export default function App() {
	const { agents, lastUpdate, getAgentPosition, runTask } = useAgentFeed()
	const [selectedId, setSelectedId] = useState(null)
	const activeCount = agents.filter((a) => a.status === "active").length

	return (
		<div style={{ fontFamily: "monospace", background: "#0a1422", color: "#cfe8f5", padding: 16 }}>
			<header style={{ marginBottom: 16 }}>
				<h1 style={{ margin: 0 }}>GOTHAM HOLOGRAM TABLE // PROJECTOR ALPHA LIVE</h1>
				<div style={{ fontSize: 12, opacity: 0.7 }}>
					LIVE FEED: ALFRED_AGENT_STATUS {lastUpdate ? `| LAST: ${new Date(lastUpdate).toLocaleTimeString()}` : ""} |{" "}
					{activeCount}/{agents.length} ACTIVE
				</div>
			</header>

			<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
				<div>
					<HologramMap agents={agents} getAgentPosition={getAgentPosition} selectedId={selectedId} onSelect={setSelectedId} />
					<div style={{ marginTop: 12 }}>
						<StatusLegend />
					</div>
				</div>
				<div>
					<CommsFeed agents={agents} />
					<RosterPanel agents={agents} runTask={runTask} />
				</div>
			</div>
		</div>
	)
}
