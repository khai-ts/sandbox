# Governance (draft, for the founding bylaws)

> Draft intent for a Malaysian lawyer and Suruhanjaya Koperasi Malaysia (SKM) to turn
> into registrable bylaws. Nothing here is legal advice or legally binding yet.

## Ownership

- **Legal form:** a koperasi registered under the Co-operative Societies Act 1993 (SKM).
  Fallback if a koperasi can't hold the platform (e.g. licensing or membership limits):
  a Sdn Bhd majority-owned by the koperasi, with the protections below in its constitution.
- **Member classes:** riders, shops, customers, and a single steward membership held by the founder.
- **One member, one vote** within each class. Board seats are allocated per class so that
  no single class (including the steward) controls the board.
- **The founder gives up majority ownership.** The founder holds one steward membership and
  no special economic rights beyond the stipend below.

## Steward stipend (entrenched)

Implemented exactly in `packages/pricing/src/stipend.ts`:

1. Paid **only once the network is sustainable**: 3 consecutive months where network
   revenue covers operating costs, and the reserve is at its target.
2. **Nothing accrues** before that. Unqualified months are never paid back.
3. Monthly amount = the smallest of: 0.5% of the month's GMV; **3 × the latest DOSM median
   monthly household income for W.P. Kuala Lumpur** (2024: RM10,805, so the cap is RM32,415/month);
   or the month's surplus after the reserve top-up.
4. Surplus above the stipend goes to the patronage pool (fee cuts or member dividends).
5. Published monthly on the public transparency page.

**Entrenchment:** while the founder remains an active steward, the stipend clause can only
be changed with the steward's consent *and* a two-thirds vote of each member class.
Members can't remove the stipend unilaterally, and the founder can't raise it unilaterally.
"Active" and the hand-over terms if the founder steps away need definition with counsel.

## Other entrenched clauses (two-thirds of each class to change)

- Software stays open source (AGPL-3.0).
- Shop commission stays 0% on menu prices; riders keep 100% of delivery fees and tips.
- No sale of the platform or member data to a for-profit acquirer.

## Ordinary decisions (simple majority / board)

- Network fee and delivery fee parameters (`packages/pricing/src/config.ts`) within the entrenched rules.
- Budget, reserve target, service-area expansion.
- Appeals panel for rider/shop deactivations and disputes (human members, never automated).
