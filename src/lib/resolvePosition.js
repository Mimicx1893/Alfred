/**
 * Pure function version of the travel-position logic, so it can be
 * unit tested without rendering React. The useAgentFeed hook wraps
 * this with useCallback/useMemo for actual use in components.
 *
 * @param {string} agentId
 * @param {Record<string, object>} agentsById - agent.id -> agent state
 * @param {Record<string, {homeLocation: string}>} agentMeta - agent.id -> meta
 * @param {Record<string, object>} locationsById - location.id -> location
 * @param {Set<string>} visited - cycle guard, internal use
 */
export function resolveAgentPosition(agentId, agentsById, agentMeta, locationsById, visited = new Set()) {
	const agent = agentsById[agentId]
	const home = locationsById[agentMeta[agentId]?.homeLocation]
	if (!agent || visited.has(agentId)) return home

	visited.add(agentId)

	if (agent.reviewing && agentsById[agent.reviewing]) {
		return resolveAgentPosition(agent.reviewing, agentsById, agentMeta, locationsById, visited)
	}

	if (agent.dependsOn?.length) {
		const unresolved = agent.dependsOn.find((depId) => {
			const dep = agentsById[depId]
			return !dep || dep.status !== "active"
		})
		const depHome = unresolved && locationsById[agentMeta[unresolved]?.homeLocation]
		if (depHome) return depHome
	}

	return home
}
