import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('restaurant docs fact sources', () => {
  it('keeps README aligned to the restaurant store-growth AI OS', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('restaurant store-growth AI OS');
    expect(readme).toContain('/factory?variant=friend_trial');
    expect(readme).toContain('Six-Loop Product Spine');
    expect(readme).toContain('Publish Proof');
    expect(readme).toContain('Review Loop');
    expect(readme).toContain('Competitor capability matrix');
    expect(readme).toContain('No provider callback');
    expect(readme).toContain('No platform authorization');
    expect(readme).toContain('No POS/redemption/member data contract');
    expect(readme).toContain('No private data storage');
    expect(readme).toContain('docs/CURRENT_PRODUCT_STATUS.md');
    expect(readme).toContain('docs/AI_CONTEXT.md');
    expect(readme).not.toContain('focused restaurant AI delivery system');
    expect(readme).not.toContain('low-price self-serve SaaS');
    expect(readme).not.toContain('http://localhost:3000/demo');
  });

  it('keeps AI_CONTEXT focused on the owner-facing first viewport instead of runtime shortcuts', () => {
    const context = readFileSync(join(process.cwd(), 'docs/AI_CONTEXT.md'), 'utf8');

    expect(context).toContain('restaurant store-growth AI OS');
    expect(context).toContain('what should the store do today?');
    expect(context).toContain('restaurant/dish or set-meal input');
    expect(context).toContain('account / authorization / data gates');
    expect(context).toContain('Six-Loop Product Spine');
    expect(context).toContain('restaurant-competitor-capability-matrix-v1');
    expect(context).toContain('Deep AI OS capabilities');
    expect(context).toContain('belong below the first screen or in advanced sections');
    expect(context).not.toContain('The current first-screen shortcuts are');
    expect(context).not.toContain('Provider Setup');
    expect(context).not.toContain('Operating Insight');
    expect(context).not.toContain('These jump into `RestaurantAgentRuntimeClient`');
  });

  it('keeps the migration audit converted into the six-loop restaurant OS', () => {
    const audit = readFileSync(join(process.cwd(), 'docs/RESTAURANT_MIGRATION_AUDIT.md'), 'utf8');

    expect(audit).toContain('restaurant store-growth AI OS');
    expect(audit).toContain('Competitor Translation');
    expect(audit).toContain('Kuaizi');
    expect(audit).toContain('Meituan Smart Manager');
    expect(audit).toContain('Slang / ConverseNow / Square Voice AI');
    expect(audit).toContain('Owner.com');
    expect(audit).toContain('SevenRooms');
    expect(audit).toContain('MarketMan');
    expect(audit).toContain('Six-Loop Migration Map');
    expect(audit).toContain('Intake');
    expect(audit).toContain('Diagnose');
    expect(audit).toContain('Create');
    expect(audit).toContain('Publish Proof');
    expect(audit).toContain('Recover');
    expect(audit).toContain('Review Loop');
    expect(audit).toContain('restaurant-growth-loop-v1');
    expect(audit).toContain('/factory?variant=friend_trial');
    expect(audit).toContain('No automatic publishing');
    expect(audit).toContain('No one-click finished video');
    expect(audit).toContain('No live phone answering');
    expect(audit).not.toContain('full five-stage spine');
    expect(audit).not.toContain('Primary ecommerce reference');
    expect(audit).not.toContain('The code migration is closed for this slice');
  });

  it('keeps external integration materials restaurant-gated instead of generic platform execution', () => {
    const materials = readFileSync(join(process.cwd(), 'docs/EXTERNAL_INTEGRATION_MATERIALS.md'), 'utf8');

    expect(materials).toContain('internal restaurant trial workbench');
    expect(materials).toContain('Intake, Diagnose, Create, Publish Proof, Recover, and Review Loop');
    expect(materials).toContain('Restaurant Trial Intake Pack');
    expect(materials).toContain('Restaurant Channel Authorization Pack');
    expect(materials).toContain('Recovery Summary Pack');
    expect(materials).toContain('Voice / Front-Desk Pack');
    expect(materials).toContain('First-Party Site / Membership Pack');
    expect(materials).toContain('Reservation / Guest Experience Pack');
    expect(materials).toContain('Cost / Inventory Pack');
    expect(materials).toContain('Video Provider Pack');
    expect(materials).toContain('Dianping/Meituan');
    expect(materials).toContain('Xiaohongshu');
    expect(materials).toContain('Douyin');
    expect(materials).toContain('No provider callback');
    expect(materials).toContain('No platform authorization');
    expect(materials).toContain('No POS/redemption/member data contract');
    expect(materials).toContain('No phone connection');
    expect(materials).toContain('No private data storage');
    expect(materials).toContain('91M+ creative output');
    expect(materials).toContain('42M+ video distribution');
    expect(materials).not.toContain('Amazon');
    expect(materials).not.toContain('Shopify');
    expect(materials).not.toContain('real Kuaizi-level platform execution');
    expect(materials).not.toContain('campaign, SKU, and brand learning');
  });

  it('keeps restaurant deliverable groups ready for split review and commits', () => {
    const groups = readFileSync(join(process.cwd(), 'docs/RESTAURANT_DELIVERABLE_GROUPS.md'), 'utf8');

    expect(groups).toContain('Restaurant Deliverable Groups');
    expect(groups).toContain('Current full verification status: passed');
    expect(groups).toContain('Group 01 - Product Fact Sources');
    expect(groups).toContain('Status: ready for review');
    expect(groups).toContain('docs(restaurant): align AI OS fact sources and handoff groups');
    expect(groups).toContain('Group 02 - Friend Trial First Screen And Six-Loop Spine');
    expect(groups).toContain('feat(restaurant): solidify friend trial first screen and six-loop spine');
    expect(groups).toContain('__tests__\\restaurant-growth-loop.test.ts');
    expect(groups).toContain('e2e/restaurant-friend-trial.spec.ts');
    expect(groups).toContain('Browser smoke verification passed');
    expect(groups).toContain('Desktop and mobile browser smoke checks pass without horizontal overflow');
    expect(groups).toContain('Group 03 - Publish Proof, Recover, And Review Loop');
    expect(groups).toContain('feat(restaurant): close publish proof recover and review loop');
    expect(groups).toContain('__tests__\\restaurant-review-loop-boss-recap.test.ts');
    expect(groups).toContain('Group 04 - Create / Cut Video Production Passport');
    expect(groups).toContain('feat(restaurant): add video production passport gates');
    expect(groups).toContain('__tests__\\restaurant-video-production-passport.test.ts');
    expect(groups).toContain('Group 05 - Voice / Front-Desk Work');
    expect(groups).toContain('feat(restaurant): gate voice frontdesk staff workflows');
    expect(groups).toContain('__tests__\\restaurant-voice-frontdesk-gate.test.ts');
    expect(groups).toContain('Group 06 - Cost / Inventory Work');
    expect(groups).toContain('feat(restaurant): add cost inventory safety rehearsal');
    expect(groups).toContain('__tests__\\restaurant-dish-cost-inventory-sample.test.ts');
    expect(groups).toContain('Group 07 - Competitor Matrix And Readiness Gates');
    expect(groups).toContain('feat(restaurant): map competitors into readiness gates');
    expect(groups).toContain('__tests__\\restaurant-competitor-capability-matrix.test.ts');
    expect(groups).toContain('Group 08 - Advanced Runtime And Provider-Gated Work');
    expect(groups).toContain('feat(restaurant): gate advanced runtime provider work');
    expect(groups).toContain("__tests__ | Where-Object { $_ -match 'restaurant-(agent|provider).*\\.test\\.ts$' }");
    expect(groups).toContain('scripts\\verify.ps1');
    expect(groups).toContain('do not treat it as a request to stage, commit, reset, clean, or discard files');
    expect(groups).toContain('Customer-visible rendering does not expose provider, runtime, callback, review token, RBAC, DLP, grant, or fail-closed language');
    expect(groups).toContain('It rejects private, order-level, payment, coupon, raw POS, cookie, token, and API-key-like data');
    expect(groups).not.toContain('8 个交付桶已经分组提交');
  });
});
