import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/constants/app";
import { getDb } from "@/database/db";
import { initMemoryStore } from "@/database/memoryStore";
import { applyMigrations } from "@/database/migrations";
import {
  disableMemoryFallback,
  enableMemoryFallback,
} from "@/database/runtime";

export async function initDatabase() {
  if (typeof window === "undefined") {
    // Skip database init during server-side rendering/static generation
    return;
  }
  try {
    const db = await getDb();

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      stock INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(product_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );
  `);

    await applyMigrations(db);

    await seedData();
    disableMemoryFallback();
  } catch (error) {
    if (typeof window !== "undefined") {
      enableMemoryFallback();
      initMemoryStore();
      console.warn(
        "SQLite unavailable on web; running in-memory fallback store.",
        error,
      );
      return;
    }
    throw error;
  }
}

async function seedData() {
  const db = await getDb();

  const categoryCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories",
  );

  if ((categoryCount?.count ?? 0) === 0) {
    await db.execAsync(`
      INSERT INTO categories (name, description) VALUES
      ('Electronics', 'Phones, earbuds and accessories'),
      ('Fashion', 'Trending outfits and apparel'),
      ('Groceries', 'Daily fresh and pantry essentials'),
      ('Beauty', 'Skincare and personal care picks');
    `);
  }

  const productCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM products",
  );

  if ((productCount?.count ?? 0) === 0) {
    await db.execAsync(`
      INSERT INTO products (category_id, name, description, price, image, stock, featured, status) VALUES
      (1, 'Aurora Buds X', 'Wireless earbuds with clear bass and 20h battery life.', 59.99, 'https://picsum.photos/seed/aurora-buds/600/600', 12, 1, 'active'),
      (1, 'Nova Phone Case', 'Shockproof slim case with matte finish.', 14.5, 'https://picsum.photos/seed/nova-case/600/600', 40, 0, 'active'),
      (1, 'Pulse Smartwatch', 'Fitness smartwatch with heart rate and sleep tracking.', 99.0, 'https://picsum.photos/seed/pulse-watch/600/600', 4, 1, 'active'),
      (2, 'Urban Hoodie', 'Comfort-fit hoodie for everyday wear.', 34.0, 'https://picsum.photos/seed/urban-hoodie/600/600', 15, 1, 'active'),
      (2, 'Core Denim', 'Stretch denim jeans with modern slim cut.', 42.0, 'https://picsum.photos/seed/core-denim/600/600', 9, 0, 'active'),
      (3, 'Premium Rice 5kg', 'Soft and fluffy premium grain.', 16.75, 'https://picsum.photos/seed/premium-rice/600/600', 22, 0, 'active'),
      (3, 'Organic Eggs 12pcs', 'Farm fresh organic eggs.', 6.99, 'https://picsum.photos/seed/organic-eggs/600/600', 3, 1, 'active'),
      (4, 'Hydra Glow Serum', 'Lightweight serum for daily hydration.', 21.2, 'https://picsum.photos/seed/hydra-serum/600/600', 6, 1, 'active');
    `);
  }

  const adminCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM admin_users",
  );

  if ((adminCount?.count ?? 0) === 0) {
    await db.runAsync(
      "INSERT INTO admin_users (username, password, role) VALUES (?, ?, ?)",
      [ADMIN_USERNAME, ADMIN_PASSWORD, "admin"],
    );
  }
}
