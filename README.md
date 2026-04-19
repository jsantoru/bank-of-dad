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
- Docker Compose local development setup
- SQLite schema and initialization script
- Money and ledger calculation helpers
- Focused ledger math tests
- Spreadsheet CSV import script
- Imported account data for Isabella, Julian, and Rosalie
- Dashboard account cards linking to account detail pages
- Account pages showing transactions and recent ledger rows
- Add-transaction form on account pages
- Delete transaction action with confirmation modal

SQLite can be initialized separately with `npm run db:init`.
The home page now includes a server-rendered SQLite connection check that reads table row counts from the database.

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
http://localhost:3001
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Initialize the local SQLite database:

```bash
npm run db:init
```

Import spreadsheet CSV exports:

```bash
npm run db:import -- "Isabella Checking=C:\path\to\THE BANK OF DAD - Isabella.csv"
```

Multiple accounts can be imported in one command by passing more `Account Name=CSV path` arguments.

By default this creates:

```text
data/bank-of-dad.sqlite
```

On Windows PowerShell, if `npm` is blocked by script execution policy, use:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run db:init
npm.cmd run db:import -- "Isabella Checking=C:\path\to\THE BANK OF DAD - Isabella.csv"
```

## Running With Docker

Start the app through Docker Compose:

```bash
docker compose up --build
```

Open the app:

```text
http://localhost:3000
```

Stop the app:

```bash
docker compose down
```

The Compose setup mounts the source tree into the container, keeps `node_modules` and `.next` in Docker volumes, and bind-mounts the ignored local `data/` directory to `/app/data`.

The app listens on port `3000` inside the container and is exposed on host port `3001` to avoid conflicts with a non-Docker local Next.js server.

On startup, Compose runs `npm install` inside the container before starting Next.js. This keeps the Docker `node_modules` volume in sync when dependencies change.

## MVP Scope

- Create and manage child accounts.
- Record deposits and withdrawals.
- Record dated interest rate changes.
- Calculate a daily ledger from historical facts.
- Show current balance and total interest earned.

## Build Plan

The app is being built in small verified steps:

1. Scaffold the minimal Next.js app shell. Done.
2. Add Docker local development setup. Done.
3. Add SQLite database initialization. Done.
4. Add schema and migration helper. Basic schema done; migrations can be expanded later.
5. Prove UI-to-SQLite connection. Done.
6. Implement money and ledger calculation helpers. Done.
7. Add focused tests for ledger math. Done.
8. Add account, transaction, and interest rate queries.
9. Build the dashboard. Started.
10. Add a seed/import path for pasted spreadsheet history. Done.
11. Add account transaction pages. Done.
12. Build the full account ledger.
13. Add forms for deposits and withdrawals. Done.
14. Add transaction deletion with confirmation. Done.
15. Add forms for interest rate changes.

After each step, this README should be updated with the current way to run, verify, and understand the app.

## Local-First Direction

The first version will run locally through Docker and persist data in a SQLite database file. The architecture should keep database access isolated so a hosted SQLite-compatible option can be considered later.

The app currently runs as a normal Next.js development server either directly on the host or through Docker Compose. SQLite is initialized by script and will be wired into the UI in a later step.

## Verification

Current verified commands:

```bash
npm run db:init
npm test
npm run build
```

The database initializes successfully, ledger tests pass, and the production build passes.

The initialized schema currently creates:

- `accounts`
- `transactions`
- `interest_rate_changes`

The ledger uses the same daily interest formula as the original spreadsheet:

```text
dailyRate = annualRate / 365
```

The ledger tests currently verify:

- Annual interest rate to spreadsheet daily rate conversion.
- Same-day deposits are applied before interest.
- The active interest rate changes by date.
- Withdrawals are applied before interest.

Current imported local account data:

- `Isabella Checking`: 5 transactions, 50% annual rate.
- `Julian Checking`: 10 transactions, 50% annual rate.
- `Rosalie Checking`: 6 transactions, 50% annual rate.

Docker verification:

```bash
docker compose up --build -d
```

Confirmed the app responds with HTTP `200` at:

```text
http://localhost:3001
```

The Docker-served page also renders the SQLite connection check and table names:

- `accounts`
- `transactions`
- `interest_rate_changes`

The dashboard account cards link to account detail pages:

```text
/accounts/[accountId]
```

Each account page currently shows:

- Current balance.
- Total interest earned.
- Current annual rate.
- All source-of-truth transactions, newest first.
- Last 30 calculated ledger rows, newest first.
- A form to add a deposit or withdrawal.
- A delete action for each transaction with a confirmation modal.

The add-transaction form validates:

- Date must be a real `YYYY-MM-DD` date.
- Type must be `deposit` or `withdrawal`.
- Amount must be greater than zero.

Deleting a transaction removes the source-of-truth transaction row and recalculates future balances and interest.

HTTP verification against the running Docker app confirmed:

- `/` returns HTTP `200`.
- `/accounts/2` returns HTTP `200`.
- The detail page renders `Isabella Checking` and the transactions table.

Stop the container when done:

```bash
docker compose down
```

## Documentation

See [docs/implementation-plan.md](docs/implementation-plan.md) for the current implementation plan.
