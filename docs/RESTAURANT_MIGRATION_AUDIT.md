# Restaurant Migration Audit

This audit records how the older Wenai ecommerce and video-factory work is being converted into a restaurant store-growth AI OS. Source projects remain read-only references; all product work stays inside `C:\Users\86136\Desktop\wenai-restaurant-framework`.

## Migration Decision

The target product is not a generic AI tool catalog, ecommerce SKU workflow, or video-generation toy. Wenai now starts from one real restaurant and one dish, set meal, or campaign, then turns restaurant intake, diagnosis, content creation, publish proof, sanitized recovery, and owner review into one accountable operating loop.

## Primary References

| Reference | Useful pattern | Restaurant conversion |
| --- | --- | --- |
| Older Wenai factory / standard-pack flows | Route contracts, standard package generation, delivery evidence, review states | Keep compatible URLs, but make the default meaning restaurant/store/dish/campaign-first |
| Older CRM / inquiry flows | Lead state, owner, SLA, follow-up notes | Convert to reservation, coupon claim, inquiry, community feedback, store-manager task and sanitized recovery summary |
| Older industrial review / handoff flows | Approval, evidence receipt, action queues | Convert to publish proof ledger, store review, manager handoff, and proof-backed next action |
| Older content marketing packs | Benchmark-to-campaign structure | Convert to local restaurant visit reason, review risk, dish material gaps, channel brief and offer guardrails |
| Clico video workflow | Brief, script, reference breakdown, storyboard, evidence pack and delivery kit | Convert to restaurant video production passport, inferred-only reference teardown, material checklist, manager review and publish proof |

## Competitor Translation

| Competitor reference | Do not copy as a claim | Wenai module to build |
| --- | --- | --- |
| Kuaizi | Do not display competitor scale as Wenai output | Content industrialization: script, material, cut plan, publish proof and review loop |
| Meituan Smart Manager | Do not imply backend access or automatic judgment | Store decision console: review risks, reports, customer signals and next manager action |
| Slang / ConverseNow / Square Voice AI | Do not claim live phone answering without connection and staff handoff rules | Voice/front-desk gate: menu Q&A, reservation/order draft, call summary and staff review |
| Owner.com | Do not claim first-party order growth without site/order/member contracts | Website, SEO, first-party order, membership and repeat-purchase opportunity checklist |
| SevenRooms | Do not claim CRM personalization without guest authorization | Reservation, guest context, review reply and member-experience task model |
| MarketMan | Do not claim true margin or inventory optimization without finance/cost summaries | Dish cost/inventory sample, reorder questions, waste signals and owner review |
| Otter / Deliverect / Toast / Popmenu | Do not claim POS/order/menu sync without contracts | Order/menu/review/marketing/POS connector matrix and data-gate checklist |

## Six-Loop Migration Map

| Loop | Existing reusable asset | Current restaurant target |
| --- | --- | --- |
| Intake | Factory friend-trial input and standard-pack prefill | Restaurant, store, dish/set meal, target guests, visit scene, offer boundary, material state and operating goal |
| Diagnose | Public profile intake, decision engine, benchmark strategy | Visit reason, review risk, competitor opportunity, material gap and channel suggestion |
| Create | Content pack, video workflow, delivery kit | Short-video script, image/text note, review reply, community script, coupon description, poster brief and material checklist |
| Publish Proof | Industrial review, action queue and distribution ledger | Dianping/Meituan/Xiaohongshu/Douyin/WeChat channel schedule with link, screenshot, publish time, owner and status |
| Recover | CRM handoff, performance import and operating data contract | Sanitized aggregate reservation, coupon claim, inquiry, review, community feedback, visit and redemption signals |
| Review Loop | Review portal, evidence pack and store-manager follow-up | Boss/manager next action: push dish, revise selling point, add material, assign owner, scale, continue verifying or pause |

## Semantic Map

| Old term | Restaurant AI OS term |
| --- | --- |
| SKU / product | restaurant / store / dish / set meal / campaign |
| Product selling point | visit reason / dish selling point / dining scenario |
| Product asset | dish photo / menu / store photo / offer image / review screenshot |
| Creative dispatch | channel publish plan with proof requirement |
| Sales lead / CRM | reservation, coupon claim, inquiry, review, community feedback and manager task |
| Performance return | sanitized aggregate recovery signal |
| Repurchase / SKU expansion | member return, store activity recap and next dish/set-meal loop |

## Do Not Migrate

- `.env*`, credentials, API keys, cookies, browser profiles, customer phone numbers, WeChat IDs, private-message text, coupon codes, order details, payment identifiers, or raw POS rows.
- `node_modules`, `.next`, logs, generated output, seed images, local desktop history, old worktrees, sessions or agent runtime folders.
- BullMQ/Redis worker orchestration, Supabase migrations, webhook handlers, billing, credits, spend caps or provider proxies unless the restaurant repo adds explicit contracts and tests.
- Claims of automatic publishing, one-click finished video, live phone answering, true redemption, repeat purchase, margin, inventory optimization, attribution or growth unless the required external gates are configured and evidenced.

## Completed Migration Slices

1. Restaurantized `modules.json`, `standard-pack-routing` and `sop-workflows`; compatibility URL keys remain, but displayed/default meaning is restaurant-first.
2. Added `restaurant-growth-loop-v1` as the six-stage product spine with input, output, proof, owner, gate and competitor inspiration.
3. Added publish proof, recover import, boss recap, share summary, video production passport, voice/front-desk gate, dish cost/inventory sample and competitor capability matrix contracts.
4. Surfaced the owner-facing friend trial at `/factory?variant=friend_trial`, with today task, restaurant/dish input, internal work, account/data gates, owner, evidence, status and next step.
5. Surfaced friend-trial extensions in video, cast and manage pages without claiming external automation.
6. Rewrote README, AI context and current status docs around the restaurant store-growth AI OS.

## Remaining Migration Work

| Priority | Work | Acceptance |
| --- | --- | --- |
| P0 | Keep migration and external-material docs aligned with the restaurant OS | Docs describe restaurant gates and competitor translation, not ecommerce/Kuaizi parity |
| P1 | Connect voice/front-desk gate to a shareable manager SOP | Summary preserves staff review, handoff and privacy boundaries |
| P1 | Upgrade the cost/inventory paste sample into a safe import page | Import continues to reject private, order-level and credential-like data |
| P2 | Replace leftover internal provider wording on customer pages with owner-facing gate language | Customer surface stays restaurant-native and does not expose runtime details |

## Remaining External Gates

Production execution still requires external evidence before stronger claims:

- No automatic publishing before merchant platform authorization and accepted proof records.
- No one-click finished video before video provider callback and finished-video proof.
- No live phone answering before telephone connection, approved menu fields, order/POS agreement, payment agreement and staff handoff rules.
- Video provider callback and finished-video proof before one-click finished video or batch smart remixing claims.
- Merchant platform authorization before automatic publishing or backend reads.
- Telephone connection, approved menu fields, order/POS agreement, payment agreement and staff handoff rules before live phone answering or order writing.
- POS/redemption/member field dictionary and authorized source before redemption, repeat purchase or attribution claims.
- Finance/cost/inventory/purchase/labor summaries before margin, inventory optimization, discount safety or profitability conclusions.
- Audited Wenai scale ledger before displaying Wenai-owned scale numbers.
