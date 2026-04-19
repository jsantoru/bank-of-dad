# Bank of Dad

A local-first web app for tracking kids' savings, deposits, withdrawals, and compound interest.

<img width="2154" height="1844" alt="image" src="https://github.com/user-attachments/assets/66088ff9-46bf-422d-ad42-0a32c84293ad" />

---

<img width="1428" height="1280" alt="image" src="https://github.com/user-attachments/assets/a0587e8e-9784-45c7-ac35-a758ba8bda82" />

## Purpose

Bank of Dad replaces a Google Sheets-based family banking spreadsheet with a small app that preserves historical balances when interest rates change over time.

Transactions and interest rate changes are stored as separate historical facts. Daily ledger rows are calculated from those facts, so changing a rate for a future date does not rewrite the past.

## Current Stack

- Next.js App Router
- TypeScript
- CSS modules
- SQLite
- `better-sqlite3`
- Docker Compose
- Vitest

The app is local-first. The SQLite database lives at `data/bank-of-dad.sqlite` and is intentionally tracked in git because the current family banking data is not considered sensitive.

## Current Features

- Bank-style home dashboard with total balance, total interest, active accounts, and transaction count.
- Account cards for Isabella, Julian, and Rosalie.
- Account detail pages at `/accounts/[accountId]`.
- Source-of-truth transactions, newest first.
- Add deposit or withdrawal.
- Delete transactions with a confirmation modal.
- Account-specific interest rate history.
- Add or update account-level interest rates by effective date.
- Recent ledger rows, newest first.
- Annual and daily interest rate shown for each recent ledger row.
- SQLite diagnostics at `/debug`.
- Spreadsheet CSV import script.

## Running With Docker

Start the app:

```bash
docker compose up --build
```

Open the app:

```text
http://localhost:3001
```

Stop the app:

```bash
docker compose down
```

The app listens on port `3000` inside the container and is exposed on host port `3001` to avoid conflicts with a non-Docker local Next.js server.

Docker Compose mounts the source tree into the container, keeps `node_modules` and `.next` in Docker volumes, and bind-mounts the local `data/` directory to `/app/data`.

## Running Without Docker

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

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Useful Commands

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Initialize the SQLite database:

```bash
npm run db:init
```

Import spreadsheet CSV exports:

```bash
npm run db:import -- "Isabella Checking=C:\path\to\THE BANK OF DAD - Isabella.csv"
```

Multiple accounts can be imported in one command by passing more `Account Name=CSV path` arguments.

## Data Model

The source-of-truth tables are:

- `accounts`
- `transactions`
- `interest_rate_changes`

Transactions do not store interest rates. Interest rates are account-level policy records with effective dates. For each daily ledger row, the app uses the latest rate change whose effective date is on or before that ledger date.

## Interest Calculation

The ledger uses the same daily interest formula as the original spreadsheet:

```text
dailyRate = annualRate / 365
```

Daily order of operations:

```text
starting balance
+ deposits
- withdrawals
+ daily interest
= ending balance
```

Because each day starts from the prior day's ending balance, interest compounds daily.

Current local interest policy:

- `2025-01-01`: 50% annual rate.
- `2026-01-01`: 25% annual rate.

## Current Data

Current imported local account data:

- `Isabella Checking`: 5 transactions.
- `Julian Checking`: 10 transactions.
- `Rosalie Checking`: 6 transactions.

The tracked SQLite file is:

```text
data/bank-of-dad.sqlite
```

## Validation

The add-transaction form validates:

- Date must be a real `YYYY-MM-DD` date.
- Type must be `deposit` or `withdrawal`.
- Amount must be greater than zero.

Deleting a transaction removes the source-of-truth transaction row and recalculates future balances and interest.

Adding an interest rate change stores an account-specific effective date and annual rate. Ledger rows on and after that date use the new rate until another later rate change exists.

## Verification

Recently verified:

```bash
npm run build
```

The Docker app has also been verified at:

```text
http://localhost:3001
```

Key routes:

- `/`
- `/accounts/[accountId]`
- `/debug`

## Documentation

See [docs/implementation-plan.md](docs/implementation-plan.md) for the current implementation plan.

