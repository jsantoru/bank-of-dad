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

## MVP Scope

- Create and manage child accounts.
- Record deposits and withdrawals.
- Record dated interest rate changes.
- Calculate a daily ledger from historical facts.
- Show current balance and total interest earned.

## Local-First Direction

The first version will run locally through Docker and persist data in a SQLite database file. The architecture should keep database access isolated so a hosted SQLite-compatible option can be considered later.

## Documentation

See [docs/implementation-plan.md](docs/implementation-plan.md) for the current implementation plan.

