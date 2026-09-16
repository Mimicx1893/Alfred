import { useCallback, useEffect, useMemo, useState } from "react"
import { AGENT_IDS, AGENT_META } from "../data/agents"
import { LOCATIONS_BY_ID } from "../data/locations"
import { resolveAgentPosition } from "../lib/resolvePosition"

function initialAgents() {
	return AGENT_IDS.map((id) => ({
		id,
		status: "idle",
		task: null,
		lastActive: null,
		dependsOn: [], // agent ids this agent's current task is waiting on
		reviewing: null, // agent id this hero is currently reviewing, if any
	}))
}

/**
 * Real React state for the agent roster, updated by real
 * window.postMessage events — no external DOM patching, so there is
 * nothing for a re-render to silently stomp.
 *
 * Send updates like:
 *   window.postMessage({
 *     type: "ALFRED_AGENT_STATUS",
 *     agents: [{ id: "joker", status: "blocked", dependsOn: ["riddler"], task: "Writing script" }]
 *   }, "*")
 *
 * Partial updates are merged onto existing agent state by id — you
 * only need to send the fields that changed.
 */
export function useAgentFeed() {
	const [agents, setAgents] = useState(initialAgents)
	const [lastUpdate, setLastUpdate] = useState(null)

	useEffect(() => {
		function handleMessage(event) {
			if (event.data?.type !== "ALFRED_AGENT_STATUS") return
			const incoming = event.data.agents || []
			setAgents((prev) => {
				const byId = new Map(prev.map((a) => [a.id, a]))
				for (const update of incoming) {
					if (!byId.has(update.id)) continue // unknown id — ignore, don't crash
					byId.set(update.id, { ...byId.get(update.id), ...update })
				}
				return AGENT_IDS.map((id) => byId.get(id))
			})
			setLastUpdate(new Date().toISOString())
		}
		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])

	// Resolves where an agent should currently render on the map.
	// - A hero that's reviewing someone travels to wherever THAT agent
	//   currently is (resolved recursively, since the reviewed agent
	//   might itself be traveling).
	// - An agent blocked on a dependency travels to that dependency's
	//   home location.
	// - Otherwise, home.
	// The actual logic lives in resolvePosition.js as a pure, unit
	// tested function — this just wires it to current state.
	const getAgentPosition = useCallback(
		(agentId) => resolveAgentPosition(agentId, agentsById, AGENT_META, LOCATIONS_BY_ID),
		[agentsById],
	)

	// True while an agent is away from its home location (blocked on a
	// dependency, or a hero mid-review) — used to drive the "traveling"
	// visual state distinct from "blocked because of an error".
	const isTraveling = useCallback(
		(agentId) => {
			const pos = getAgentPosition(agentId)
			const home = LOCATIONS_BY_ID[AGENT_META[agentId]?.homeLocation]
			return pos?.id !== home?.id
		},
		[getAgentPosition],
	)

	/** Starts a task for an agent — the "Run" button action. */
	const runTask = useCallback((agentId, { task, dependsOn = [] } = {}) => {
		setAgents((prev) =>
			prev.map((a) =>
				a.id === agentId
					? {
							...a,
							task: task ?? a.task,
							dependsOn,
							status: dependsOn.length ? "blocked" : "active",
							lastActive: new Date().toISOString(),
						}
					: a,
			),
		)
	}, [])

	return { agents, agentsById, lastUpdate, getAgentPosition, isTraveling, runTask }
}
