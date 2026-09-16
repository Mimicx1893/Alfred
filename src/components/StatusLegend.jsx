const ITEMS = [
	{ label: "ACTIVE", color: "#00ff88" },
	{ label: "IDLE", color: "#ffaa00" },
	{ label: "BLOCKED", color: "#ff8800" },
	{ label: "ERROR", color: "#ff3344" },
	{ label: "LOCATION MARKER", color: "#6a8a9a" },
]

export function StatusLegend() {
	return (
		<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
			{ITEMS.map((item) => (
				<div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block" }} />
					<span style={{ fontSize: 11, letterSpacing: "0.05em" }}>{item.label}</span>
				</div>
			))}
		</div>
	)
}
