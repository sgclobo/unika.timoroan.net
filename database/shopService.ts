import { LOW_STOCK_THRESHOLD } from "@/constants/app";
import { getDb } from "@/database/db";
import {
  addToCartMemory,
  clearCartMemory,
  createCategoryMemory,
  createProductMemory,
  deleteCategoryMemory,
  deleteProductMemory,
  getCartItemsMemory,
  getCategoriesMemory,
  getDashboardStatsMemory,
  getOrderByOrderNumberMemory,
  getOrderItemsMemory,
  getOrdersMemory,
  getProductByIdMemory,
  getProductsMemory,
  placeOrderMemory,
  removeCartItemMemory,
  updateCartItemQuantityMemory,
  updateCategoryMemory,
  updateOrderStatusMemory,
  updateProductMemory,
  verifyAdminMemory,
} from "@/database/memoryStore";
import { isMemoryFallbackEnabled } from "@/database/runtime";
import {
  AdminUser,
  CartItem,
  Category,
  CheckoutPayload,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from "@/types/models";

const SNAPSHOT_VERSION = "v1";
const SNAPSHOT_KEYS = {
  categories: `unika.catalog.categories.${SNAPSHOT_VERSION}`,
  productsLatest: `unika.catalog.products.latest.${SNAPSHOT_VERSION}`,
  productById: `unika.catalog.product.by-id.${SNAPSHOT_VERSION}`,
  cartItems: `unika.cart.items.${SNAPSHOT_VERSION}`,
  pendingOrderIntents: `unika.checkout.pending-intents.${SNAPSHOT_VERSION}`,
};

type CheckoutCartLine = {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
};

type PendingOrderIntent = {
  id: string;
  createdAt: string;
  payload: CheckoutPayload;
  items: CheckoutCartLine[];
};

export type PlaceOrderResult =
  | { status: "placed"; orderNumber: string }
  | { status: "queued"; intentId: string };

function canUseNavigator() {
  return typeof navigator !== "undefined";
}

function isOfflineNow() {
  return canUseNavigator() && navigator.onLine === false;
}

function toCheckoutLines(items: CartItem[]): CheckoutCartLine[] {
  return items.map((item) => ({
    productId: item.product_id,
    productName: item.product_name,
    productPrice: item.product_price,
    quantity: item.quantity,
  }));
}

function getPendingOrderIntents() {
  return (
    readSnapshot<PendingOrderIntent[]>(SNAPSHOT_KEYS.pendingOrderIntents) ?? []
  );
}

function writePendingOrderIntents(intents: PendingOrderIntent[]) {
  writeSnapshot(SNAPSHOT_KEYS.pendingOrderIntents, intents);
}

function queueOrderIntent(payload: CheckoutPayload, items: CartItem[]) {
  const intent: PendingOrderIntent = {
    id: `qi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    payload,
    items: toCheckoutLines(items),
  };

  const current = getPendingOrderIntents();
  writePendingOrderIntents([...current, intent]);
  return intent.id;
}

function isQueueableCheckoutError(error: unknown) {
  if (!canUseWebStorage()) return false;
  if (isOfflineNow()) return true;
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("failed")
  );
}

function canUseWebStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readSnapshot<T>(key: string): T | null {
  if (!canUseWebStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeSnapshot<T>(key: string, value: T) {
  if (!canUseWebStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore snapshot write failures in low-storage environments.
  }
}

function mergeProductByIdSnapshot(products: Product[]) {
  const current =
    readSnapshot<Record<string, Product>>(SNAPSHOT_KEYS.productById) ?? {};
  const merged = { ...current };
  for (const product of products) {
    merged[String(product.id)] = product;
  }
  writeSnapshot(SNAPSHOT_KEYS.productById, merged);
}

function normalizeSearchTerm(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function applyProductFilters(rows: Product[], filters: ProductFilters = {}) {
  let filtered = [...rows].filter((row) => row.status === "active");

  if (filters.categoryId) {
    filtered = filtered.filter((row) => row.category_id === filters.categoryId);
  }

  const searchTerm = normalizeSearchTerm(filters.search);
  if (searchTerm) {
    filtered = filtered.filter((row) =>
      row.name.toLowerCase().includes(searchTerm),
    );
  }

  if (filters.featuredOnly) {
    filtered = filtered.filter((row) => row.featured === 1);
  }

  if (filters.sortBy === "priceAsc") {
    return filtered.sort((a, b) => a.price - b.price);
  }

  if (filters.sortBy === "priceDesc") {
    return filtered.sort((a, b) => b.price - a.price);
  }

  return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function clearCatalogSnapshots() {
  if (!canUseWebStorage()) return;
  localStorage.removeItem(SNAPSHOT_KEYS.categories);
  localStorage.removeItem(SNAPSHOT_KEYS.productsLatest);
  localStorage.removeItem(SNAPSHOT_KEYS.productById);
}

export async function getCategories(): Promise<Category[]> {
  try {
    const rows = isMemoryFallbackEnabled()
      ? await getCategoriesMemory()
      : await (
          await getDb()
        ).getAllAsync<Category>(
          "SELECT * FROM categories ORDER BY name COLLATE NOCASE ASC",
        );

    writeSnapshot(SNAPSHOT_KEYS.categories, rows);
    return rows;
  } catch (error) {
    const cached = readSnapshot<Category[]>(SNAPSHOT_KEYS.categories);
    if (cached && cached.length > 0) {
      return cached;
    }
    throw error;
  }
}

export async function createCategory(name: string, description: string) {
  if (isMemoryFallbackEnabled()) {
    await createCategoryMemory(name, description);
  } else {
    const db = await getDb();
    await db.runAsync(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name.trim(), description.trim() || null],
    );
  }
  clearCatalogSnapshots();
}

export async function updateCategory(
  id: number,
  name: string,
  description: string,
) {
  if (isMemoryFallbackEnabled()) {
    await updateCategoryMemory(id, name, description);
  } else {
    const db = await getDb();
    await db.runAsync(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name.trim(), description.trim() || null, id],
    );
  }
  clearCatalogSnapshots();
}

export async function deleteCategory(id: number) {
  if (isMemoryFallbackEnabled()) {
    await deleteCategoryMemory(id);
  } else {
    const db = await getDb();
    await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
  }
  clearCatalogSnapshots();
}

type ProductFilters = {
  categoryId?: number | null;
  search?: string;
  sortBy?: "newest" | "priceAsc" | "priceDesc";
  featuredOnly?: boolean;
};

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  try {
    if (isMemoryFallbackEnabled()) {
      const rows = await getProductsMemory(filters);
      writeSnapshot(SNAPSHOT_KEYS.productsLatest, rows);
      mergeProductByIdSnapshot(rows);
      return rows;
    }

    const db = await getDb();

    const whereClauses: string[] = ["p.status = 'active'"];
    const params: (string | number)[] = [];

    if (filters.categoryId) {
      whereClauses.push("p.category_id = ?");
      params.push(filters.categoryId);
    }

    if (filters.search?.trim()) {
      whereClauses.push("LOWER(p.name) LIKE ?");
      params.push(`%${filters.search.trim().toLowerCase()}%`);
    }

    if (filters.featuredOnly) {
      whereClauses.push("p.featured = 1");
    }

    let orderBy = "p.created_at DESC";
    if (filters.sortBy === "priceAsc") orderBy = "p.price ASC";
    if (filters.sortBy === "priceDesc") orderBy = "p.price DESC";

    const query = `
      SELECT
        p.*,
        c.name as category_name
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY ${orderBy}
    `;

    const rows = await db.getAllAsync<Product>(query, params);
    writeSnapshot(SNAPSHOT_KEYS.productsLatest, rows);
    mergeProductByIdSnapshot(rows);
    return rows;
  } catch (error) {
    const latest = readSnapshot<Product[]>(SNAPSHOT_KEYS.productsLatest);
    if (latest && latest.length > 0) {
      return applyProductFilters(latest, filters);
    }
    throw error;
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    if (isMemoryFallbackEnabled()) {
      const row = await getProductByIdMemory(id);
      if (row) {
        mergeProductByIdSnapshot([row]);
      }
      return row;
    }

    const db = await getDb();
    const row = await db.getFirstAsync<Product>(
      `
        SELECT
          p.*,
          c.name as category_name
        FROM products p
        INNER JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
      `,
      [id],
    );

    if (row) {
      mergeProductByIdSnapshot([row]);
    }

    return row ?? null;
  } catch (error) {
    const byId = readSnapshot<Record<string, Product>>(
      SNAPSHOT_KEYS.productById,
    );
    if (byId?.[String(id)]) {
      return byId[String(id)];
    }

    const latest = readSnapshot<Product[]>(SNAPSHOT_KEYS.productsLatest);
    if (latest) {
      return latest.find((row) => row.id === id) ?? null;
    }

    throw error;
  }
}

export async function createProduct(input: {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  featured: boolean;
}) {
  if (isMemoryFallbackEnabled()) {
    await createProductMemory(input);
  } else {
    const db = await getDb();
    await db.runAsync(
      `
        INSERT INTO products
        (category_id, name, description, price, image, stock, featured, status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
      `,
      [
        input.categoryId,
        input.name.trim(),
        input.description.trim(),
        input.price,
        input.image.trim() || null,
        input.stock,
        input.featured ? 1 : 0,
      ],
    );
  }
  clearCatalogSnapshots();
}

export async function updateProduct(
  id: number,
  input: {
    categoryId: number;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    featured: boolean;
    status: "active" | "inactive";
  },
) {
  if (isMemoryFallbackEnabled()) {
    await updateProductMemory(id, input);
  } else {
    const db = await getDb();
    await db.runAsync(
      `
        UPDATE products
        SET category_id = ?, name = ?, description = ?, price = ?, image = ?, stock = ?,
            featured = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        input.categoryId,
        input.name.trim(),
        input.description.trim(),
        input.price,
        input.image.trim() || null,
        input.stock,
        input.featured ? 1 : 0,
        input.status,
        id,
      ],
    );
  }
  clearCatalogSnapshots();
}

