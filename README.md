# AEGIS

**Adaptive Autonomy Infrastructure for AI Agents**

AEGIS is governance infrastructure that sits between an autonomous AI agent's intent and real-world consequence. Instead of a static allow/deny permission, it determines how much autonomy an agent should receive for a specific action, right now, based on evidence, risk, competence, and reversibility -- then enforces, monitors, and recovers from that decision.

Start here: [handbook/aegis-master-context.md](handbook/aegis-master-context.md).

## Repository Layout

```text
handbook/          Canonical specifications (SPEC-000 through SPEC-018),
                    architecture decisions, research thesis, spec roadmap.
AGENTS.md          Operating contract for any AI coding agent working here.
packages/          Shared TypeScript packages implementing spec-defined
                    domain contracts (starting with @aegis/contracts, the
                    Canonical Action Model and Agent Identity types).
apps/               Deployable applications (api, worker, ...).
research/           Benchmark scenarios and research experiments (SPEC-018).
infrastructure/     Deployment/infra configuration.
```

## Before You Read Any Further

Read [AGENTS.md](AGENTS.md) first, then [handbook/aegis-master-context.md](handbook/aegis-master-context.md), then [handbook/AEGIS-ARCHITECTURE-DECISIONS.md](handbook/AEGIS-ARCHITECTURE-DECISIONS.md). Every specification is a cumulative contract -- see `AGENTS.md` for what that means before editing anything under `handbook/`.

## Development

This is an npm-workspaces monorepo.

```bash
npm install
npm run build --workspaces --if-present
npm run test --workspaces --if-present
```

### Packages

- [`packages/contracts`](packages/contracts) -- `@aegis/contracts`: the Canonical Action Model (SPEC-001) and Agent Identity (SPEC-002) domain types, canonical/material fingerprinting, materiality evaluation, and lifecycle state machine. This is the foundational package every other component depends on.

## Status

Design phase (SPEC-000 through SPEC-018) is complete. Implementation is underway, starting with `@aegis/contracts` per the V1 Boundary Philosophy (`handbook/SPEC-000.md` SS65): build one benchmark domain (autonomous customer refunds) deeply before broadening scope.
