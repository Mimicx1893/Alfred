import { AGENT_META } from "../data/agents"

export function CommsFeed({ agents }) {
	const entries = agents
		.filter((a) => a.lastActive)
		.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
		.slice(0, 8)

	return (
		<div>
			<h3>COMMS FEED</h3>
			{entries.length === 0 && <div style={{ opacity: 0.5, fontSize: 12 }}>No activity yet.</div>}
			{entries.map((a) => (
				<div key={a.id} style={{ fontSize: 12, marginBottom: 4 }}>
					<span style={{ opacity: 0.6 }}>
						{new Date(a.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</span>{" "}
					<strong>{AGENT_META[a.id].name}</strong> {a.task || a.status}
				</div>
			))}
		</div>
	)
}
