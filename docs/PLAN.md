# Fairplate — Plan for a People-Owned Food Delivery Network

> "Fairplate" is a working name. Swap it out once a trademark search is done.

## 1. Vision in one paragraph

A food delivery network that drivers, shops and customers own together. It runs on an
open protocol with open-source software that any city can deploy. Fees cover only real
costs: payment processing, infrastructure, support and insurance. A small, capped stipend
goes to the founder/steward. Every surplus goes back to the people who use the network.
Software maintenance is mostly done by Claude Code under human governance, so headcount
stays near zero and fees can stay low.

**Success means** shops keep 95%+ of the menu price, drivers keep 100% of delivery fees
and tips, customers pay less than on incumbent apps, and the founder earns a comfortable,
transparent, capped income.

---

## 2. Be precise about "decentralized"

Full on-chain decentralization (smart contracts, tokens, DAOs) looks attractive, but it
fails on the things that actually make delivery hard: refunds, disputes, fraud, food
safety, insurance, and tax law. It also adds wallet friction that drivers and shops
won't accept. The recommended design decentralizes **ownership, governance and
deployment**, not the database:

| Layer | Approach |
|---|---|
| **Ownership** | Multi-stakeholder cooperative (drivers, shops, customers, and a steward class for the founder) |
| **Software** | Open source (AGPL-3.0), so nobody can take it closed and extractive |
| **Deployment** | **Federated city nodes.** Each city (or local co-op) runs its own instance; a single reference instance is hosted for cities that don't want to self-host |
| **Protocol** | An open API so nodes interoperate, and any third-party app or shop website can place orders. Look at the **Beckn protocol / ONDC** (India's open commerce network) for compatibility rather than inventing one |
| **Money** | Regulated rails (Stripe Connect or Adyen for Platforms) so no entity holds customer funds. Cheaper local rails (Pix, UPI, FedNow/RTP, SEPA Instant) where they exist. Stablecoin payouts as an *optional* driver payout method only |

**Precedents to study and potentially partner with, not just copy:**
- **CoopCycle**: a European federation of bike-delivery co-ops sharing open-source software. This is the closest existing model.
- **ONDC / Beckn**: protocol-level decentralization of commerce at national scale.
- **Open Food Network**: open-source, co-op-governed food marketplace software.
- Platform co-ops such as **The Drivers Cooperative** (NYC rideshare) show what the governance and economics look like.

Before writing code, contact CoopCycle. Contributing to or forking their stack could
save 6–12 months.

---

## 3. Economics: where the money goes

### 3.1 Fee model (example $30 order)

| | Typical incumbent | Fairplate |
|---|---|---|
| Shop commission | 15–30% ($4.50–$9.00) | **0%** |
| Customer service fee | 10–15% ($3.00–$4.50) | **Flat $0.99 network fee** |
| Delivery fee | $0–$7 (mostly kept by platform) | **Set by distance/time, 100% to driver** |
| Tips | To driver | 100% to driver |
| Card processing (~2.9% + $0.30 ≈ $1.17) | Hidden | **Shown at cost, split between shop and customer** |

The unavoidable floor is **payment processing**, about 3% on cards. Push customers
toward cheaper rails (bank pay, local instant payment) with a small discount.

### 3.2 What the $0.99 network fee pays for (target per-order unit cost)

| Cost | Target per order |
|---|---|
| Infrastructure (hosting, maps, SMS, push) | $0.08–$0.15 |
| Support (mostly AI-first, humans for escalations) | $0.10–$0.20 |
| Insurance pool / fraud losses | $0.10–$0.20 |
| Driver ID/background checks (amortized) | $0.03 |
| Legal, accounting, compliance | $0.05–$0.10 |
| Steward (founder) stipend | see 3.3 |
| Reserve / patronage dividend | remainder |

### 3.3 Founder share, made transparent and capped

Set the founder share as a **fixed, capped income written into the co-op's bylaws**, not
as equity or a percentage that grows forever:

- **Steward stipend**: 0.5% of network GMV, **capped at 3× median monthly household
  income** for Kuala Lumpur (DOSM 2024: RM10,805, so the cap is RM32,415/month).
- **Paid only once sustainable**: 3 consecutive months of revenue covering costs plus a
  full reserve. **Nothing accrues** before then. See `docs/GOVERNANCE.md` and
  `packages/pricing/src/stipend.ts`.
- **Above the cap**, everything goes to fee reductions and patronage dividends to
  drivers, shops and customers, in proportion to their use.
- **Steward seat**: a guaranteed board seat (not control) for the founder while they
  stay active, plus a vesting "golden share" that protects the open-source licence
  and the fee caps from being changed by a future takeover.
- Publish the stipend in a public dashboard. Visible fairness is part of the marketing.

Rough scale check: the stipend reaches its cap at about RM6.5M GMV/month, roughly 200k
orders/month at RM32. Below that, it is 0.5% of GMV.

---

## 4. Product: three apps, one codebase

One **Expo / React Native** app with role-based modes (customer / driver / shop), plus a
web build for shops and customers. One codebase is far easier for Claude Code to
maintain than three.

### 4.1 Customer
- Guest checkout: phone number plus payment, no account needed to order.
- Clear price breakdown on every order (food, driver pay, network fee, processing).
- Live tracking, chat with driver/shop, one-tap reorder.
- Optional co-op membership (vote and earn patronage dividends).

### 4.2 Driver
- **Onboarding in under 15 minutes**: ID plus selfie, licence/insurance upload, background check (Checkr / Certn / local equivalent), payout account via Stripe Connect Express.
- Sees **full payout, distance and drop-off area before accepting**. No hidden pay.
- Sets their own minimum $/km and $/order. No acceptance-rate penalties and no opaque deactivation; deactivation goes through a co-op appeals process.
- Instant payouts at cost.
- Bikes, e-bikes, scooters and cars supported. Batched orders only when the driver opts in.

### 4.3 Shop
- **Onboarding in under 10 minutes**: business verification and payout via Stripe Connect.
- **Menu import with AI**: photograph a paper menu, paste a website URL, or upload an
  incumbent-app export. Claude extracts items, prices and modifiers for the owner to confirm.
- Tablet/phone order screen, a print-to-kitchen option, pause and busy modes.
- **Own-driver mode**: shops with their own drivers can use the platform for ordering
  only and pay just processing plus the network fee.
- Embeddable order widget for the shop's own website (commission-free direct orders).

### 4.4 Network / co-op tools
- Public transparency dashboard: GMV, fees collected, costs, stipend, reserve.
- Member voting (fee changes, board elections, budget) with one-member-one-vote per stakeholder class.
- Dispute resolution with AI triage and a rotating human panel of members for appeals.

---

## 5. Technical architecture

```
                ┌───────────────────────────── Open Protocol (Beckn-compatible) ─────┐
                │                                                                    │
  City Node A (co-op)            City Node B (self-hosted)          3rd-party apps / shop sites
  ┌──────────────────────┐       ┌──────────────────────┐
  │ API (TypeScript)     │◄─────►│ API                  │
  │ Postgres + PostGIS   │       │ Postgres + PostGIS   │
  │ Dispatch worker      │       │ Dispatch worker      │
  │ Realtime (WebSocket) │       │ Realtime             │
  └─────────┬────────────┘       └──────────────────────┘
            │
   Stripe Connect / local rails · Maps (OSM/Valhalla, or Mapbox) · SMS/Push · Checkr
```

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript end to end | One language for apps, API and tooling; strong agent ergonomics |
| Mobile/web | Expo (React Native) + Expo Router | One codebase, three roles, web build for free |
| API | Node + Hono or Fastify, tRPC/OpenAPI | Simple and fast; OpenAPI spec doubles as the public protocol |
| DB | Postgres + PostGIS | Geo queries for dispatch; boring and reliable |
| Realtime | WebSockets over Postgres LISTEN/NOTIFY (scale to Redis later) | Fewer moving parts |
| Jobs | pg-boss (Postgres queue) | No extra infrastructure |
| Maps/routing | OpenStreetMap + self-hosted Valhalla/OSRM | Avoids per-request Google Maps fees, which are a big hidden cost |
| Payments | Stripe Connect (destination charges) | Avoids becoming a money transmitter; handles KYC and 1099s |
| Deploy | Docker Compose for a single node; a one-click template (Fly.io / Railway / a Hetzner script) | "Easy to set up" applies to city co-ops too |
| Observability | OpenTelemetry → Grafana/Loki, Sentry | Claude Code can read these when triaging |

**Dispatch v1**: offer each order to the nearest available drivers whose minimums it
meets, first accept wins, and expand the radius over time. Keep it simple and
explainable, with no secret scoring.

**Repo layout (monorepo, pnpm + Turborepo):**
```
apps/mobile        Expo app (customer | driver | shop modes)
apps/api           HTTP + websocket API
apps/worker        dispatch, payouts, notifications
packages/protocol  OpenAPI / Beckn schemas, generated clients
packages/db        schema + migrations (Drizzle)
packages/pricing   fee + payout calculation (heavily tested, public)
infra/             docker-compose, one-click deploy, runbooks
docs/              plan, ADRs, governance, runbooks
.claude/           skills, settings, hooks for agent maintenance
```

---

## 6. Run by Claude Code, governed by humans

Claude Code can do most of the **engineering and operations** work. Don't give it
authority over **money, law, or people's livelihoods**. The design:

### 6.1 What Claude Code handles
- **Feature work and bug fixes** from GitHub issues: it opens PRs, and every PR needs CI green plus a human approval for protected paths.
- **Triage**: labels issues, reproduces bugs, links Sentry errors to code.
- **CI babysitting**: fixes failing builds and keeps dependencies updated.
- **Scheduled routines** (Claude Code Routines / cron triggers):
  - Daily: read error dashboards and open issues for regressions.
  - Weekly: dependency and security updates, draft the transparency report.
  - Monthly: cost review (infra $/order), with a written recommendation to the board.
- **Support drafting**: first-line replies and dispute summaries for human review.
- **Docs and city onboarding**: keeps the deploy guide working by testing it in CI.

### 6.2 Guardrails (non-negotiable)
- `CODEOWNERS` requires a **human** review on `packages/pricing`, payments, auth, `infra/`, and governance docs.
- Production deploys go through a pipeline with automatic rollback. Claude can propose a deploy but not bypass it.
- Claude never holds payment secrets or production DB write credentials. It gets read-only, redacted observability access.
- Fee or payout changes require a member vote. Code enforces the configured caps.
- Every Claude action is logged and linked to an issue or PR, so it's auditable.
- A human on-call rota (start with you plus 1–2 trusted co-op members) for outages and safety incidents.

### 6.3 Making the repo agent-friendly from day one
- `CLAUDE.md` with architecture, commands, conventions and red lines.
- Fast, comprehensive tests, especially property tests on pricing and payouts.
- `.claude/skills/` for recurring jobs (release, new-city onboarding, incident runbook).
- ADRs in `docs/adr/` so future sessions understand *why* things are the way they are.
- Seed data plus a one-command local stack so any session can run the full app.

---

## 7. Legal and regulatory checklist (needs a real lawyer)

This is the part most likely to sink the project, so budget for it early.

- [ ] **Entity**: multi-stakeholder co-op (US: state co-op statute or LLC with co-op operating agreement; UK: Community Benefit Society; EU: SCE or national co-op form). Alternative: steward-ownership via the Purpose Foundation.
- [ ] **Driver classification**: as co-op *members* who own the platform, drivers are on firmer ground than gig workers, but this varies by jurisdiction (e.g. California AB5/Prop 22, EU Platform Work Directive).
- [ ] **Payments**: platform model via Stripe Connect to avoid money-transmitter licensing.
- [ ] **Insurance**: occupational accident for drivers, general liability, hired/non-owned auto. Look at co-op insurance pools.
- [ ] **Food safety and alcohol**: shops stay responsible for food; alcohol delivery needs per-jurisdiction rules (consider excluding it at launch).
- [ ] **Sales tax / VAT** as a marketplace facilitator.
- [ ] **Privacy**: GDPR/CCPA-compliant location data retention (delete driver location trails after N days).
- [ ] **Securities**: member shares and patronage dividends can trigger securities rules. Co-op exemptions usually apply, but check.
- [ ] **Trademark** search on the final name.

---

## 8. Go-to-market: win one city first

Marketplaces die from the chicken-and-egg problem, not from bad code. The plan:

1. **Pick one city or neighbourhood** where you have personal connections. Dense areas with many independent restaurants and existing courier frustration are best.
2. **Recruit 20–30 independent shops** before launch. Pitch: "Keep your 25%." Offer free onboarding with AI menu import and a free website order widget.
3. **Recruit 30–50 drivers** from incumbent-app driver groups. Pitch: "100% of delivery fee and tips, you set your minimums, you own the co-op."
4. **Customers**: the shops' own regulars, given QR codes on bags and tables. Price comparisons are the marketing: "same food, $6 cheaper, driver gets paid more".
5. **Density over breadth**: don't expand the service area until median delivery time is under 35 minutes.
6. **Federate**: after one working city, package the deploy and playbook so local co-ops (or CoopCycle members) can launch their own nodes.

---

## 9. Roadmap

| Phase | Duration | Outcome |
|---|---|---|
| **0. Foundation** | Months 0–2 | Talk to CoopCycle/ONDC; choose build vs fork; legal entity and bylaws drafted; pilot city chosen; 10 shop + 20 driver letters of intent; repo scaffold with CLAUDE.md, CI, guardrails |
| **1. MVP** | Months 2–5 | Single-city node: ordering, Stripe Connect payouts, simple dispatch, live tracking, shop dashboard, AI menu import, transparency page. Closed beta with friendly shops |
| **2. Pilot launch** | Months 5–9 | Public launch in one area; support and disputes flow; co-op membership and first vote; target 1–3k orders/week; unit cost at or below network fee |
| **3. Sustainability** | Months 9–15 | Network fee covers costs plus stipend; deferred stipend repayment starts; Claude Code routines handle most maintenance; second neighbourhood |
| **4. Federation** | Months 15+ | Open protocol v1, one-click city deploy, second city run by a local co-op, cross-node discovery |

**MVP scope cut (what *not* to build first):** alcohol, scheduled orders, grocery,
batching, loyalty programs, ads (never), surge pricing (never; use transparent
distance/time pricing instead).

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Incumbents subsidize prices in your city | Compete on fairness and community ownership, not just price; shops' direct-order widget works even if delivery volume dips |
| Not enough drivers at peak | Shops' own-driver mode; driver guaranteed-minimum pilot funded from the reserve |
| Fraud (stolen cards, fake drivers) | Stripe Radar; ID verification; holds on new-account payouts |
| Founder burnout / bus factor | Claude Code handles routine engineering; documented runbooks; co-op board with real authority |
| Agent makes a damaging change | CODEOWNERS on sensitive paths, staged deploys, auto-rollback, no production write credentials |
| Governance capture | Bylaws lock fee caps and licence behind supermajority plus steward golden share |
| Regulatory change | Co-op structure and early legal counsel; join platform-co-op advocacy networks |

---

## 11. Decisions (2026-10-09)

| Decision | Choice |
|---|---|
| Pilot | **Klang Valley, Malaysia** |
| Build vs fork | **Build fresh** in TypeScript (ADR 0001) |
| Crypto | **None** (ADR 0004) |
| Team | **Solo founder** for now; founder gives up majority ownership in exchange for the entrenched stipend (`docs/GOVERNANCE.md`) |
| Stipend | **Max 3 × median income, paid only once sustainable, no accrual** |

---

## 12. Klang Valley specifics

### Market
- Incumbents: Grab, foodpanda, ShopeeFood. Shop commissions are typically around 25–30%, which is the main pitch to shops.
- Most riders use **motorcycles**. Rain is a key factor: plan for weather pauses and rider safety.
- Start dense: one area such as SS15/Subang Jaya, Petaling Jaya, Bangsar/Brickfields or Cheras, with many independent kedai makan, mamak and cafés.

### Product localisation
- Languages: **Bahasa Malaysia, English, Chinese, Tamil** from day one.
- **Halal**: show "JAKIM halal certified" only with a verified certificate. Self-declared labels (e.g. "no pork, no lard") stay visually distinct. Add halal and dietary filters.
- Payments: **DuitNow QR and FPX first** (cheapest), then e-wallets (Touch 'n Go, GrabPay, Boost) and cards. ADR 0003 covers payment provider selection.
- Ramadan: support iftar-time pre-orders and bazaar Ramadan stalls. This is a strong launch moment for small sellers.

### Pricing (pilot defaults in `packages/pricing/src/config.ts`, subject to member vote)
- Network fee **RM0.99** per order.
- Delivery: RM3.00 base + RM0.70/km + RM0.10/min, minimum RM5.00. 100% to the rider, less statutory SOCSO.
- Example: a RM30 order, 4 km/15 min, RM2 tip, DuitNow QR. The shop gets RM30.00, the rider gets RM9.30 (RM0.09 to their SOCSO account), the network gets RM0.99, and the customer pays about RM40.50.

### Legal and regulatory (Malaysia; verify every item with counsel)
- [ ] **Koperasi registration** with Suruhanjaya Koperasi Malaysia (Co-operative Societies Act 1993): check minimum founding members and whether a koperasi can operate the platform directly or via a subsidiary Sdn Bhd.
- [ ] **Gig Workers Act 2025 (Act 872)**: written service agreements, rate transparency, disputes via the Industrial Relations Department and Gig Workers Tribunal. **SOCSO**: register riders under the self-employment scheme and deduct 1.25% per job (Act 789). Confirm exact obligations.
- [ ] **Payments**: use a licensed payment provider with split payouts. Don't hold funds (Bank Negara Malaysia).
- [ ] **PDPA 2010 (2024 amendments)**: data protection officer, breach notification, retention limits on rider location.
- [ ] **SST**: treatment of network and delivery fees.
- [ ] **Insurance**: rider personal accident and third-party cover for motorcycles used for delivery. Check APAD / road transport requirements for p-hailing.
- [ ] **Food**: shops hold their own premises licences (PBT/DBKL/MBPJ etc.) and food handler training. The platform checks but doesn't certify.

---

## 13. Next steps

Phase 0 is underway:

- [x] Monorepo scaffold, `CLAUDE.md`, CI, CODEOWNERS guardrails
- [x] `packages/pricing`: order quote and steward stipend, with property tests for each promise
- [x] Governance draft and ADRs 0001–0004
- [ ] Book a lawyer (koperasi + Gig Workers Act) and a tax adviser (SST)
- [ ] Get quotes from payment providers (ADR 0003)
- [ ] Pick the pilot area; get 10 shop and 20 rider letters of intent
- [ ] `packages/db` schema (shops, menus, orders, riders, payouts) with PostGIS
- [ ] `apps/api`: order lifecycle using `@fairplate/pricing`
- [ ] `apps/mobile`: Expo skeleton with the three modes and i18n (BM/EN/ZH/TA)
