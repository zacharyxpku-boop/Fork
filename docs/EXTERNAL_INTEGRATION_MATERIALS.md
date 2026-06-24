# Wenai External Integration Materials

This document is the partner-facing intake list for moving Wenai from an internal restaurant trial workbench to real restaurant store-growth execution. It is a gate checklist, not a promise that Wenai already has automatic publishing, live voice answering, true attribution, or profitability analysis.

Do not paste secrets into GitHub, chat, reports, browser localStorage, screenshots, or client-side config. Secrets must only enter server-side environment variables or the deployment provider secret store.

## Current Boundary

Wenai can demonstrate the internal six-loop restaurant workflow: Intake, Diagnose, Create, Publish Proof, Recover, and Review Loop. It can produce task packs, content drafts, publish-proof ledgers, sanitized recovery imports, manager follow-up, video production passports, voice/front-desk gates, dish cost/inventory samples, and boss-facing review summaries.

Wenai cannot claim real external execution until the packs below are configured and verified. Kuaizi scale numbers such as `91M+ creative output` and `42M+ video distribution` are competitor benchmarks only; they must not be displayed as Wenai-owned metrics until an audited Wenai scale ledger reconciles production output, platform publish records, dedupe rules, date ranges, and evidence URLs.

## How To Obtain Materials

Use this as the handoff path before sharing anything with Wenai. Do not send passwords, cookies, unlimited production tokens, private customer records, raw message bodies, coupon codes, order details, payment identifiers, or raw POS rows in chat.

| Lane | Where to get it | Steps | Acceptance proof |
| --- | --- | --- | --- |
| Restaurant identity | Owner, store manager, brand operator | Confirm restaurant name, branch, address, cuisine, main dish/set meal, visit scene, offer boundary and material state | Signed or written intake summary with owner and update time |
| Channel accounts | Dianping/Meituan, Xiaohongshu, Douyin, WeChat group/admin, store website | Grant sandbox or least-privilege merchant/account access; record account id, owner, publish rules and screenshot requirements | Account reaches authorized test state; Wenai can record identity, limits and proof slots |
| Publish proof | Store operator or channel owner | Define required link, screenshot, publish time, owner and status for each channel | One manual proof record per test channel is accepted into the publish ledger |
| Recovery summaries | Store manager, community lead, front desk, cashier export owner | Provide sanitized aggregate reservations, coupon claims, inquiries, reviews, community feedback, visit intent and redemption summaries | Sample aggregate import passes validation without private fields |
| Voice/front desk | Phone system, staff lead, menu owner, POS/order owner | Provide phone connection path, approved menu fields, reservation/waitlist rules, order draft rules and staff handoff policy | Test call summary is staff-reviewed and does not write real orders or payments |
| Cost/inventory | Kitchen lead, purchasing, finance or inventory tool | Provide dish ingredient list, unit, planned usage, stock, reorder point, purchase cost, waste count and evidence | Sample cost/inventory sheet produces owner questions, not true margin claims |
| Video provider | Video provider console or integration contact | Open sandbox project; configure server-side token in deployment secrets; register callback URL; set quota, cost cap and retry policy | Test task id, signed callback and playable finished-video URL |
| Scale audit | Wenai production ledger, platform publish backend, analytics export and auditor note | Export creative output and publish ledgers; define dedupe rule; include date range and evidence URLs | Wenai-owned numbers reconcile to production records and platform receipts before public display |

## P0 Materials

### 1. Restaurant Trial Intake Pack

Purpose: make the first run start from a real store task, not from a generic prompt.

Provide:
- restaurant and branch name
- address or service area
- featured dish, set meal or campaign
- target guests and visit scene
- offer boundary and exclusion rules
- existing photos, menu screenshots, review screenshots and store notes
- owner, manager, operator and community lead contacts by role name only

Acceptance:
- `/factory?variant=friend_trial` can prefill the restaurant/dish task
- the first viewport shows today task, owner, evidence, status and next step
- the trial does not require private customer data

### 2. Restaurant Channel Authorization Pack

Purpose: unlock real Publish Proof beyond manual planning.

