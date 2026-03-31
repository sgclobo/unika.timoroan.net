import * as SQLite from "expo-sqlite";

type Migration = {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "create_indexes",
    up: async (db) => {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
        CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      `);
    },
  },
  {
    version: 2,
    name: "cart_created_at_index",
    up: async (db) => {
      await db.execAsync(
        "CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at);",
      );
    },
  },
];

export async function applyMigrations(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations",
  );
  const appliedVersions = new Set(applied.map((item) => item.version));

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    await db.withExclusiveTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
        [migration.version, migration.name],
      );
    });
  }
}
