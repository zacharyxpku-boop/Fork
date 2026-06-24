# Restaurant Deliverable Groups

This document groups the current Wenai restaurant AI OS worktree into reviewable, testable delivery slices. It is a commit-planning and handoff guide only: do not treat it as a request to stage, commit, reset, clean, or discard files.

Last full verification:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

Result: passed. Remaining non-blocking build note: Turbopack NFT tracing warns on `next.config.ts -> src/lib/restaurant-store-memory.ts -> src/app/api/restaurant-agent/full-pack/route.ts`.

## Rules

- Keep work scoped to `C:\Users\86136\Desktop\wenai-restaurant-framework`.
- Preserve unrelated user edits.
- Do not include `.env.local`, credentials, cookies, raw customer data, generated build output, or local desktop history.
- Use `scripts\verify.ps1` before reporting any final grouped release as stable.
- Keep restaurant owner wording separate from internal provider/runtime wording: customer pages should talk about tasks, owners, evidence, status, next step, and gates.

## Group 01 - Product Fact Sources

Purpose: make future work start from the restaurant store-growth AI OS, not the older ecommerce/video-tool framing.

Status: ready for review. Focused verification passed:

```powershell
npx.cmd vitest run __tests__\restaurant-docs-fact-sources.test.ts __tests__\current-product-status.test.ts __tests__\settings-pages.test.tsx --reporter verbose
```

Suggested commit label:

```text
docs(restaurant): align AI OS fact sources and handoff groups
```

Core files:

- `README.md`
- `docs/AI_CONTEXT.md`
- `docs/CURRENT_PRODUCT_STATUS.md`
- `docs/WENAI_RESTAURANT_AI_OS_LONG_TERM_PROMPT.md`
- `docs/RESTAURANT_MIGRATION_AUDIT.md`
- `docs/EXTERNAL_INTEGRATION_MATERIALS.md`
- `docs/RESTAURANT_DELIVERABLE_GROUPS.md`
- `__tests__/restaurant-docs-fact-sources.test.ts`
- `__tests__/current-product-status.test.ts`
- `__tests__/settings-pages.test.tsx`

Acceptance:

- The docs state Wenai is a restaurant store-growth AI OS.
- Competitor references are translated into Wenai modules, not parity claims.
- External materials are restaurant-gated: channel authorization, publish proof, recovery summaries, front desk, cost/inventory, video provider, and scale audit.

## Group 02 - Friend Trial First Screen And Six-Loop Spine

Purpose: make `/factory?variant=friend_trial` answer what the store should do today.

Core files:

- `src/components/FactoryFriendTrialExperience.tsx`
- `src/app/factory/page.tsx`
- `src/lib/restaurant-growth-loop.ts`
- `src/lib/restaurant-trial-orchestrator.ts`
- `src/lib/restaurant-friend-trial-product-index.ts`
- `__tests__/restaurant-friend-trial-surface.test.tsx`
- `__tests__/restaurant-growth-loop.test.ts`
- `__tests__/factory-page.test.tsx`
- `e2e/restaurant-friend-trial.spec.ts`

Status: ready for review. Focused verification passed:

`npx.cmd vitest run __tests__\restaurant-friend-trial-surface.test.tsx __tests__\restaurant-growth-loop.test.ts __tests__\factory-page.test.tsx __tests__\restaurant-public-data.test.ts --reporter verbose`

Browser smoke verification passed against a temporary `next start` server:

`PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx.cmd playwright test restaurant-friend-trial.spec.ts --project=chromium`

Suggested commit label:

`feat(restaurant): solidify friend trial first screen and six-loop spine`

Acceptance:

- First viewport shows restaurant/dish input, primary next action, internal work, account/data gates, owner, evidence, status, and next step.
- The six-loop spine is visible and tested: Intake, Diagnose, Create, Publish Proof, Recover, Review Loop.
- Customer-visible rendering does not expose provider, runtime, callback, review token, RBAC, DLP, grant, or fail-closed language.
- Desktop and mobile browser smoke checks pass without horizontal overflow.

## Group 03 - Publish Proof, Recover, And Review Loop

Purpose: turn content output into evidence-backed store actions and next-loop decisions.

Core files:

