import Link from "next/link";
import { PiggyBank, TrendingUp, Lightbulb, Heart } from "lucide-react";
import styles from "./about.module.css";

export const metadata = {
  title: "About - Bank of Dad",
  description: "Teaching kids the value of compound interest and building lifelong saving habits.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <div className={styles.container}>
        <div className={styles.hero}>
          <PiggyBank size={64} strokeWidth={1.5} className={styles.heroIcon} />
          <h1>Teaching the Magic of Compound Interest</h1>
          <p className={styles.subtitle}>
            Building financial literacy and smart saving habits, one transaction at a time.
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.iconHeader}>
              <Lightbulb size={32} />
              <h2>Our Mission</h2>
            </div>
            <p>
              Bank of Dad exists to teach children the incredible power of compound interest
              through hands-on experience. Instead of just talking about saving, we make it
              visible, tangible, and rewarding.
            </p>
            <p>
              By offering competitive interest rates on their savings, kids can watch their
              money grow not just from deposits, but from the interest earned on their interest.
              This early lesson in exponential growth can shape a lifetime of smart financial decisions.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.iconHeader}>
              <TrendingUp size={32} />
              <h2>How It Works</h2>
            </div>
            <p>
              Each child has their own account where they can make deposits and withdrawals.
              Every day, their balance earns interest based on the current rate policy.
              Because interest compounds daily, they can see how even small amounts can
              grow significantly over time.
            </p>
            <p>
              The app tracks every transaction and interest calculation, creating a complete
              history that shows exactly how their money has grown. Kids can see the direct
              impact of:
            </p>
            <ul className={styles.benefits}>
              <li>Making regular deposits (even small ones)</li>
              <li>Keeping money saved instead of withdrawing</li>
              <li>Letting interest compound over weeks and months</li>
              <li>How interest rates affect their earnings</li>
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.iconHeader}>
              <Heart size={32} />
              <h2>Building Good Habits</h2>
            </div>
            <p>
              Financial literacy starts early. By giving kids a "bank account" where they can
              earn real returns (paid by Mom and Dad), they develop:
            </p>
            <ul className={styles.benefits}>
              <li><strong>Delayed gratification:</strong> Watching savings grow is more rewarding than instant spending</li>
              <li><strong>Goal setting:</strong> Saving for something specific becomes achievable</li>
              <li><strong>Math skills:</strong> Understanding percentages and exponential growth</li>
              <li><strong>Financial responsibility:</strong> Managing their own money and tracking balances</li>
            </ul>
            <p>
              These aren't just financial lessons—they're life lessons in patience, planning,
              and the rewards of consistent positive behavior.
            </p>
          </section>

          <section className={styles.section}>
            <div className={styles.iconHeader}>
              <PiggyBank size={32} />
              <h2>For Parents</h2>
            </div>
            <p>
              Bank of Dad makes it easy to manage family finances while teaching valuable lessons:
            </p>
            <ul className={styles.benefits}>
              <li>Set your own interest rates (adjust as kids get older)</li>
              <li>Track all transactions with complete history</li>
              <li>No need for complicated spreadsheets</li>
              <li>Kids can check their balance anytime (read-only access)</li>
              <li>Interest calculations are automatic and accurate</li>
            </ul>
            <p>
              The cost? Whatever interest you choose to pay. The benefit? Kids who understand
              the time-value of money before they hit adulthood.
            </p>
          </section>

          <div className={styles.cta}>
            <h3>Start Building Their Financial Future Today</h3>
            <Link href="/" className={styles.ctaButton}>
              View Accounts
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
