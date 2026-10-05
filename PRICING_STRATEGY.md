# LLMScore — Commercial Pricing Strategy

**Date:** 2026-10-05
**Status:** Proposal (first-principles, from scratch)
**Product:** https://llmscore.io — AI search readiness audit + automated fix delivery

---

## 1. Market Analysis

### 1.1 Where LLMScore sits

The "AI search optimization" (AEO/GEO) market has split into two layers:

1. **Visibility/monitoring layer** — Profound, Scrunch, Peec, Otterly, Ahrefs Brand Radar. They answer *"how does my brand show up in AI answers?"* Priced $85–$5,000+/mo, sold to marketing/brand teams, sticky because of continuous tracking.
2. **Technical readiness layer** — almost empty. Answers *"is my site technically consumable by AI crawlers, and can I fix it?"* This is where LLMScore lives: audit → score → **shipped fixes as GitHub PRs**.

LLMScore's closest analogues are not the monitoring tools but **technical SEO auditors** (Ahrefs Site Audit, Screaming Frog £199/yr, Sitebulb ~$15–35/mo) and **developer code-quality tools** (CodeClimate, Snyk, Dependabot-style "we open the PR for you"). That matters for pricing: technical audit tools price *lower* than visibility platforms, but **fix delivery** is a premium capability nobody else ships.

Positioning statement for pricing purposes: *"LLMScore is the only tool that doesn't just tell you your AI-readiness problems — it opens the PR that fixes them."* The PR-fix capability is the monetization engine; the audit is the acquisition engine.

### 1.2 Willingness to pay

- The category has validated spend: Peec hit $4M ARR in 10 months at ~$89/mo entry; Profound raised at $1B. Budgets exist and are growing fast — AI referral traffic is the fastest-growing channel for many sites in 2025–26.
- But monitoring WTP ≠ audit WTP. A one-time audit feels like a $0–50 purchase; a *continuous readiness + automated remediation* service feels like a $20–100/mo purchase; agency/multi-site use feels like $100–500/mo.
- The fix-delivery framing converts "nice-to-know score" into "engineering time saved" — a developer-hours anchor (a day of dev time = $500–1,500) that supports $29–99/mo easily.

### 1.3 Who buys

| Segment | Who | Pain | Budget | Price sensitivity |
|---|---|---|---|---|
| Indie founders / solo devs | Builds own site, cares about AI discoverability | "Am I invisible to ChatGPT?" | Personal card, $0–30/mo | Very high; free tier critical |
| SEO managers (SMB/mid-market) | Owns organic channel, now owns "AI visibility" | Needs defensible checklist + proof of action | $50–500/mo tool budget | Medium; compares to Surfer/Ahrefs line items |
| DevRel / docs teams | Wants docs consumable by Claude/Cursor users | llms.txt, MCP-native workflows | $50–300/mo | Low-medium; loves MCP + PR workflow |
| Agencies / consultants | Audits many client sites | Needs volume audits, white-label reports | $100–1,000/mo | Low per-client; high per-site |
| Enterprise marketing | Brand mandate "be in AI answers" | Governance, SSO, many domains | $1k+/mo | Low; procurement-driven |

Primary wedge: **SEO managers + devrel at product-led SaaS companies** — they have GitHub repos (so PR fixes work), budgets, and urgency.

### 1.4 Price sensitivity summary

- Below $20/mo: impulse purchase, no approval needed.
- $29–49/mo: standard "tool stack" line item for SEO/devrel — the sweet spot.
- $99–199/mo: needs demonstrated ROI; viable for agencies/teams.
- $250+/mo: competing head-on with Profound/Scrunch — avoid until we have monitoring or enterprise features.

---

## 2. Pricing Models Evaluated

