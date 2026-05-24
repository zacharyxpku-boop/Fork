# Partner Handoff

This repository is the cleaned Wenai product codebase prepared for partner review.

## What This Product Is

Wenai is a 10-SKU ecommerce AI POC delivery system. Its job is to take a qualified merchant from inquiry to a reviewable delivery package, then support a business decision about whether to continue into a formal contract or payment flow.

## What Is Included

- Next.js application code
- public positioning, POC, pricing, case, and inquiry pages
- standard package and listing factory workflows
- admin inquiry and metrics surfaces
- local demo and fallback paths
- tests and repository verification script
- product, launch, and delivery documentation

## What Was Intentionally Removed

- local `.env.local`
- credentials, tokens, cookies, and private runtime config
- local logs
- `.next`, `node_modules`, test output, and generated TypeScript build info
- old agent/worktree runtime folders
- unrelated desktop assets and personal files

## Current Commercial Boundary

The product is ready for controlled POC demos and partner technical review. It is not yet a fully self-serve production SaaS until production providers are configured:

- AI/model API provider
- Redis persistence
- email provider
- payment or contract handoff
- deployment domain
- real customer evidence and case data

## Dependency Security Note

The previous Excel export dependency was removed because the available `xlsx` package version still had unresolved npm audit issues. The delivery exports now use CSV or ZIP packages of CSV files, which preserves spreadsheet handoff without carrying that high-risk dependency.

Current production audit status after cleanup: no high or critical vulnerabilities. npm still reports a moderate advisory through Next.js' bundled PostCSS dependency; track the next stable Next.js release and upgrade when the bundled PostCSS version is fixed.

## Recommended Next Steps

1. Run repository verification.
2. Deploy a staging environment.
3. Configure production environment variables in the deployment platform.
4. Run one real 10-SKU POC with a friendly customer.
5. Replace demo evidence with real delivery and review outcomes.

## Verification Command

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```