Provide:
- Dianping/Meituan merchant or operator permission
- Xiaohongshu, Douyin and WeChat group/admin test permissions where relevant
- channel owner and backup owner
- publish rule, review rule and screenshot requirement per channel
- rate limit, restricted category and rollback policy

Acceptance:
- at least one target channel has authorized test access or a manual proof owner
- publish proof records include link, screenshot, publish time, owner, status and blocker
- no automatic publishing is claimed until authorization and proof are accepted

### 3. Recovery Summary Pack

Purpose: replace anecdotal feedback with sanitized aggregate signals.

Provide:
- reservation count
- coupon claim count
- inquiry count
- review count and rating summary
- community feedback count and themes
- visit intent count
- redemption or visit summary if legally and operationally available
- source, owner and update time for each summary

Acceptance:
- aggregate import passes validation
- no phone number, WeChat ID, private-message body, coupon code, order detail, payment identifier or raw POS row is stored
- Review Loop can say what to push, revise, add, assign, scale, continue verifying or pause based on evidence

### 4. Voice / Front-Desk Pack

Purpose: unlock staff-reviewed phone reception, reservation, order draft and menu Q&A work.

Provide:
- phone connection path or recording/sandbox method
- approved menu fields and unavailable-item policy
- reservation, waitlist and queue rules
- order draft boundaries and staff takeover triggers
- call summary template
- POS/order/payment agreement if any real writing is expected

Acceptance:
- Wenai can generate a staff-reviewed call summary or order draft
- staff handoff is explicit
- no live answering, real order writing or payment claim appears before the required connection and contracts exist

## P1 Materials

### 5. First-Party Site / Membership Pack

Purpose: evaluate Owner.com-style first-party growth opportunities without claiming growth attribution too early.

Provide:
- store website or landing page access
- SEO target locations and dishes
- online ordering boundary
- membership or repeat-visit program fields
- opt-in marketing rules

Acceptance:
- Wenai can produce a first-party opportunity checklist and owner tasks
- no first-party order growth or membership lift is claimed without order/member data contracts

### 6. Reservation / Guest Experience Pack

Purpose: evaluate SevenRooms-style reservation, guest context and member-experience work.

Provide:
- reservation source summary
- table/waitlist rules if available
- review reply rules
- guest preference categories as aggregate tags only
- SMS/email consent boundary if applicable

Acceptance:
- Wenai can produce manager tasks for reservation, review reply and guest experience
- no guest-level personalization is claimed without authorization and consent evidence

### 7. Cost / Inventory Pack

Purpose: evaluate MarketMan-style inventory, ordering, food cost and waste control.

Provide:
- dish ingredient list
- unit and planned usage
- current stock and reorder point
- purchase cost summary
- waste count or waste reason summary
- source evidence and owner

Acceptance:
- Wenai produces owner questions and material gaps
- no true gross margin, inventory optimization or profitability conclusion is claimed without finance/cost/inventory/purchase/labor summaries

### 8. Video Provider Pack

Purpose: unlock Kuaizi-style content industrialization only after real provider proof exists.

Provide:
- provider name and sandbox account
- submit endpoint and callback endpoint requirements
- server-side provider token through deployment secrets
- webhook signing secret
- sample task id or sandbox job
- cost limit and failure/retry policy
- licensed sample assets and usage rights

Acceptance:
- one provider-ready video workflow is submitted
- signed callback is verified
- result URL is ingested as a governed asset
- customer review link is generated
- no provider token appears in browser output, reports, tests or Git history

## Stop Lines

- No provider callback: do not claim one-click finished video, batch smart remixing or complete video production automation.
- No platform authorization: do not claim automatic publishing to Dianping/Meituan, Xiaohongshu, Douyin or WeChat groups.
- No POS/redemption/member data contract: do not claim true redemption, repeat purchase, margin, inventory optimization or operating attribution.
- No phone connection, approved menu fields, order/POS agreement, payment agreement and staff handoff rules: do not claim live phone answering or order writing.
- No finance/cost/inventory/purchase/labor summaries: do not claim profitability, true gross margin or inventory optimization.
- No audited scale ledger: do not display Wenai-owned `91M+` or `42M+` scale claims.
- No private data storage: do not store phone numbers, WeChat IDs, private-message bodies, coupon codes, order details, raw POS rows, cookies, tokens or API keys.