### 2.1 Credits / pay-per-audit
- **Pros:** Zero commitment; monetizes drive-by users; natural for "audit my client's site once."
- **Cons:** No recurring revenue; audits get cheap-feeling fast; doesn't monetize PR fixes well; low LTV.
- **Verdict:** Keep as a *secondary* on-ramp (one-time report unlock / agency top-ups), not the core model.

### 2.2 Flat monthly subscription (single plan, unlimited)
- **Pros:** Simple; predictable MRR.
- **Cons:** One price can't span indie ($19) and agency ($199) WTP; leaves money on the table both directions.
- **Verdict:** Too blunt alone.

### 2.3 Tiered plans (Free / Pro / Team / Enterprise)
- **Pros:** Industry-standard; segments cleanly by sites + seats + PR volume; supports expansion revenue.
- **Cons:** Needs careful gate design to avoid free-tier cannibalization.
- **Verdict:** **Core model. Recommended.**

### 2.4 Pure usage-based (per-audit / per-PR)
- **Pros:** Aligns price with value (each merged PR = value delivered); good for API/MCP metering later.
- **Cons:** Unpredictable bills deter adoption at this scale; per-PR pricing creates perverse incentive to not fix things; billing complexity for a pre-launch product.
- **Verdict:** Use *usage limits inside tiers* (PRs/mo, sites) rather than metered billing. Revisit for API in Phase 3.

### 2.5 Lifetime deal (AppSumo-style)
- **Pros:** Fast cash, fast user base, reviews.
- **Cons:** AI-crawler landscape changes monthly — lifetime access to a rapidly-evolving audit is a liability; attracts deal-hunters not ICP; caps LTV; poisons later pricing.
- **Verdict:** **Avoid.** If early cash is needed, sell a 12-month founding-member prepay instead.

### 2.6 Open core (free self-hosted audit, paid hosted + PR fixes + MCP)
- **Pros:** Developer goodwill, distribution via GitHub, trust in scoring methodology.
- **Cons:** Audit logic is the moat *input*; open-sourcing the scorer invites free clones and commoditizes the score itself. The free no-signup web audit already delivers the open-core distribution benefit without giving away the engine.
- **Verdict:** Not now. Consider open-sourcing a *lightweight CLI checker* as marketing in Phase 3.

### 2.7 Per-seat
- **Pros:** Scales with team size.
- **Cons:** Value scales with **sites and fixes**, not humans; seat-gating an audit tool encourages account sharing.
- **Verdict:** Don't price per seat. Include generous seats per tier; use seats only as a soft Team/Enterprise differentiator.

---

## 3. Recommended Pricing Structure

**Model: Tiered subscription gated on sites + PR fixes, with a genuinely useful free tier and a credit-based one-time unlock as a side door.**

### 3.1 Tiers

| | **Free** | **Pro — $29/mo** | **Agency — $99/mo** | **Enterprise — custom ($500+/mo)** |
|---|---|---|---|---|
| Audits | Unlimited basic audits, no signup | Unlimited full audits | Unlimited full audits | Unlimited |
| Sites tracked | 1 (score history) | 3 | 15 | Unlimited |
| Full per-category report | Top 3 fixes only | ✅ All issues + instructions | ✅ | ✅ |
| GitHub PR fixes | — | ✅ Up to 10 PRs/mo, 1 repo | ✅ 50 PRs/mo, 10 repos | Unlimited, SSO, policies |
| MCP server | Audit tool only (rate-limited) | ✅ Full (audit/category/fix) | ✅ Full | ✅ + API |
| Scheduled re-audits + alerts | — | Weekly | Daily | Custom |
| White-label / shareable reports | — | — | ✅ | ✅ |
| Seats | 1 | 2 | 10 | Unlimited |
| Support | Community | Email | Priority | SLA + onboarding |

**Side door — one-time credits:** $9 unlocks one full report for one URL (no subscription). 10-pack for $49. Captures "audit my client once" buyers and creates an anchor that makes $29/mo (unlimited) look obviously better.

### 3.2 Rationale

