# Wenai External Integration Materials

This document is the partner-facing intake list for moving Wenai from an internal full-chain skeleton to real Kuaizi-level platform execution. Do not paste secrets into GitHub, chat, reports, browser localStorage, screenshots, or client-side config. Secrets must only enter server-side environment variables or the deployment provider secret store.

## Current Boundary

Wenai can already demonstrate the internal Compose / Create / Cut / Cast / Manage loop: creative intelligence, assets, video workflow, distribution ledger, CRM handoff, client review, RBAC/audit, and performance feedback. It cannot claim true platform-scale execution until the external packs below are configured and verified.

The 91M+ creative output and 42M+ video distribution numbers are competitor benchmarks. They must not be displayed as Wenai-owned metrics until an audited Wenai scale ledger reconciles production output, platform publish records, dedupe rules, and date ranges.

## How To Obtain Materials

Use this as the handoff path before sharing anything with Wenai. Do not send passwords, cookies, unlimited production tokens, or raw secret values in chat.

| Lane | Where to get it | Steps | Acceptance proof |
| --- | --- | --- | --- |
| Video provider | Provider console or provider integration contact | Open sandbox project; configure server token in deployment secrets; register callback URL; set quota, cost cap, and retry policy | Test task id, signed callback, and playable finished-video URL |
| Platform OAuth | TikTok/Douyin, Xiaohongshu, Kuaishou, Meta, Google, Amazon, or Shopify developer console | Create developer app; add redirect URI; grant sandbox/test account; record store, page, handle, or account id | Account reaches `oauth_ready`; Wenai can read identity, health, publish limit, and available slots |
| Ad account | Ads Manager or business manager console | Create controlled advertiser; grant least privilege; set hard budget cap; bind conversion event and stop rules | Test campaign can be read or created with spend, impression, click, and conversion return |
| Analytics sync | Platform analytics API, ads reporting API, or scheduled export | Define metrics; set attribution window; map `asset_ref` or UTM; choose sync cadence and timezone | Synced rows attach to dispatch, campaign, SKU, and brand learning without fake returns |
| Enterprise asset cloud | Object storage, CDN, enterprise drive, or cloud IAM console | Create isolated bucket/project; configure service account; define signed URL, DLP, watermark, and retention policy | Customer, operator, and distribution roles receive different allowed actions with audit events |
| Scale audit | Wenai production ledger, platform publish backend, analytics exports, and customer/auditor note | Export creative output and video publish ledgers; define dedupe rule; include date range and evidence URLs | Wenai-owned numbers reconcile to production records and platform receipts before public display |

## P0 Materials

### 1. Video Generation / Editing Provider Pack

Purpose: unlock real Cut execution for AI video analysis, smart remixing, one-click video, provider callbacks, and finished-video review.

Provide:
- provider name and sandbox account
- submit endpoint and callback endpoint requirements
- server-side provider token through the deployment secret store
- webhook signing secret
- sample task id or sandbox job
- cost limit and failure/retry policy
- licensed sample assets and usage rights

Acceptance:
- one provider-ready video workflow is submitted
- signed callback is verified
- result URL is ingested as a governed asset
- customer review link is generated
- no provider token appears in browser output, reports, tests, or Git history

### 2. Platform OAuth / Account Pool Pack

Purpose: unlock real Cast execution for multi-platform account binding, PubPal/matrix distribution, publish slots, and account health.

Provide:
- target platforms such as TikTok/Douyin, Xiaohongshu, Kuaishou, Meta, Google, Amazon, Shopify
- developer app ids and allowed redirect URLs
- sandbox or controlled account grants
- store/page/handle/account identifiers
- publish permissions and upload limits
- account health/rate-limit rules

Acceptance:
- at least one OAuth grant per target platform is completed
- grants bind to the channel account ledger
- tokens stay server-side only
- account health, publish limit, and available slots are visible before dispatch

### 3. Ad Account / Campaign Pack

Purpose: unlock real advertising execution instead of only campaign ledger planning.

Provide:
- advertiser id
- ad account id
- campaign create/read permissions
- test budget and hard spend cap
- conversion event names and pixel/server event mapping
- sandbox or controlled test campaign id
- stop rules for spend, ROAS, CPA, fatigue, and compliance

Acceptance:
- one campaign is created or validated under a spend cap
- platform campaign evidence URL is attached
- spend, clicks, orders, revenue, and asset_ref return to Wenai
- no automatic optimization is claimed before budget and rollback controls exist

## P1 Materials

### 4. Analytics Sync / Performance Return Pack

Purpose: replace manual CSV returns with scheduled platform data sync.

Provide:
- analytics API access
- account ids and metric mapping
- attribution window
- UTM or asset_ref mapping rules
- scheduled sync cadence
- sample platform report

Acceptance:
- impressions, clicks, spend, orders, revenue, and asset_ref sync into Wenai
- every measured dispatch links back to asset, platform, campaign, and SKU
- failed syncs are visible and do not create fake performance returns

### 5. Enterprise Asset Cloud / Permission Pack

Purpose: upgrade internal RBAC/audit modeling into real enterprise cloud asset enforcement.

Provide:
- object storage bucket/project
- signed URL service or CDN rules
- DLP policy
- watermark policy
- retention policy
- team role mapping
- download/share/publish enforcement rules

Acceptance:
- download, share, approve, and publish checks fail closed
- signed URLs expire correctly
- DLP, watermark, retention, and access audit evidence exists per governed asset
- customers, operators, and distribution roles receive different permission results

### 6. Audited Scale Ledger Pack

Purpose: decide when Wenai may display its own scale numbers instead of only competitor benchmarks.

Provide:
- generated creative count
- published video count
- platform/source breakdown
- dedupe rules
- date range
- source ledger export
- platform evidence or audit report

Acceptance:
- Wenai-owned numbers reconcile to production and platform ledgers
- 91M+ creative output and 42M+ video distribution remain benchmark labels until reconciled
- public UI never mixes competitor scale with Wenai-owned metrics

## Stop Lines

- No platform OAuth: keep distribution as manual/provider-gated dispatch.
- No ad account authorization: do not claim automatic ad delivery or optimization.
- No video provider callback: do not claim one-click finished video or batch smart remixing.
- No analytics sync: do not claim automatic performance learning beyond manual import.
- No object storage and signed URLs: do not claim enterprise cloud asset enforcement.
- No audited scale ledger: do not display Wenai-owned 91M+ / 42M+ scale claims.
