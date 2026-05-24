# Repository Instructions

## Scope

This is the cleaned Wenai product repository. Work only inside this repository unless the user explicitly asks otherwise.

Do not reintroduce local desktop history, old worktrees, logs, credentials, or generated build output.

## Safety Rules

- Never commit `.env.local` or any credential file.
- Never print API keys, auth tokens, cookies, or private customer data.
- Do not run destructive git commands such as `reset --hard`, `clean`, or broad checkout unless explicitly requested.
- Preserve unrelated user edits.
- Use the repository verification entrypoint before reporting implementation work as complete.

## Verification

Use the Windows PowerShell launcher for `.ps1` scripts:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

The verification script covers focused tests, TypeScript, ESLint, and Next build.

## Product Direction

Wenai is a 10-SKU POC delivery system for ecommerce AI workflows. Keep product work aligned to:

- qualified inquiry intake
- standard package generation
- pipeline execution
- delivery review
- CRM/admin follow-up
- contract or payment handoff

Do not drift back into a generic AI tool directory.