- **$29 Pro** sits far below Peec ($85) and Profound ($99), signaling "developer tool, not enterprise platform" — correct for the wedge segment — while the PR-fix value story ("one PR saves a dev-hour; the plan pays for itself with one merged fix") supports it comfortably.
- **$99 Agency** matches Profound's *starter* price while offering 15 sites + white-label — an unbeatable per-site economics story for agencies ($6.60/site vs Profound's $99/brand).
- **Free tier** stays the growth engine: unlimited no-signup audits = viral score-sharing; but *full* report + *any* PR fix requires payment. The score is free; the fix is the product.
- **PR caps, not metering:** limits are generous enough that <5% hit them; they exist to force agencies off Pro, not to nickel-and-dime.

### 3.3 Upgrade triggers (free → paid)

1. Clicking any fix beyond the top 3 → paywall with the fix blurred but the *category and impact visible*.
2. Clicking "Fix this with a PR" → always paid; this is the strongest trigger.
3. Adding a 2nd site / wanting score history + alerts.
4. MCP `llmscore_fix` tool call → upgrade prompt in-tool.
5. Score drop alert (free users get one email when their score changes) → "see what broke" requires Pro.

### 3.4 Annual pricing

- 2 months free: **Pro $290/yr** ($24.17/mo effective), **Agency $990/yr**.
- Default toggle to annual on the pricing page; show monthly price of annual plan ("$24/mo billed annually").

### 3.5 Early access vs launch pricing

- **Founding member offer (first 100–200 customers):** Pro at **$19/mo locked for life** (or $190/yr). Explicitly labeled and time-boxed. Creates urgency, rewards early believers, and 35% discount is recoverable because launch price was never anchored lower publicly.
- At launch: $29/$99 in effect; founding members grandfathered. Never discount below founding price again.

---

## 4. Revenue Projections

Assumptions: 1,000 free users month 1, 3% free→paid conversion baseline, blended ARPU at launch mix ≈ 85% Pro / 15% Agency → **~$39.50/mo blended** ($29×0.85 + $99×0.15). Early-access ARPU ≈ $31. Monthly churn 5% (realistic), free-user growth compounding.

| Scenario | Free growth | Conversion | Month 3 MRR | Month 6 MRR | Month 12 MRR |
|---|---|---|---|---|---|
| **Conservative** | +15%/mo (→ ~4,650 by M12) | 2% | ~$1,000 (≈32 paid) | ~$1,900 (≈60) | ~$3,400 (≈105) |
| **Realistic** | +30%/mo (→ ~18,000 by M12) | 3% | ~$2,200 (≈65 paid) | ~$5,500 (≈155) | ~$14,000 (≈380) |
| **Optimistic** | +50%/mo (viral score-sharing; → ~60,000 by M12) | 4% + 20% agency mix | ~$5,000 (≈130 paid) | ~$16,000 (≈380) | ~$55,000 (≈1,200) |

