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

export async function getCategories(): Promise<Category[]> {
  if (isMemoryFallbackEnabled()) return getCategoriesMemory();
  const db = await getDb();
  return db.getAllAsync<Category>(
    "SELECT * FROM categories ORDER BY name COLLATE NOCASE ASC",
  );
}

export async function createCategory(name: string, description: string) {
  if (isMemoryFallbackEnabled()) return createCategoryMemory(name, description);
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name.trim(), description.trim() || null],
  );
}

export async function updateCategory(
  id: number,
  name: string,
  description: string,
) {
  if (isMemoryFallbackEnabled()) {
    return updateCategoryMemory(id, name, description);
  }
  const db = await getDb();
  await db.runAsync(
    "UPDATE categories SET name = ?, description = ? WHERE id = ?",
    [name.trim(), description.trim() || null, id],
  );
}

export async function deleteCategory(id: number) {
  if (isMemoryFallbackEnabled()) return deleteCategoryMemory(id);
  const db = await getDb();
  await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
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
  if (isMemoryFallbackEnabled()) return getProductsMemory(filters);
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

  return db.getAllAsync<Product>(query, params);
}

export async function getProductById(id: number): Promise<Product | null> {
  if (isMemoryFallbackEnabled()) return getProductByIdMemory(id);
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

  return row ?? null;
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
  if (isMemoryFallbackEnabled()) return createProductMemory(input);
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
  if (isMemoryFallbackEnabled()) return updateProductMemory(id, input);
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

export async function deleteProduct(id: number) {
  if (isMemoryFallbackEnabled()) return deleteProductMemory(id);
  const db = await getDb();
  await db.runAsync("DELETE FROM products WHERE id = ?", [id]);
}

export async function getCartItems(): Promise<CartItem[]> {
  if (isMemoryFallbackEnabled()) return getCartItemsMemory();
  const db = await getDb();
  return db.getAllAsync<CartItem>(
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
}

export async function removeCartItem(productId: number) {
  if (isMemoryFallbackEnabled()) return removeCartItemMemory(productId);
  const db = await getDb();
  await db.runAsync("DELETE FROM cart_items WHERE product_id = ?", [productId]);
}

export async function clearCart() {
  if (isMemoryFallbackEnabled()) return clearCartMemory();
  const db = await getDb();
  await db.runAsync("DELETE FROM cart_items");
}

export async function placeOrder(payload: CheckoutPayload) {
  if (isMemoryFallbackEnabled()) return placeOrderMemory(payload);
  const db = await getDb();
  const cartItems = await getCartItems();

  if (cartItems.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  );
  const total = subtotal;
  const orderNumber = `ORD-${Date.now()}`;

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

    for (const item of cartItems) {
      const lineTotal = item.product_price * item.quantity;

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
          item.product_id,
          item.product_name,
          item.product_price,
          item.quantity,
          lineTotal,
        ],
      );

      await db.runAsync(
        "UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [item.quantity, item.product_id],
      );
    }

    await db.runAsync("DELETE FROM cart_items");
  });

  return orderNumber;
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
