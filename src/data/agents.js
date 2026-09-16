// The correct, verified 14-agent roster.
// This exact list of ids is load-bearing — every other file (listener,
// map, roster panel) depends on these ids matching exactly, lowercase.
// Do not let a regeneration silently swap this list — diff it.

export const AGENT_IDS = [
	"alfred",
	"riddler",
	"joker",
	"scarecrow",
	"penguin",
	"mrfreeze",
	"clayface",
	"harleyquinn",
	"catwoman",
	"bane",
	"poisonivy",
	"nightwing",
	"robin",
	"batgirl",
]

// role: what this agent is actually for (see README for the fuller
// business-pipeline description). kind: "hero" agents review villain
// output; everyone else is a "villain" doing pipeline work.
export const AGENT_META = {
	alfred: { name: "ALFRED", role: "Orchestrator", kind: "hero", homeLocation: "gcpd" },
	riddler: { name: "RIDDLER", role: "Research", kind: "villain", homeLocation: "miagani" },
	joker: { name: "JOKER", role: "Hooks & Scripts", kind: "villain", homeLocation: "ace" },
	scarecrow: { name: "SCARECROW", role: "Compliance & Risk", kind: "villain", homeLocation: "arkham_north" },
	penguin: { name: "PENGUIN", role: "Revenue Reporting", kind: "villain", homeLocation: "founders" },
	mrfreeze: { name: "MR FREEZE", role: "Scheduling & Publishing", kind: "villain", homeLocation: "botanical" },
	clayface: { name: "CLAYFACE", role: "Repurposing", kind: "villain", homeLocation: "blackgate" },
	harleyquinn: { name: "HARLEY QUINN", role: "Community", kind: "villain", homeLocation: "merchant" },
	catwoman: { name: "CATWOMAN", role: "Partnerships", kind: "villain", homeLocation: "miagani" },
	bane: { name: "BANE", role: "Scaling / Infra", kind: "villain", homeLocation: "arkham_south" },
	poisonivy: { name: "POISON IVY", role: "Content Generation Ops", kind: "villain", homeLocation: "bleake" },
	nightwing: { name: "NIGHTWING", role: "Hero Review", kind: "hero", homeLocation: "bleake" },
	robin: { name: "ROBIN", role: "Hero Review", kind: "hero", homeLocation: "gcpd" },
	batgirl: { name: "BATGIRL", role: "Hero Review", kind: "hero", homeLocation: "miagani" },
}

// Sanity check callable at build/dev time — throws loudly instead of
// silently rendering a wrong or incomplete roster.
export function assertRosterIntegrity() {
	const metaIds = Object.keys(AGENT_META)
	const missing = AGENT_IDS.filter((id) => !metaIds.includes(id))
	const extra = metaIds.filter((id) => !AGENT_IDS.includes(id))
	if (missing.length || extra.length) {
		throw new Error(
			`Agent roster mismatch — missing: [${missing.join(", ")}], unexpected: [${extra.join(", ")}]`,
		)
	}
	if (AGENT_IDS.length !== 14) {
		throw new Error(`Expected 14 agents, got ${AGENT_IDS.length}`)
	}
}