export async function deleteProduct(id: number) {
  if (isMemoryFallbackEnabled()) {
    await deleteProductMemory(id);
  } else {
    const db = await getDb();
    await db.runAsync("DELETE FROM products WHERE id = ?", [id]);
  }
  clearCatalogSnapshots();
}

export async function getCartItems(): Promise<CartItem[]> {
  try {
    const rows = isMemoryFallbackEnabled()
      ? await getCartItemsMemory()
      : await (
          await getDb()
        ).getAllAsync<CartItem>(
          `
            SELECT
              ci.*,
              p.name as product_name,
              p.price as product_price,
              p.image as product_image,
              p.stock as product_stock
            FROM cart_items ci
            INNER JOIN products p ON p.id = ci.product_id
            ORDER BY ci.created_at DESC
          `,
        );

    writeSnapshot(SNAPSHOT_KEYS.cartItems, rows);
    return rows;
  } catch (error) {
    const cached = readSnapshot<CartItem[]>(SNAPSHOT_KEYS.cartItems);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

export async function addToCart(productId: number, quantity: number) {
  if (isMemoryFallbackEnabled()) return addToCartMemory(productId, quantity);
  const db = await getDb();

  const product = await db.getFirstAsync<{ stock: number }>(
    "SELECT stock FROM products WHERE id = ?",
    [productId],
  );

  if (!product || product.stock <= 0) {
    throw new Error("This product is out of stock.");
  }

  const existing = await db.getFirstAsync<{ quantity: number }>(
    "SELECT quantity FROM cart_items WHERE product_id = ?",
    [productId],
  );

  const currentQty = existing?.quantity ?? 0;
  const newQty = currentQty + quantity;

  if (newQty > product.stock) {
    throw new Error("Quantity exceeds available stock.");
  }

  if (existing) {
    await db.runAsync(
      "UPDATE cart_items SET quantity = ? WHERE product_id = ?",
      [newQty, productId],
    );
  } else {
    await db.runAsync(
      "INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)",
      [productId, quantity],
    );
  }

  writeSnapshot(SNAPSHOT_KEYS.cartItems, await getCartItems());
}

export async function updateCartItemQuantity(
  productId: number,
  quantity: number,
) {
  if (isMemoryFallbackEnabled()) {
    return updateCartItemQuantityMemory(productId, quantity);
  }
  const db = await getDb();

  if (quantity <= 0) {
    await removeCartItem(productId);
    return;
  }

  const product = await db.getFirstAsync<{ stock: number }>(
    "SELECT stock FROM products WHERE id = ?",
    [productId],
  );

  if (!product || quantity > product.stock) {
    throw new Error("Quantity exceeds available stock.");
  }

  await db.runAsync("UPDATE cart_items SET quantity = ? WHERE product_id = ?", [
    quantity,
    productId,
  ]);

  writeSnapshot(SNAPSHOT_KEYS.cartItems, await getCartItems());
}

export async function removeCartItem(productId: number) {
  if (isMemoryFallbackEnabled()) return removeCartItemMemory(productId);
  const db = await getDb();
  await db.runAsync("DELETE FROM cart_items WHERE product_id = ?", [productId]);
  writeSnapshot(SNAPSHOT_KEYS.cartItems, await getCartItems());
}

export async function clearCart() {
  if (isMemoryFallbackEnabled()) return clearCartMemory();
  const db = await getDb();
  await db.runAsync("DELETE FROM cart_items");
  writeSnapshot<CartItem[]>(SNAPSHOT_KEYS.cartItems, []);
}

async function placeOrderInDb(
  payload: CheckoutPayload,
  items: CheckoutCartLine[],
  options: { clearCartAfterPlace: boolean },
) {
  const db = await getDb();
  const subtotal = items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0,
  );
  const total = subtotal;
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        INSERT INTO orders (
          order_number,
          customer_name,
          customer_phone,
          customer_address,
          payment_method,
          subtotal,
          total,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        orderNumber,
        payload.customerName.trim(),
        payload.customerPhone.trim(),
        payload.customerAddress.trim(),
        payload.paymentMethod,
        subtotal,
        total,
      ],
    );

    const order = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM orders WHERE order_number = ?",
      [orderNumber],
    );

    if (!order) {
      throw new Error("Order creation failed.");
    }

    for (const item of items) {
      const product = await db.getFirstAsync<{ stock: number }>(
        "SELECT stock FROM products WHERE id = ?",
        [item.productId],
      );

      if (!product || product.stock < item.quantity) {
        throw new Error(
          `Product stock is insufficient for ${item.productName}.`,
        );
      }

      const lineTotal = item.productPrice * item.quantity;

      await db.runAsync(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_price,
            quantity,
            line_total
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          order.id,
          item.productId,
          item.productName,
          item.productPrice,
          item.quantity,
          lineTotal,
        ],
      );

      await db.runAsync(
        "UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [item.quantity, item.productId],
      );
    }

    if (options.clearCartAfterPlace) {
      await db.runAsync("DELETE FROM cart_items");
    }
  });

  return orderNumber;
}

