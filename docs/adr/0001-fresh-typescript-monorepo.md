# 0001: Build fresh as a TypeScript monorepo

- **Status:** Accepted
- **Date:** 2026-10-09

## Context
We could fork CoopCycle (PHP/Symfony) or build fresh. The codebase will be maintained mostly
by Claude Code, so it needs one language, fast tests and a simple local setup.

## Decision
Build fresh: a pnpm workspace monorepo in strict TypeScript. One Expo app with customer/rider/shop
modes, a Node API, Postgres + PostGIS. CoopCycle remains a reference and potential partner for
the open protocol.

## Consequences
More code to write up front. In exchange, one language end to end, mobile-first UX, and a codebase
designed for agent maintenance.