- `src/lib/restaurant-publish-proof-ledger.ts`
- `src/lib/restaurant-recover-signal-import.ts`
- `src/lib/restaurant-review-loop-boss-recap.ts`
- `src/lib/restaurant-review-loop-share-summary.ts`
- `src/components/CastDistributionConsoleClient.tsx`
- `src/components/ManageOperationsConsoleClient.tsx`
- `__tests__/restaurant-publish-proof-ledger.test.ts`
- `__tests__/restaurant-recover-signal-import.test.ts`
- `__tests__/restaurant-review-loop-boss-recap.test.ts`
- `__tests__/restaurant-review-loop-share-summary.test.ts`
- `__tests__/cast-distribution-console-page.test.tsx`
- `__tests__/manage-operations-console-page.test.tsx`

Status: ready for review. Focused verification passed:

`npx.cmd vitest run __tests__\restaurant-publish-proof-ledger.test.ts __tests__\restaurant-recover-signal-import.test.ts __tests__\restaurant-review-loop-boss-recap.test.ts __tests__\restaurant-review-loop-share-summary.test.ts __tests__\cast-distribution-console-page.test.tsx __tests__\manage-operations-console-page.test.tsx --reporter verbose`

Suggested commit label:

`feat(restaurant): close publish proof recover and review loop`

Acceptance:

- Publish proof records owner, channel, scheduled time, link/screenshot proof, status, blocker, and recovery signal.
- Recovery accepts only sanitized aggregate signals.
- Review Loop tells the owner which dish to push, what selling point to change, what material to add, who follows up, and whether to scale, keep verifying, or pause.

## Group 04 - Create / Cut Video Production Passport

Purpose: make Kuaizi-inspired content industrialization inspectable without claiming finished-video automation.

Core files:

- `src/lib/restaurant-video-production-passport.ts`
- `src/components/VideoProductionQueueClient.tsx`
- `src/components/CreateAssetConsoleClient.tsx`
- `src/components/CreativeMonitoringConsoleClient.tsx`
- `__tests__/restaurant-video-production-passport.test.ts`
- `__tests__/video-production-queue-page.test.tsx`
- `__tests__/create-asset-console-page.test.tsx`
- `__tests__/creative-monitoring-console-page.test.tsx`

Status: ready for review. Focused verification passed:

`npx.cmd vitest run __tests__\restaurant-video-production-passport.test.ts __tests__\video-production-queue-page.test.tsx __tests__\create-asset-console-page.test.tsx __tests__\creative-monitoring-console-page.test.tsx --reporter verbose`

Suggested commit label:

`feat(restaurant): add video production passport gates`

Acceptance:

- Video work is split into script, materials, cut plan, manager review, publish proof, and recovery review.
- Without provider callback and finished-video proof, the UI stays in handoff/review mode and does not claim one-click finished video.

## Group 05 - Voice / Front-Desk Work

Purpose: turn Slang / ConverseNow / Square Voice AI references into staff-reviewed restaurant front-desk workflows.

Core files:

- `src/lib/restaurant-voice-frontdesk-gate.ts`
- `src/components/ManageOperationsConsoleClient.tsx`
- `__tests__/restaurant-voice-frontdesk-gate.test.ts`
- `__tests__/restaurant-friend-trial-surface.test.tsx`

Status: ready for review. Focused verification passed:

`npx.cmd vitest run __tests__\restaurant-voice-frontdesk-gate.test.ts __tests__\restaurant-friend-trial-surface.test.tsx __tests__\manage-operations-console-page.test.tsx --reporter verbose`

Suggested commit label:

`feat(restaurant): gate voice frontdesk staff workflows`

Acceptance:

- The front-desk gate covers menu Q&A, reservations/waitlist, order draft, coupon questions, staff handoff, and call summaries.
- The shareable SOP summary is for staff review only.
- Without phone connection, approved menu fields, order/POS agreement, payment agreement, and handoff rules, no live answering, order writing, or payment claim appears.

## Group 06 - Cost / Inventory Work

Purpose: turn MarketMan references into safe inventory, food-cost, and waste-control review workflows.

Core files:

