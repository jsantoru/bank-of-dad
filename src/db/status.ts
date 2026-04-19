import { getDatabasePath, initializeDatabase, openDatabase } from "./index";

type TableName = "accounts" | "transactions" | "interest_rate_changes";

const trackedTables: TableName[] = [
  "accounts",
  "transactions",
  "interest_rate_changes",
];

type CountRow = {
  count: number;
};

export type DatabaseStatus = {
  databasePath: string;
  tables: Array<{
    name: TableName;
    rowCount: number;
  }>;
};

export function getDatabaseStatus(): DatabaseStatus {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const tables = trackedTables.map((name) => {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get() as
        | CountRow
        | undefined;

      return {
        name,
        rowCount: row?.count ?? 0,
      };
    });

    return {
      databasePath: getDatabasePath(),
      tables,
    };
  } finally {
    db.close();
  }
}

