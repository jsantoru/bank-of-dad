# Bank of Dad Implementation Plan

## Goal

Build a small local-first web app that replaces the current spreadsheet while preserving historical interest behavior. The app should run locally in Docker, store data in SQLite, and keep the architecture portable enough to host later.

## Product Scope

The first version should stay intentionally small:

- Manage child accounts.
- Record deposits and withdrawals.
- Record dated interest rate changes.
- Calculate account ledgers from transactions and rate history.
- Show current balance and total interest earned.

Out of scope for the first version:

- Kid logins.
- Real banking integrations.
- Goals, charts, badges, or allowance automation.
- Stored daily ledger rows.
- Complex permission systems.

## Tech Stack

- Next.js
- TypeScript
- SQLite
- `better-sqlite3`
- Docker Compose
- Minimal neutral UI theme inspired by clean productivity tools
- Open-source icons, likely Lucide

## Architecture Principles

- Keep the app local-first.
- Persist the SQLite database in a Docker volume or local `data/` directory.
- Keep all database access inside a dedicated DB layer.
- Keep ledger and money calculations in domain modules.
- Store source-of-truth records only.
- Calculate balances and ledger rows on demand.
- Avoid provider-specific assumptions so hosting can be revisited later.

## Proposed Directory Structure

```text
src/
  app/
    page.tsx
    accounts/
      [accountId]/
        page.tsx
  components/
  db/
    index.ts
    migrations.ts
    queries.ts
    schema.sql
  domain/
    ledger.ts
    money.ts
data/
docker-compose.yml
Dockerfile
```

The `data/` directory should stay ignored by git because it will contain the local SQLite database.

## Data Model

### accounts

```text
id
name
created_at
archived_at
```

### transactions

```text
id
account_id
transaction_date
type: deposit | withdrawal
amount_cents
note
created_at
updated_at
```

### interest_rate_changes

```text
id
account_id
effective_date
annual_rate_basis_points
created_at
updated_at
```

Use integer cents for transaction amounts. Store annual rates as basis points so `50%` is stored as `5000`.

## Ledger Calculation

Ledger rows are derived from transactions and interest rate changes.

Daily order of operations:

```text
starting balance
+ deposits for the day
- withdrawals for the day
= balance before interest
+ daily interest
= ending balance
```

Daily rate:

```text
dailyRate = annualRate / 365
```

This matches the current spreadsheet's daily rate behavior. Interest should be rounded to cents per day for display and consistency with the spreadsheet-style ledger.

## Initial Screens

### Dashboard

- List accounts.
- Show current balance.
- Show total interest earned.
- Link to each account ledger.

### Account Ledger

- Show daily rows:
  - Date
  - Starting balance
  - Deposits
  - Withdrawals
  - Annual interest rate
  - Interest earned
  - Ending balance
  - Total interest earned
- Add deposit.
- Add withdrawal.

### Interest Rates

- Show rate history for the account.
- Add a new rate effective on a selected date.
- Default new rate date to today.

## UI Direction

Use a clean, neutral interface:

- Warm off-white background.
- White surfaces.
- Subtle borders.
- Dark gray text.
- Muted secondary text.
- Green accent for money and positive values.
- Compact, spreadsheet-like ledger table.
- Modest 6-8px border radius.

Avoid a playful or heavily themed kid-focused design in the first version.

## Build Sequence

1. Scaffold the Next.js app.
2. Add Docker and Docker Compose.
3. Add SQLite database initialization.
4. Add schema and migration helper.
5. Implement money helpers.
6. Implement ledger calculation.
7. Add account, transaction, and interest rate queries.
8. Build the dashboard.
9. Build the account ledger.
10. Add basic forms for deposits, withdrawals, and rate changes.
11. Add a seed/import path for pasted spreadsheet history.
12. Add focused tests for ledger math.

## Future Hosting Path

The local SQLite setup should be portable to hosted SQLite-like options later:

- Cloudflare D1
- Turso
- Small VPS with SQLite

If hosting becomes a priority, the main migration point should be the DB adapter layer, not the domain or UI code.
