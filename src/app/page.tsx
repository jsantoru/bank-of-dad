import styles from "./page.module.css";

export default function Home() {
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
          <strong>Coming next</strong>
          <p>SQLite will be added behind a small server-side DB module.</p>
        </article>
      </section>
    </main>
  );
}

