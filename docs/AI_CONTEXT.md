# AI Context

Last updated: 2026-06-22

## Purpose

This repository is the Wenai restaurant framework workspace. The active product direction is a restaurant store-growth AI OS for `/factory?variant=friend_trial`, not a generic marketing site, not the old ecommerce SKU workflow, and not a copy/video generation toy.

Wenai should help a restaurant owner, store manager, operator, or community lead start from one real restaurant and one featured dish, set meal, or campaign, then move through visit reason, material readiness, content tasks, publish proof, reservation/coupon/message/review recovery, manager follow-up, and evidence-backed operating review.

## Current Product Thesis

- The primary product is a restaurant operations console: task, owner, evidence, status, and next step.
- The first screen must answer “what should the store do today?” before exposing deeper AI OS tooling.
- Competitor references are translated into Wenai modules, not displayed as parity claims:
  - Kuaizi: content industrialization, script/material/cut/publish/proof/review chain.
  - Meituan Smart Manager: review watching, reports, customer/store decisions.
  - Slang / ConverseNow / Square Voice AI: phone answering, reservations, order drafts, menu Q&A, staff handoff, call summaries.
  - Owner.com: first-party site, SEO, online ordering, membership, repeat purchase.
  - SevenRooms: reservations, guest experience, CRM, reviews, member experience.
  - MarketMan: inventory, ordering, food cost, margin guardrails, waste control.
  - Otter / Deliverect / Toast / Popmenu: order/menu/review/marketing/POS data references.
- Preserve a mature B2B SaaS feel: dense, operational, clear owners, clear next actions, restrained copy, no inflated growth claims.
- Default to truthful internal capability: controlled trial runs, task packs, evidence ledgers, owner queues, public/manual store intel, publish proof, sanitized imports, review loops, and explicit gates.

## Current Main Surface

Start with:

```text
/factory?variant=friend_trial
```

The first viewport should show:

1. restaurant/dish or set-meal input
2. one primary next button for today’s store task
3. current internal work Wenai can produce
4. account / authorization / data gates
5. task owner, evidence, status, and next step

Deep AI OS capabilities, competitor mapping, provider setup, runtime contracts, and advanced audit views belong below the first screen or in advanced sections. They must not crowd out the owner-facing “today task” path.

## Six-Loop Product Spine

1. Intake: restaurant, store, dish/set meal, target guests, visit scene, offer boundary, material state, operating goal.
2. Diagnose: public sources, manual input, and sanitized summaries produce visit reasons, review risks, competitor opportunities, material gaps, and channel suggestions.
3. Create: short-video scripts, image/text notes, review replies, community scripts, group-buying copy, poster briefs, and material checklists.
4. Publish Proof: Dianping/Meituan, Xiaohongshu, Douyin, WeChat groups, and other channels must keep links, screenshots, publish time, owner, and status.
5. Recover: reservations, coupon claims, inquiries, reviews, community feedback, visits, and redemption summaries enter only as sanitized aggregate signals.
6. Review Loop: owner/manager sees what dish to push next, which selling point to change, what material to add, who follows up, and whether to scale or pause.

## Important Current Capabilities

- `restaurant-growth-loop-v1`: six-stage loop structure with input, output, proof, owner, gate, and competitor inspiration.
- `restaurant-publish-proof-ledger-v1`: publish proof board for channel owner, scheduled time, link/screenshot proof, status, blockers, and recovery signals.
- `restaurant-recover-signal-import-v1`: sanitized aggregate import for reservations, coupon claims, inquiries, reviews, community feedback, visit intent, and redemption counts.
- `restaurant-review-loop-boss-recap-v1`: boss-facing next-loop review from accepted proof and sanitized recovery signals.
- `restaurant-review-loop-share-summary-v1`: shareable one-page summary for owner/manager with conclusion, owner, evidence, and boundary.
- `restaurant-video-production-passport-v1`: script, material, cut, proof, manager review, publish proof, and recovery review passport.
- `restaurant-voice-frontdesk-gate`: staff-reviewed front-desk model for menu Q&A, reservations, order drafts, coupon questions, staff handoff, and call summaries.
- `restaurant-dish-cost-inventory-sample-v1`: MarketMan-inspired dish cost/inventory sample, paste template, and owner question list using aggregate fields only.
- `restaurant-competitor-capability-matrix-v1`: customerized competitor capability matrix that turns benchmarks into Wenai modules, owners, evidence, gates, and stop lines.