- `src/lib/restaurant-dish-cost-inventory-sample.ts`
- `src/components/ManageOperationsConsoleClient.tsx`
- `__tests__/restaurant-dish-cost-inventory-sample.test.ts`
- `__tests__/restaurant-friend-trial-surface.test.tsx`

Status: ready for review. Focused verification passed:

`npx.cmd vitest run __tests__\restaurant-dish-cost-inventory-sample.test.ts __tests__\restaurant-friend-trial-surface.test.tsx __tests__\manage-operations-console-page.test.tsx --reporter verbose`

Suggested commit label:

`feat(restaurant): add cost inventory safety rehearsal`

Acceptance:

- The paste template supports dish, ingredient, unit, planned usage, stock, reorder point, purchase cost, waste, evidence, and owner.
- The safety import rehearsal shows pasted rows, valid rows, problem rows, reorder count, preview rows, and checks.
- It rejects private, order-level, payment, coupon, raw POS, cookie, token, and API-key-like data.
- It never claims true gross margin or inventory optimization without finance/cost/inventory/purchase/labor summaries.

## Group 07 - Competitor Matrix And Readiness Gates

Purpose: keep competitor learning inside Wenai modules and stop lines.

Core files:

- `src/lib/restaurant-competitor-capability-matrix.ts`
- `src/lib/product-readiness.ts`
- `src/lib/restaurant-benchmark-strategy.ts`
- `src/lib/restaurant-platform-operating-spine.ts`
- `src/config/modules.json`
- `__tests__/restaurant-competitor-capability-matrix.test.ts`
- `__tests__/product-readiness.test.ts`
- `__tests__/restaurant-benchmark-strategy.test.ts`
- `__tests__/restaurant-platform-operating-spine.test.ts`

Status: ready for review. Focused verification passed:

`npx.cmd vitest run __tests__\restaurant-competitor-capability-matrix.test.ts __tests__\product-readiness.test.ts __tests__\restaurant-benchmark-strategy.test.ts __tests__\restaurant-platform-operating-spine.test.ts --reporter verbose`

Suggested commit label:

`feat(restaurant): map competitors into readiness gates`

Acceptance:

- Kuaizi, Meituan Smart Manager, Slang / ConverseNow / Square Voice AI, Owner.com, SevenRooms, MarketMan, Otter, Deliverect, Toast, and Popmenu become Wenai modules, evidence, owners, gates, and next actions.
- Competitor scale numbers remain benchmarks only.

## Group 08 - Advanced Runtime And Provider-Gated Work

Purpose: keep deeper AI OS/provider/runtime work available for internal review while shielding customer pages from technical internals.

Core files:

- `src/components/RestaurantAgentRuntimeClient.tsx`
- `src/components/RestaurantProviderRunPacketPanel.tsx`
- `src/components/RestaurantProviderReceiptAcceptancePanel.tsx`
- `src/components/RestaurantProviderLiveRunGatePanel.tsx`
- `src/components/RestaurantProviderForwardableSetupDossierPanel.tsx`
- `src/components/RestaurantRunnerMissionTimelinePanel.tsx`
- `src/app/api/restaurant-agent/runtime/route.ts`
- `src/lib/restaurant-agent-*`
- `src/lib/restaurant-provider-*`
- `__tests__/restaurant-agent-*.test.ts`
- `__tests__/restaurant-provider-*.test.ts`

Status: ready for review. Focused verification passed:

`$files = rg --files __tests__ | Where-Object { $_ -match 'restaurant-(agent|provider).*\.test\.ts$' }; npx.cmd vitest run @files --reporter verbose`

Suggested commit label:

`feat(restaurant): gate advanced runtime provider work`

Acceptance:

- Internal provider/runtime work remains gated behind merchant authorization, server-side configuration, signed receipts, data contracts, and stop lines.
- Customer-facing friend-trial surfaces wrap or translate these details before rendering.

## Suggested Review Order

1. Product fact sources.
2. Friend trial first screen and six-loop spine.
3. Publish Proof, Recover, and Review Loop.
4. Voice/front-desk and cost/inventory modules.
5. Create/Cut video production passport.
6. Competitor matrix and readiness gates.
7. Advanced runtime and provider-gated work.

## Verification For Each Group

Run focused tests for the group first. Before final handoff or release, run:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

Current full verification status: passed.
