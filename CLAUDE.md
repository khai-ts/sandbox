# CLAUDE.md

Fairplate (working name) is a people-owned, low-fee food delivery network, piloting in
the Klang Valley, Malaysia. It is maintained mostly by Claude Code under human governance.
Read `docs/PLAN.md` for the why and `docs/adr/` for decisions already made.

## The promise (do not break)

1. Shops keep 100% of their menu prices (0% commission).
2. Riders keep 100% of delivery fees and tips, minus only statutory SOCSO.
3. Customers pay a flat network fee plus payment costs at cost. No surge pricing, no ads, no hidden markups.
4. The steward stipend follows `packages/pricing/src/stipend.ts`: only paid once sustainable, capped at 3 × median income, never accrued.

These are enforced by property tests in `packages/pricing/test/`. If a change makes one of
them fail, the change is wrong, not the test.

## Commands

```sh
pnpm install
pnpm check        # typecheck + all tests; run before every commit
pnpm test
pnpm typecheck
```

## Conventions

- TypeScript, strict mode, ESM, pnpm workspaces. `apps/*` for deployables, `packages/*` for libraries.
- Money is always integer **sen** (`Sen` type). Rates are integer **basis points**. Never use floats for money.
- Pure functions for anything financial; I/O lives at the edges.
- Every behaviour change ships with tests. Pricing/payout changes need property tests.
- Record significant decisions as a new ADR in `docs/adr/` (copy the format of existing ones).
- User-facing text must be translatable (BM, English, Chinese, Tamil). Don't hardcode English strings in UI.

## Red lines for agents

- Never change fee values, payout logic, stipend rules or `CODEOWNERS`-protected paths without a human-approved PR. Open the PR and explain; do not merge it yourself.
- Never commit secrets, and never request production database write or payment-provider credentials.
- Never weaken, skip or delete a test to make CI pass.
- Never make decisions about individual riders, shops or customers (deactivations, refunds, disputes). Draft a summary for the human panel instead.
- Personal data (rider locations, phone numbers, IC numbers) must not appear in logs, fixtures or issues (PDPA 2010).