## External Gates

Treat these as required before production automation claims:

- Video provider callback and finished-video proof before claiming one-click video completion or batch smart remixing.
- Merchant platform authorization before claiming automatic publishing or backend reads on Dianping/Meituan, Xiaohongshu, Douyin, WeChat/WeCom, or similar channels.
- Telephone connection, approved menu fields, POS/order agreement, payment agreement, and staff handoff rules before claiming live phone answering or order writing.
- POS/redemption/member field dictionary and authorized source before claiming redemption, repeat purchase, or true operating attribution.
- Finance/cost/inventory/purchase/labor summaries before claiming margin, inventory optimization, discount safety, or profitability conclusions.
- Audited Wenai scale ledger before displaying Wenai-owned scale numbers.

Never print, store, or expose API keys, cookies, browser profiles, private-message text, customer phone numbers, WeChat IDs, coupon codes, order details, payment identifiers, raw POS rows, or other private data.

## Repo Boundaries

- Project path: `C:\Users\86136\Desktop\wenai-restaurant-framework`
- Git root: the project directory itself.
- Branch: `main`
- Remote: `https://github.com/zacharyxpku-boop/Fork`

Use project-scoped git commands:

```powershell
git -C C:\Users\86136\Desktop\wenai-restaurant-framework status --short --branch
git -C C:\Users\86136\Desktop\wenai-restaurant-framework diff --stat
```

## Read Order

For most work:

1. `AGENTS.md`
2. `docs/AI_CONTEXT.md`
3. `README.md`
4. `docs/CURRENT_PRODUCT_STATUS.md`
5. `docs/RESTAURANT_MIGRATION_AUDIT.md`
6. `docs/EXTERNAL_INTEGRATION_MATERIALS.md`
7. Files found with `rg` for the current task

For UI work, read the relevant component directly before editing:

- `src/components/FactoryFriendTrialExperience.tsx`
- `src/components/ManageOperationsConsoleClient.tsx`
- `src/components/VideoProductionQueueClient.tsx`
- `src/components/CastDistributionConsoleClient.tsx`
- the route under `src/app/factory/**`

## Verification

Use the repo entrypoint after implementation when scope warrants it:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

For focused restaurant changes, run narrow Vitest first, then TypeScript:

```powershell
npx.cmd vitest run __tests__\restaurant-friend-trial-surface.test.tsx __tests__\current-product-status.test.ts --reporter verbose
npx.cmd tsc --noEmit --pretty false
```

Known non-blocking warning: Next/Turbopack may warn that NFT tracing includes local restaurant ledger store files.

## Design Rule

The default should feel like a serious restaurant operations console, not a generic AI landing page. Prefer:

- operational density
- restrained colors
- clear labels
- owner/evidence/status/next-action language
- stable table and task layouts
- explicit account, authorization, data, and evidence gates

Avoid:

- fake growth numbers
- inflated skill counts on the first screen
- “AI magic” copy
- generic marketing hero sections
- claims of external automation without evidence
- raw internal terms on customer-visible pages

## Cost Rules

- Keep work scoped to this repository.
- Use `rg` before opening broad files.
- Do not scan the Desktop broadly.
- Preserve unrelated user edits.
- Keep each implementation slice small enough to verify.

## Hard Stops

- No destructive git commands.
- No dependency install unless explicitly needed and approved.
- No credential collection or secret printing.
- No private data scraping, raw customer PII, raw POS rows, cookies, tokens, or API keys.
