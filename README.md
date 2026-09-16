# Alfred — Gotham Hologram Table

Real, readable JSX source — not a minified export. This is the fix for
the root problem that broke the last build: Kilo Code needs actual
source to edit reliably, and single-file minified HTML bundles from
Meta AI never gave it that. Everything here is small enough to read
and diff normally.

## Structure

```
src/
  data/
    agents.js        — the 14-agent roster (id, name, role, home location)
    locations.js      — the 10-location coordinate table for the map
  lib/
    resolvePosition.js       — pure function: where should an agent render right now?
    resolvePosition.test.js  — real tests for it (run: node --test src/lib/resolvePosition.test.js)
  hooks/
    useAgentFeed.js   — the live listener (window.postMessage → React state)
  components/
    HologramMap.jsx   — the map image + animated agent markers
    RosterPanel.jsx   — roster cards + the Run button
    CommsFeed.jsx     — activity ticker
    StatusLegend.jsx  — status color key
  App.jsx             — wires it all together
  assets/
    gotham-isometric-map.jpeg  — the actual original map image, tracked as a real file
```

## Getting started

```bash
npm install
npm run dev
```

## What's already verified working

- All 14 agent IDs, correct and spelled consistently everywhere (`data/agents.js` has a
  runtime integrity check — `assertRosterIntegrity()` throws immediately in dev if this
  ever drifts, instead of silently shipping a wrong roster like before)
- The map image is the real original asset, tracked as an actual file — not re-embedded
  as base64 text on every export, so it can't get silently lost or swapped again
- Agent travel logic (`resolvePosition.js`) has real tests covering both requested
  behaviors:
  - a villain traveling to a dependency's location, then home once resolved
  - a hero traveling to wherever a villain **currently is** (not their home) to review
    completed work, including a cycle guard so a review loop can't hang
- Marker position transitions use the exact timing already proven to work:
  `left 900ms ease, top 900ms ease, transform 400ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms`

## What's still a stub, on purpose

- The "Run" button currently starts a placeholder task with no real `dependsOn` wired
  in — connect it to your actual task queue so it passes the real dependency chain
  (e.g. Joker's script task should pass `dependsOn: ["riddler"]`).
- `useAgentFeed`'s `runTask` is a local state update. The real system should broadcast
  a proper `ALFRED_AGENT_STATUS` message (from wherever tasks actually get dispatched)
  so the UI reflects the real backend, not just a local click.

## Wiring up real agent backend logic

Kilo Code supports **Custom Subagents** natively — markdown files at `.kilo/agents/<id>.md`,
each with its own prompt, model, and tool permissions, invoked by a primary "orchestrator"
agent. This is a good match for the actual villain/hero task logic (separate from this
UI). If `.kilo/agents/riddler.md`, `joker.md`, or `scarecrow.md` already exist from
earlier work, that pattern is the one to extend to the rest of the roster — see
`data/agents.js` for each agent's intended role.

## Before trusting any change as "done"

Ask for a diff, not a description. This project broke multiple times because a report
said something was fixed when the file hadn't actually changed. `git diff` (or
`git status` + `git log -p`) tells you the truth; a text summary doesn't.
