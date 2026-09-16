import { LOCATIONS } from "../data/locations"
import { AGENT_META } from "../data/agents"
import mapImage from "../assets/gotham-isometric-map.jpeg"

const STATUS_STYLE = {
	active: { border: "#00ff88", glow: "0 0 20px #00ff88", pulse: null },
	idle: { border: "#ffaa00", glow: "none", pulse: null },
	blocked: { border: "#ff8800", glow: "0 0 14px #ff8800", pulse: "0.8s" },
	error: { border: "#ff3344", glow: "0 0 14px #ff3344", pulse: "0.6s" },
}

// Verified working transition — position AND scale/opacity both
// animate. Losing "left"/"top" from this list is what caused agents
// to snap instantly instead of traveling across the map; keep all four.
const MARKER_TRANSITION =
	"left 900ms ease, top 900ms ease, transform 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms"

export function HologramMap({ agents, getAgentPosition, selectedId, onSelect }) {
	return (
		<div style={{ position: "relative", width: "100%", aspectRatio: "1365 / 768" }}>
			<img
				src={mapImage}
				alt="Gotham hologram table — isometric city map"
				style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
			/>

			{/* Static location markers — for hover/debug reference only.
			    The district labels themselves are baked into the image
			    pixels, these are just invisible hit-targets + tooltips. */}
			<div style={{ position: "absolute", inset: 0 }}>
				{LOCATIONS.map((loc) => (
					<div
						key={loc.id}
						className="group"
						style={{ position: "absolute", left: `${loc.x}%`, top: `${loc.y}%`, transform: "translate(-50%, -50%)" }}
						title={`${loc.label} • ${loc.x}%, ${loc.y}%`}
					/>
				))}
			</div>

			{/* Live agent markers */}
			<div style={{ position: "absolute", inset: 0 }}>
				{agents.map((agent) => {
					const pos = getAgentPosition(agent.id)
					const meta = AGENT_META[agent.id]
					const style = STATUS_STYLE[agent.status] || STATUS_STYLE.idle
					const isSelected = selectedId === agent.id
					if (!pos) return null

					return (
						<button
							key={agent.id}
							onClick={() => onSelect?.(agent.id)}
							title={`${meta.name} — ${agent.status}${agent.dependsOn?.length ? ` (waiting on ${agent.dependsOn.join(", ")})` : ""}`}
							style={{
								position: "absolute",
								left: `${pos.x}%`,
								top: `${pos.y}%`,
								zIndex: agent.status === "active" ? 20 : 10,
								transform: `translate(-50%, -50%) scale(${isSelected ? 1.25 : 1})`,
								transition: MARKER_TRANSITION,
								width: 34,
								height: 34,
								borderRadius: "50%",
								border: `2px solid ${style.border}`,
								boxShadow: style.glow,
								background: "rgba(10, 20, 34, 0.85)",
								color: style.border,
								fontSize: 10,
								fontWeight: 700,
								letterSpacing: "0.04em",
								cursor: "pointer",
								animation: style.pulse ? `alfred-pulse ${style.pulse} infinite` : "none",
							}}>
							{meta.name.slice(0, 2)}
						</button>
					)
				})}
			</div>

			<style>{`
				@keyframes alfred-pulse {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.55; }
				}
			`}</style>
		</div>
	)
}
