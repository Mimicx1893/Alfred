import { useState } from "react"
import { AGENT_META } from "../data/agents"

const FILTERS = ["all", "active", "idle", "blocked", "error"]

export function RosterPanel({ agents, runTask }) {
	const [filter, setFilter] = useState("all")
	const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? agents.length : agents.filter((a) => a.status === f).length]))
	const visible = filter === "all" ? agents : agents.filter((a) => a.status === filter)

	return (
		<div>
			<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
				{FILTERS.map((f) => (
					<button key={f} onClick={() => setFilter(f)} style={{ opacity: filter === f ? 1 : 0.6 }}>
						{f.toUpperCase()} ({counts[f]})
					</button>
				))}
			</div>

			<h3>FULL ROSTER</h3>
			{visible.map((agent) => {
				const meta = AGENT_META[agent.id]
				return (
					<div key={agent.id} style={{ border: "1px solid #333", padding: 12, marginBottom: 8 }}>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<strong>{meta.name}</strong>
							<span>{agent.status.toUpperCase()}</span>
						</div>
						<div style={{ fontSize: 12, opacity: 0.7 }}>{meta.role}</div>
						<div style={{ margin: "8px 0" }}>{agent.task || "— IDLE STANDBY —"}</div>
						{agent.dependsOn?.length > 0 && (
							<div style={{ fontSize: 11, color: "#ff8800" }}>WAITING ON: {agent.dependsOn.join(", ").toUpperCase()}</div>
						)}
						{agent.status === "idle" && (
							<button
								onClick={() =>
									runTask(agent.id, {
										task: `${meta.role} task`,
										// Pass real dependsOn ids here when wiring this up to
										// an actual task queue — this is a placeholder trigger.
									})
								}>
								RUN
							</button>
						)}
					</div>
				)
			})}
		</div>
	)
}
