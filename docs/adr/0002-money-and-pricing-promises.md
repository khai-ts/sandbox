# 0002: Money in integer sen; pricing promises enforced by property tests

- **Status:** Accepted
- **Date:** 2026-10-09

## Decision
- All amounts are integer sen; all rates are integer basis points.
- `packages/pricing` is pure and has no I/O. It encodes the core promises: 0% shop commission,
  riders keep 100% of delivery fees and tips minus statutory SOCSO, payment costs passed through
  at cost, and money conservation.
- The payment cost is grossed up onto the customer total, so nobody else's share shrinks.
- Statutory SOCSO (1.25% of rider delivery earnings, Gig Workers Act 2025 / Act 789) is deducted
  and remitted to the rider's own SOCSO account. Tips are excluded. **Confirm the rate and base with SOCSO before launch.**
- The pilot values in `config.ts` are placeholders until the first member vote and a signed payment contract.

## Not yet handled
SST treatment of the network and delivery fees: confirm with a tax adviser.
