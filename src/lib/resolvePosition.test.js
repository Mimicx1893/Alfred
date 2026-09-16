// Run with: node --test src/lib/resolvePosition.test.js
// (or wire into vitest/jest later — plain node:test needs no deps,
// so this runs even before the project has a test runner installed.)
import { test } from "node:test"
import assert from "node:assert"
import { resolveAgentPosition } from "./resolvePosition.js"

const agentMeta = {
	joker: { homeLocation: "ace" },
	riddler: { homeLocation: "miagani" },
	nightwing: { homeLocation: "bleake" },
}

const locationsById = {
	ace: { id: "ace", x: 26, y: 56 },
	miagani: { id: "miagani", x: 55, y: 39 },
	bleake: { id: "bleake", x: 21, y: 46 },
}

test("agent with no dependency renders at home", () => {
	const agentsById = { joker: { id: "joker", status: "idle", dependsOn: [] } }
	const pos = resolveAgentPosition("joker", agentsById, agentMeta, locationsById)
	assert.strictEqual(pos.id, "ace")
})

test("Joker depends on Riddler who is not yet active -> Joker renders at Riddler's location", () => {
	const agentsById = {
		joker: { id: "joker", status: "blocked", dependsOn: ["riddler"] },
		riddler: { id: "riddler", status: "idle" },
	}
	const pos = resolveAgentPosition("joker", agentsById, agentMeta, locationsById)
	assert.strictEqual(pos.id, "miagani", "Joker should be at Riddler's location while blocked")
})

test("Joker's dependency resolves (Riddler active) -> Joker returns home", () => {
	const agentsById = {
		joker: { id: "joker", status: "active", dependsOn: ["riddler"] },
		riddler: { id: "riddler", status: "active" },
	}
	const pos = resolveAgentPosition("joker", agentsById, agentMeta, locationsById)
	assert.strictEqual(pos.id, "ace", "Joker should be home once Riddler is active")
})

test("Nightwing reviewing Joker renders at Joker's CURRENT position, not Joker's home", () => {
	const agentsById = {
		nightwing: { id: "nightwing", status: "active", reviewing: "joker" },
		joker: { id: "joker", status: "blocked", dependsOn: ["riddler"] },
		riddler: { id: "riddler", status: "idle" },
	}
	// Joker is currently at Riddler's location (miagani), not his own
	// home (ace) — Nightwing should track him down there.
	const pos = resolveAgentPosition("nightwing", agentsById, agentMeta, locationsById)
	assert.strictEqual(pos.id, "miagani", "Nightwing should follow Joker to wherever he currently is")
})

test("reviewing cycle does not infinite-loop", () => {
	const agentsById = {
		nightwing: { id: "nightwing", status: "active", reviewing: "joker" },
		joker: { id: "joker", status: "active", reviewing: "nightwing" },
	}
	// Should terminate and fall back to one of their homes, not hang.
	const pos = resolveAgentPosition("nightwing", agentsById, agentMeta, locationsById)
	assert.ok(pos, "should return a position, not throw or hang")
})
