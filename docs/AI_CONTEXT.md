# AI Context

Last updated: 2026-05-24

## Purpose

This repository is the Wenai restaurant adaptation workspace. The active product direction is a restaurant AI Agent OS for the `/factory?variant=friend_trial` customer trial workbench, not a generic marketing site and not the old ecommerce SKU workflow.

The product should help a restaurant operator start from a real store, dish, set meal or local campaign, then move through visit reason, material readiness, local content planning, publish proof, reservation/coupon/private-domain follow-up and evidence-backed operating review.

## Current Product Thesis

- Match competitor-grade restaurant AI workflows such as Claw/Cloud-style skill workbenches, platform restaurant SaaS operating spines, and persistent browser/runtime agents.
- Preserve a mature B2B SaaS feel: dense, operational, clear owners, clear next actions, no inflated growth claims.
- Default to truthful internal capability: controlled trial runs, task packs, evidence ledgers, owner queues, public store intel, provider setup, callback contracts, browser runbooks, operating data contracts and AI OS audit reports.
- Do not claim auto-publish, auto-acquisition, auto-redemption or true operating analysis until provider keys, runtime health, browser profile, merchant authorization, callback secrets and POS/data contracts are configured and evidenced.

## Current Main Surface

Start with:

```powershell
/factory?variant=friend_trial
```

The first viewport should answer:

1. What restaurant task is being created.
2. Which button to click next.
3. What the system will produce.
4. Which parts work internally now.
5. Which parts require external Provider keys, browser runner, merchant authorization or data contracts.

The current first-screen shortcuts are:

- `AI OS Audit`
- `Run Trial`
- `Provider Setup`
- `Operating Insight`

These jump into `RestaurantAgentRuntimeClient`, which exposes the deeper agent/runtime capability layer.

## Important Current Capabilities

- `restaurant-ai-os-audit-report-v1`: customer-facing readiness/action report aggregating cockpit, connector matrix, public source harvest and operating insight.
- `restaurant-platform-connector-matrix-v1`: capability map for Dianping/Meituan, Xiaohongshu, Douyin, WeChat community, POS/redemption and OpenClaw/Lobu/Hermes-style runtimes.
- `restaurant-public-source-harvest-pack-v1`: governed public/manual store profile collection package.
- `restaurant-provider-sandbox-contract-v1`: acceptance contract for runtime, callback, receipt inbox and merchant/data gates.
- `restaurant-provider-launch-training-pack-v1`: launch training and provider unlock pack.
- `restaurant-operating-insight-report-v1`: evidence-backed KPIs from accepted receipts and sanitized POS aggregates only.
- `restaurant-claw-skill-workbench-v1`: Claw-style restaurant skill workbench that turns modules into executable task packs.

## External Gates

Treat these as required before production automation claims:

- Runtime URL/key: OpenClaw, Lobu, Hermes or equivalent.
- `RESTAURANT_AGENT_CALLBACK_SECRET`.
- Isolated browser profile id.
- Merchant platform authorization for Dianping/Meituan, Xiaohongshu, Douyin and WeChat/WeCom as applicable.
- POS/redemption/member data mode, field dictionary and authorized source.
- Finance/cost/margin fields before profit claims.

Never print, store or expose API keys, cookies, raw browser profiles, private-message text, customer phone numbers, WeChat IDs, order-level POS rows or other PII.

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
3. `RESTAURANT_ADAPTATION_HANDOFF.md`
4. `docs/RESTAURANT_COMPETITOR_CALIBRATION.md`
5. Files found with `rg` for the current task

For UI work, read the relevant component directly before editing:

- `src/components/FactoryFriendTrialExperience.tsx`
- `src/components/RestaurantAgentRuntimeClient.tsx`
- the route under `src/app/factory/**`

## Verification

Use the repo entrypoint after implementation:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

For focused restaurant changes, run narrow Vitest first, then full verification:

```powershell
npx.cmd vitest run __tests__\restaurant-friend-trial-surface.test.tsx __tests__\restaurant-ai-os-audit-report.test.ts
```

Known non-blocking warning: Next/Turbopack may warn that NFT tracing includes `restaurant-agent-ledger-store.ts` and `restaurant-staff-notification-audit-store.ts`.

## Design Rule

The default should feel like a serious restaurant operations console, not a generic AI landing page. Prefer:

- operational density,
- restrained colors,
- clear labels,
- owner/evidence/status/next-action language,
- stable table and task layouts,
- explicit external gates.

Avoid:

- fake growth numbers,
- inflated skill counts on the first screen,
- “AI magic” copy,
- generic marketing hero sections,
- claims of external automation without evidence.

## Cost Rules

- Keep work scoped to this repository.
- Use `rg` before opening broad files.
- Do not scan the Desktop broadly.
- Preserve unrelated user edits.
- Keep each implementation slice small enough to verify and push.

## Hard Stops

- No destructive git commands.
- No dependency install unless explicitly needed and approved.
- No credential collection or secret printing.
- No private data scraping, raw customer PII, raw POS rows, cookies or token handling.
