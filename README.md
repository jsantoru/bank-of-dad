# Bank of Dad

A small local-first web app for tracking kids' savings, deposits, withdrawals, and compound interest.

## Purpose

The goal is to replace a Google Sheets-based family banking spreadsheet with a simple app that preserves historical balances when interest rates change over time.

Instead of using one global interest rate that recalculates all history, the app will store dated interest rate changes. Ledger balances will be calculated from transactions plus the rate that was active on each date.

## Planned Stack

- Next.js
- TypeScript
- SQLite
- `better-sqlite3`
- Docker Compose

Current scaffold:

- Next.js app router
- TypeScript
- CSS modules
- Neutral local-first UI shell

SQLite and Docker are planned next but are not wired up yet.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

On Windows PowerShell, if `npm` is blocked by script execution policy, use:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

## MVP Scope

- Create and manage child accounts.
- Record deposits and withdrawals.
- Record dated interest rate changes.
- Calculate a daily ledger from historical facts.
- Show current balance and total interest earned.

## Build Plan

The app is being built in small verified steps:

1. Scaffold the minimal Next.js app shell. Done.
2. Add Docker local development setup.
3. Add SQLite database initialization.
4. Add schema and migration helper.
5. Implement money and ledger calculation helpers.
6. Add account, transaction, and interest rate queries.
7. Build the dashboard.
8. Build the account ledger.
9. Add forms for deposits, withdrawals, and interest rate changes.
10. Add a seed/import path for pasted spreadsheet history.
11. Add focused tests for ledger math.

After each step, this README should be updated with the current way to run, verify, and understand the app.

## Local-First Direction

The first version will run locally through Docker and persist data in a SQLite database file. The architecture should keep database access isolated so a hosted SQLite-compatible option can be considered later.

Until Docker and SQLite are added, the app runs as a normal local Next.js development server.

## Verification

Current verified commands:

```bash
npm run build
```

The production build passes.

## Documentation

See [docs/implementation-plan.md](docs/implementation-plan.md) for the current implementation plan.
