# Wenai Restaurant Framework

Wenai is a restaurant store-growth AI OS for owners, store managers, operators, and community leads. It starts from one real restaurant and one featured dish, set meal, or campaign, then turns visit reasons, content production, publish proof, reservation/coupon/message/review recovery, manager tasks, and operating review into one evidence-driven workflow.

It is not a generic AI tool directory, not a marketing hero site, and not a toy that only generates copy or videos.

## Main Entry

Start demos and customer trials at:

```text
/factory?variant=friend_trial
```

The first viewport is a restaurant operations console. It must answer, within a few seconds:

- What should the store do today?
- Which restaurant and dish/set meal are being tested?
- What can Wenai produce internally now?
- Which account, authorization, data, or proof gaps block stronger claims?
- Who owns the next action, and what evidence is required?

## Six-Loop Product Spine

1. Intake: restaurant, store, dish/set meal, target guests, visit scene, offer boundary, material state, operating goal.
2. Diagnose: public sources, manual input, and sanitized summaries become visit reasons, review risks, competitor opportunities, material gaps, and channel suggestions.
3. Create: short-video scripts, image/text notes, review replies, community scripts, group-buying copy, poster briefs, and material checklists.
4. Publish Proof: Dianping/Meituan, Xiaohongshu, Douyin, WeChat groups, and other local channels must keep links, screenshots, publish time, owner, and status.
5. Recover: reservations, coupon claims, inquiries, reviews, community feedback, visits, and redemption summaries enter only as sanitized aggregate signals.
6. Review Loop: the owner and manager see what dish to push next, which selling point to change, what material to补, who follows up, and whether to scale or pause.

## Current Capabilities

- Friend-trial workbench with restaurant/dish input, next action, internal work items, account/data gates, task owner, proof, status, and next step.
- Six-stage growth loop data model and customer-facing sections.
- Publish proof ledger for channel owner, scheduled time, link/screenshot proof, status, blockers, and recovery signals.
- Recover import model for sanitized aggregate reservations, coupon claims, inquiries, reviews, community feedback, visit intent, and redemption counts.
- Boss-facing Review Loop recap and shareable one-page summary.
- Video production passport for script, material, cut, proof, manager review, publish proof, and recovery review.
- Voice/front-desk gate for menu Q&A, reservations/waitlist, order drafts, coupon questions, staff handoff, and call summaries.
- Dish cost/inventory sample and paste template inspired by MarketMan, limited to aggregate fields and owner questions.
- Competitor capability matrix that translates Kuaizi, Meituan Smart Manager, Slang/ConverseNow/Square Voice AI, Owner.com, SevenRooms, MarketMan, and restaurant ops tools into Wenai modules, evidence, owners, and gates.

## Hard Boundaries

- No provider callback: do not claim one-click finished video, batch smart remixing, or complete video production automation.
- No platform authorization: do not claim automatic publishing to Dianping/Meituan, Xiaohongshu, Douyin, or WeChat groups.
- No POS/redemption/member data contract: do not claim true redemption, repeat purchase, margin, inventory optimization, or operating attribution.
- No private data storage: do not store phone numbers, WeChat IDs, private-message bodies, coupon codes, order details, raw POS rows, cookies, tokens, or API keys.
- Competitor scale numbers are benchmarks only. They must never be written as Wenai-owned results without an audited Wenai ledger.

## Important Documents

- `docs/CURRENT_PRODUCT_STATUS.md` - current product status and next priorities.
- `docs/WENAI_RESTAURANT_AI_OS_LONG_TERM_PROMPT.md` - long-term takeover prompt and competitor references.
- `docs/RESTAURANT_MIGRATION_AUDIT.md` - migration audit from older Wenai/Clico workflows into restaurant workflows.
- `docs/EXTERNAL_INTEGRATION_MATERIALS.md` - partner-facing material list for real external execution.
- `docs/AI_CONTEXT.md` - compact context entrypoint for future Codex work.

## Repository Scope

This repository is a cleaned product repository. It intentionally excludes:

- local `.env.local` files
- API keys, tokens, auth cookies, and private credentials
- local logs
- `.next`, `node_modules`, test output, and other generated files
- old local worktrees and agent runtime folders
- personal desktop files and unrelated assets

The source-of-truth product code is at the repository root.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- `http://localhost:3000/factory?variant=friend_trial`
- `http://localhost:3000/factory/video?variant=friend_trial`
- `http://localhost:3000/factory/cast?variant=friend_trial`
- `http://localhost:3000/factory/manage?variant=friend_trial`

For local development, fill `.env.local` from `.env.example`. Do not commit `.env.local`.

## Verification

On Windows, run:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

The verification script runs focused Vitest coverage, TypeScript `noEmit`, ESLint, and `next build`.
