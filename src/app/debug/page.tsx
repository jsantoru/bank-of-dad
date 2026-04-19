import Link from "next/link";
import { getDatabaseStatus } from "@/db/status";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default function DebugPage() {
  const databaseStatus = getDatabaseStatus();

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/">
        Back to bank
      </Link>

      <section className={styles.statusPanel} aria-label="Database status">
        <div>
          <span className={styles.label}>SQLite Database</span>
          <h1>System status</h1>
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

