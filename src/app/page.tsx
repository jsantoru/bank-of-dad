import Link from "next/link";
import styles from "./page.module.css";
import {
  getDashboardOverview,
  getDashboardBalanceOverTime,
  getDashboardPortfolioComposition,
} from "@/db/summaries";
import { LogoutButton } from "./logout-button";
import { AuthStatus } from "./auth-status";
import { PiggyBank } from "lucide-react";
import { DashboardChartsSection } from "@/components/DashboardChartsSection";

export const dynamic = "force-dynamic";

export default function Home() {
  const dashboard = getDashboardOverview();
  const balanceOverTime = getDashboardBalanceOverTime();
  const portfolioComposition = getDashboardPortfolioComposition();

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiggyBank size={24} strokeWidth={2} />
          <span className={styles.brandName}>The Bank of Dad</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AuthStatus />
          <LogoutButton />
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Private family banking</p>
          <h1>Compound interest, made visible.</h1>
          <p className={styles.lede}>
            Track each account with dated deposits, withdrawals, and
            account-specific interest policies without rewriting history.
          </p>
          <div className={styles.heroActions}>
            <Link href="/about">Learn more</Link>
          </div>
        </div>
        <div
          aria-label="Coin being deposited into a piggy bank"
          className={styles.heroImage}
          role="img"
        />
      </section>

      <section className={styles.overview} aria-label="Bank overview">
        <article className={styles.overviewCard}>
          <span className={styles.label}>Total balance</span>
          <strong>{dashboard.totalBalance}</strong>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.label}>Interest earned</span>
          <strong>{dashboard.totalInterest}</strong>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.label}>Active accounts</span>
          <strong>{dashboard.activeAccounts}</strong>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.label}>Transactions</span>
          <strong>{dashboard.totalTransactions}</strong>
        </article>
      </section>

      {dashboard.accounts.length > 0 && (
        <DashboardChartsSection
          initialBalanceData={balanceOverTime}
          portfolioData={portfolioComposition}
        />
      )}

      <section
        className={styles.dashboard}
        id="accounts"
        aria-label="Accounts dashboard"
      >
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.label}>Accounts</span>
            <h2>Family portfolio</h2>
          </div>
          <span className={styles.countBadge}>
            {dashboard.activeAccounts}{" "}
            {dashboard.activeAccounts === 1 ? "account" : "accounts"}
          </span>
        </div>

        {dashboard.accounts.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No accounts yet</strong>
            <p>
              Import spreadsheet history or add an account once account
              creation is available.
            </p>
          </div>
        ) : (
          <div className={styles.accountGrid}>
            {dashboard.accounts.map((account) => (
              <Link
                className={styles.accountCard}
                href={`/accounts/${account.id}`}
                key={account.id}
              >
                <div className={styles.accountHeader}>
                  <div>
                    <span className={styles.label}>Checking</span>
                    <h3>{account.name}</h3>
                  </div>
                  <span className={styles.ratePill}>
                    {account.currentAnnualRate}
                  </span>
                </div>
                <div className={styles.balance}>{account.currentBalance}</div>
                <dl className={styles.summaryStats}>
                  <div>
                    <dt>Interest earned</dt>
                    <dd>{account.totalInterest}</dd>
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
    </main>
  );
}