async function processQueuedOrderIntentsInternal() {
  if (!canUseWebStorage()) {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  const queue = getPendingOrderIntents();
  if (queue.length === 0) {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  const remaining: PendingOrderIntent[] = [];
  let processed = 0;
  let failed = 0;

  for (const intent of queue) {
    try {
      await placeOrderInDb(intent.payload, intent.items, {
        clearCartAfterPlace: false,
      });
      processed += 1;
    } catch {
      failed += 1;
      remaining.push(intent);
    }
  }

  writePendingOrderIntents(remaining);
  return { processed, failed, remaining: remaining.length };
}

export async function syncQueuedOrderIntents() {
  if (isOfflineNow()) {
    return { processed: 0, failed: 0, remaining: getPendingOrderIntentCount() };
  }
  return processQueuedOrderIntentsInternal();
}

export function getPendingOrderIntentCount() {
  return getPendingOrderIntents().length;
}

export async function placeOrder(
  payload: CheckoutPayload,
): Promise<PlaceOrderResult> {
  const cartItems = await getCartItems();

  if (cartItems.length === 0) {
    throw new Error("Your cart is empty.");
  }

  if (isMemoryFallbackEnabled()) {
    const orderNumber = await placeOrderMemory(payload);
    writeSnapshot<CartItem[]>(SNAPSHOT_KEYS.cartItems, []);
    return { status: "placed", orderNumber };
  }

  try {
    const orderNumber = await placeOrderInDb(
      payload,
      toCheckoutLines(cartItems),
      {
        clearCartAfterPlace: true,
      },
    );
    writeSnapshot<CartItem[]>(SNAPSHOT_KEYS.cartItems, []);
    return { status: "placed", orderNumber };
  } catch (error) {
    if (!isQueueableCheckoutError(error)) {
      throw error;
    }

    const intentId = queueOrderIntent(payload, cartItems);

    try {
      await clearCart();
    } catch {
      // Best-effort cart cleanup for queued intents.
      writeSnapshot<CartItem[]>(SNAPSHOT_KEYS.cartItems, []);
    }

    return { status: "queued", intentId };
  }
}

export async function getOrderByOrderNumber(
  orderNumber: string,
): Promise<Order | null> {
  if (isMemoryFallbackEnabled())
    return getOrderByOrderNumberMemory(orderNumber);
  const db = await getDb();
  const row = await db.getFirstAsync<Order>(
    "SELECT * FROM orders WHERE order_number = ?",
    [orderNumber],
  );
  return row ?? null;
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  if (isMemoryFallbackEnabled()) return getOrderItemsMemory(orderId);
  const db = await getDb();
  return db.getAllAsync<OrderItem>(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY id DESC",
    [orderId],
  );
}

export async function getOrders(): Promise<Order[]> {
  if (isMemoryFallbackEnabled()) return getOrdersMemory();
  const db = await getDb();
  return db.getAllAsync<Order>("SELECT * FROM orders ORDER BY created_at DESC");
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  if (isMemoryFallbackEnabled()) return updateOrderStatusMemory(id, status);
  const db = await getDb();
  await db.runAsync("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
}

export async function verifyAdmin(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  if (isMemoryFallbackEnabled()) return verifyAdminMemory(username, password);
  const db = await getDb();
  const user = await db.getFirstAsync<AdminUser>(
    "SELECT * FROM admin_users WHERE username = ? AND password = ?",
    [username.trim(), password],
  );
  return user ?? null;
}

export async function getDashboardStats() {
  if (isMemoryFallbackEnabled()) return getDashboardStatsMemory();
  const db = await getDb();

  const [categoryCount, productCount, lowStockCount, orderCount] =
    await Promise.all([
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM categories",
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM products",
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM products WHERE stock <= ?",
        [LOW_STOCK_THRESHOLD],
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM orders",
      ),
    ]);

  return {
    totalCategories: categoryCount?.count ?? 0,
    totalProducts: productCount?.count ?? 0,
    lowStockProducts: lowStockCount?.count ?? 0,
    totalOrders: orderCount?.count ?? 0,
  };
}
