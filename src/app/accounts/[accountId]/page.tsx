import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountPageSummary } from "@/db/summaries";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  params: Promise<{
    accountId: string;
  }>;
};

export default async function AccountPage({ params }: AccountPageProps) {
  const { accountId } = await params;
  const account = getAccountPageSummary(Number(accountId));

  if (!account) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/">
        Back to accounts
      </Link>

      <section className={styles.header}>
        <div>
          <span className={styles.label}>Account</span>
          <h1>{account.name}</h1>
        </div>
        <div className={styles.balanceBlock}>
          <span>Current balance</span>
          <strong>{account.currentBalance}</strong>
        </div>
      </section>

      <section className={styles.statGrid} aria-label="Account summary">
        <article>
          <span className={styles.label}>Interest earned</span>
          <strong>{account.totalInterest}</strong>
        </article>
        <article>
          <span className={styles.label}>Current rate</span>
          <strong>{account.currentAnnualRate}</strong>
        </article>
        <article>
          <span className={styles.label}>Transactions</span>
          <strong>{account.transactionCount}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.label}>Source of truth</span>
            <h2>Transactions</h2>
          </div>
        </div>

        {account.transactions.length === 0 ? (
          <p className={styles.emptyText}>No transactions yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th className={styles.amountCell}>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {account.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td className={styles.typeCell}>{transaction.type}</td>
                    <td className={styles.amountCell}>{transaction.amount}</td>
                    <td>{transaction.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.label}>Calculated</span>
            <h2>Recent ledger</h2>
          </div>
          <span className={styles.badge}>Last 30 days</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th className={styles.amountCell}>Starting</th>
                <th className={styles.amountCell}>Deposits</th>
                <th className={styles.amountCell}>Withdrawals</th>
                <th className={styles.amountCell}>Interest</th>
                <th className={styles.amountCell}>Ending</th>
                <th className={styles.amountCell}>Total Interest</th>
              </tr>
            </thead>
            <tbody>
              {account.recentLedgerRows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td className={styles.amountCell}>{row.startingBalance}</td>
                  <td className={styles.amountCell}>{row.deposits}</td>
                  <td className={styles.amountCell}>{row.withdrawals}</td>
                  <td className={styles.amountCell}>{row.interest}</td>
                  <td className={styles.amountCell}>{row.endingBalance}</td>
                  <td className={styles.amountCell}>{row.totalInterest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