Notes:
- Realistic case ≈ **$170k ARR run-rate at month 12** — credible for a PLG dev tool in a hot category (Peec's trajectory shows the category supports much more).
- Credits side door adds est. 3–8% on top (not modeled).
- Biggest lever is free-user growth (shareable scores, MCP distribution, "Scored by LLMScore" badges), not conversion rate.

---

## 5. Monetization Roadmap

**Phase 1 — Early access (now → launch)**
- Free: unlimited audits, top-3 fixes, 1 tracked site.
- Paid: Founding Pro $19/mo (full reports, PR fixes, MCP) — single paid tier, keep it simple.
- Goal: 100 founding customers + pricing signal (watch where people balk).

**Phase 2 — Launch**
- Full tier structure: Free / Pro $29 / Agency $99. Annual toggle. $9 one-time report credits.
- Grandfather founders. Add white-label reports to Agency.
- Goal: $10k MRR, validated Agency demand.

**Phase 3 — Scale (6–12 months post-launch)**
- **Enterprise** ($500–2,000/mo): SSO, unlimited domains, audit API, SLA, custom scoring policies, GitHub Enterprise/GitLab support.
- **API access** (metered, usage-based — this is where per-audit pricing belongs): platforms embedding LLMScore scores.
- **White-label** for agencies/hosting providers (Vercel/Netlify/Webflow partnerships: "AI-readiness score" built into deploy pipeline).
- Optional: open-source a minimal CLI checker as top-of-funnel.

---

## 6. Competitive Comparison

| | **LLMScore** | **Profound** | **Scrunch AI** | **Peec AI** | **Otterly.AI** |
|---|---|---|---|---|---|
| Entry price | **Free / $29/mo** | $99/mo | ~$250–300/mo | ~$85–89/mo | low $100s/mo |
| Top tier | $99 / custom ent. | $1,499–5,000+ | Enterprise custom | Scales up | — |
| Free, no-signup audit | ✅ | ❌ | ❌ | ❌ (trial) | ❌ (trial) |
| Technical readiness audit (llms.txt, JSON-LD, robots, extractability) | ✅ 9 categories | Partial | Partial | ❌ | ❌ |
| AI answer/visibility monitoring | ❌ (roadmap) | ✅ core | ✅ core | ✅ core | ✅ core |
| **Ships fixes as GitHub PRs** | ✅ **unique** | ❌ | ❌ | ❌ | ❌ |
| MCP server / dev toolchain | ✅ unique | ❌ | ❌ | ❌ | ❌ |
| Buyer | Devs, SEO, devrel | Brand/marketing | Enterprise mktg | Marketing | SMB marketing |

Pitch: *"Monitoring tools tell you you're losing. LLMScore opens the PR that fixes it — starting free, at a quarter of their price."*

---

## 7. Psychological Pricing

- **Anchoring:** Pricing page shows Agency ($99) and "Enterprise — custom" to the right of Pro ($29); competitor context ("tools in this category start at $85–250/mo") in FAQ. The $9 one-time report makes $29/mo-unlimited feel like obvious value.
- **Decoy:** The $9 single-report credit is a deliberate decoy — 4 reports/month = Pro price, with none of the PR fixes. It exists to be rationally rejected. Agency's 15-sites-at-$6.60/site makes Pro's 3 sites push multi-site users up.
- **Dev-hours reframe:** Every PR-fix screen shows "estimated manual effort: ~2 hrs" — the plan pays for itself per merged PR.
- **Conversion triggers:** Blur-but-tease locked fixes (show impact score, hide instructions); upgrade prompt at moment of highest intent (clicking "Fix with PR"); score-drop alert emails.
- **Price endings:** $29 / $99 — charm pricing is standard and expected in dev/SEO tools (Profound $99, Peec $89); round numbers ($30) signal premium/enterprise which we don't want at entry. Founding $19 maximizes "impulse" feel. Annual shown as effective monthly ($24/mo).
- **Loss aversion:** Free tier tracks score history for 1 site; downgrade warning: "You'll lose history and open PR capability."
- **Urgency without sleaze:** Founding pricing capped by count ("137/200 founding spots taken"), not fake timers.

---

## Key Recommendations (TL;DR)

1. **Tiered subscription**: Free / **Pro $29/mo** / **Agency $99/mo** / Enterprise custom. Gate on sites + PR fixes + full reports, not seats or metered audits.
2. **Free audits forever, no signup** — the score is marketing; **the PR fix is the product** and is always paid.
3. **$9 one-time report** as side door + decoy.
4. **Founding member Pro at $19/mo locked for life**, capped at 200.
5. **No lifetime deals, no open-sourcing the scorer, no per-seat pricing.**
6. Annual = 2 months free, default toggle.
7. Realistic path: ~$14k MRR (~$170k ARR run-rate) at month 12; the lever is free-user growth via shareable scores and MCP distribution.
