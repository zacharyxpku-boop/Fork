# Restaurant Adaptation Handoff

Use this folder as a copied starting point from the Wenai ecommerce AI workflow product.

Source product snapshot:
- Original repo: `C:\Users\86136\Desktop\wenai-clean-partner`
- New working copy: `C:\Users\86136\Desktop\wenai-restaurant-framework`
- Copied without `.git`, `node_modules`, `.next`, build output folders, and `.env*` files.
- Framework: Next.js / React / Tailwind.
- Install dependencies with `npm install` if needed.
- Run locally with `npm run dev`.
- Verify with `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1`.

Current product shape:
- Wenai is currently an ecommerce AI workflow product, not a generic AI tools directory.
- The most important current surface is `/factory?variant=friend_trial`.
- The recent direction changed the friend-trial UI from a fake-metrics demo dashboard into a customer-usable product workspace.
- The first screen now centers on a task flow: enter a product, choose goal/channels, confirm selling points, generate content drafts, arrange publishing, and hand follow-up tasks to sales.
- Important component: `src/components/FactoryFriendTrialExperience.tsx`.
- Friend-trial routes/pages to inspect:
  - `src/app/factory/page.tsx`
  - `src/components/CreativeMonitoringConsoleClient.tsx`
  - `src/components/CreateAssetConsoleClient.tsx`
  - `src/components/VideoProductionQueueClient.tsx`
  - `src/components/CastDistributionConsoleClient.tsx`
  - `src/components/ManageOperationsConsoleClient.tsx`

What to preserve conceptually:
- Mature B2B SaaS feel.
- Customer can directly understand what to do next.
- Fewer fake metrics; avoid invented growth numbers.
- Use states, tasks, evidence, owners, and next actions instead of vanity dashboards.
- Keep a clear workflow spine.
- Do not claim real platform automation unless OAuth/API/storage/data integrations exist.

Restaurant adaptation target:
- Reframe ecommerce "product/SKU growth" into restaurant "dish/store growth".
- Possible workflow spine:
  1. Enter restaurant and dish/campaign.
  2. Clarify audience, dining scenario, offer, and margin-sensitive constraints.
  3. Generate menu item selling points, short video scripts, poster/coupon copy, and platform posts.
  4. Arrange channels: Dianping, Xiaohongshu, Douyin, WeChat, local community groups.
  5. Track real proof: posted link/screenshot, reservations, coupon claims, private messages, store visits.
  6. Hand hot leads or repeat-order opportunities to store manager / ops / sales.
- Replace ecommerce language:
  - SKU -> dish / set meal / store offer
  - product selling point -> dish selling point / dining scenario
  - content matrix -> local store content plan
  - publishing proof -> posted link / screenshot / campaign record
  - sales lead -> reservation / inquiry / coupon claim / private message / group follow-up
  - CRM handoff -> store manager follow-up / private-domain customer follow-up

Suggested first pass:
- Rename the friend-trial workspace to a restaurant growth workspace.
- Update first-screen inputs to restaurant name, dish/offer, target customer, channel.
- Remove any ecommerce-only numbers or claims.
- Keep tests updated around customer-understandable copy and no fake-metric claims.
