import Link from "next/link";
import styles from "./page.module.css";
import { getDatabaseStatus } from "@/db/status";
import { getDashboardAccountSummaries } from "@/db/summaries";

export const dynamic = "force-dynamic";

export default function Home() {
  const databaseStatus = getDatabaseStatus();
  const accountSummaries = getDashboardAccountSummaries();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Local-first family banking</p>
        <h1>The Bank of Dad</h1>
        <p className={styles.lede}>
          Track deposits, withdrawals, and compound interest without rewriting
          history when rates change.
        </p>
      </section>

      <section className={styles.cardGrid} aria-label="App status">
        <article className={styles.card}>
          <span className={styles.label}>Current Step</span>
          <strong>App shell</strong>
          <p>Next.js is scaffolded and ready for the first data layer.</p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Database</span>
          <strong>SQLite connected</strong>
          <p>The home page is reading database metadata on the server.</p>
        </article>
      </section>

      <section className={styles.dashboard} aria-label="Accounts dashboard">
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.label}>Dashboard</span>
            <h2>Accounts</h2>
          </div>
          <span className={styles.countBadge}>
            {accountSummaries.length}{" "}
            {accountSummaries.length === 1 ? "account" : "accounts"}
          </span>
        </div>

        {accountSummaries.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No accounts yet</strong>
            <p>
              Run <code>npm run db:seed</code> to add sample data, or add real
              accounts once the forms are built.
            </p>
          </div>
        ) : (
          <div className={styles.accountGrid}>
            {accountSummaries.map((account) => (
              <Link
                className={styles.accountCard}
                href={`/accounts/${account.id}`}
                key={account.id}
              >
                <div>
                  <span className={styles.label}>Account</span>
                  <h3>{account.name}</h3>
                </div>
                <div className={styles.balance}>{account.currentBalance}</div>
                <dl className={styles.summaryStats}>
                  <div>
                    <dt>Interest earned</dt>
                    <dd>{account.totalInterest}</dd>
                  </div>
                  <div>
                    <dt>Current rate</dt>
                    <dd>{account.currentAnnualRate}</dd>
                  </div>
                  <div>
                    <dt>Transactions</dt>
                    <dd>{account.transactionCount}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={styles.statusPanel} aria-label="Database status">
        <div>
          <span className={styles.label}>SQLite Database</span>
          <h2>Connection check</h2>
          <p>
            The app opened the local SQLite database, applied the schema, and
            read row counts from the source-of-truth tables.
          </p>
        </div>

        <div className={styles.databasePath}>{databaseStatus.databasePath}</div>

        <div className={styles.tableList}>
          {databaseStatus.tables.map((table) => (
            <div className={styles.tableRow} key={table.name}>
              <span>{table.name}</span>
              <strong>{table.rowCount}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
