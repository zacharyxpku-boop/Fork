# Wenai

Wenai is a focused ecommerce AI delivery system for running a 10-SKU POC from inquiry to delivery review.

It is not a generic AI tool directory and it is not positioned as a low-price self-serve SaaS. The current product is built to help a qualified merchant move through:

1. public positioning and case review
2. POC inquiry intake
3. standard delivery package generation
4. pipeline execution
5. admin follow-up and delivery review
6. contract or payment handoff on the main business site

## Product Status

Current stage: partner-ready technical repository for POC demos and controlled customer trials.

What is working:

- Public pages for positioning, pricing, cases, POC entry, and inquiry.
- Standard package generation for ecommerce delivery.
- Listing factory workflow with CSV import, decision report, experiment orchestration, delivery package, and share/report flows.
- Admin inquiry board, CRM-style fields, follow-up actions, metrics, and review state.
- Local-first fallback paths for demo and development.
- Verification through `scripts/verify.ps1`.

What still needs real production setup:

- Production API keys and model providers.
- Redis persistence for stable deployed share links, inquiries, and rate limits.
- Email provider configuration.
- Payment/contract handoff integration.
- Real customer case evidence and POC outcome data.

## Repository Scope

This repository is a cleaned product repository. It intentionally excludes:

- local `.env.local` files
- API keys, tokens, auth cookies, and private credentials
- local logs
- `.next`, `node_modules`, test output, and other generated files
- old local worktrees and agent runtime folders
- personal desktop files and unrelated assets

The source-of-truth product code is at the repository root. There is no extra `claude/wenai` wrapper directory.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/demo`
- `http://localhost:3000/poc`
- `http://localhost:3000/factory`

For local development, fill `.env.local` from `.env.example`. Do not commit `.env.local`.

## Verification

On Windows, run:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

The verification script runs focused Vitest coverage, TypeScript `noEmit`, ESLint, and `next build`.

## Important Documents

- `docs/PRODUCT_STATUS.md` - current product status
- `docs/FINAL_GOAL.md` - commercial goal and success criteria
- `docs/DELIVERABLE_GROUPS.md` - delivery grouping and review scope
- `docs/POC_DELIVERY_SOP.md` - POC delivery process
- `docs/LAUNCH_READINESS_CHECKLIST.md` - launch checklist
- `docs/PARTNER_HANDOFF.md` - partner-facing handoff note

## Commercial Boundary

This repository supports demos, POC intake, standard package generation, delivery review, and internal operations. Formal payment, contracts, invoicing, and long-term customer success process can be handled outside this repository until the commercial workflow is intentionally integrated.

