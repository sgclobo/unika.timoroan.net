import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  LOW_STOCK_THRESHOLD,
} from "@/constants/app";
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

type MemoryState = {
  categories: Category[];
  products: Product[];
  cartItems: {
    id: number;
    product_id: number;
    quantity: number;
    created_at: string;
  }[];
  orders: Order[];
  orderItems: OrderItem[];
  adminUsers: AdminUser[];
  ids: {
    category: number;
    product: number;
    cart: number;
    order: number;
    orderItem: number;
    admin: number;
  };
};

const state: MemoryState = {
  categories: [],
  products: [],
  cartItems: [],
  orders: [],
  orderItems: [],
  adminUsers: [],
  ids: { category: 1, product: 1, cart: 1, order: 1, orderItem: 1, admin: 1 },
};

function now() {
  return new Date().toISOString();
}

export function initMemoryStore() {
  if (state.categories.length > 0) {
    return;
  }

  const categories: Array<Pick<Category, "name" | "description">> = [
    { name: "Electronics", description: "Phones, earbuds and accessories" },
    { name: "Fashion", description: "Trending outfits and apparel" },
    { name: "Groceries", description: "Daily fresh and pantry essentials" },
    { name: "Beauty", description: "Skincare and personal care picks" },
    { name: "Men Clothes", description: "Stylish apparel for men" },
    { name: "Women Clothes", description: "Elegant fashion for women" },
    { name: "Office Accessories", description: "Essential supplies for your workspace" },
  ];

  for (const category of categories) {
    createCategoryMemory(category.name, category.description ?? "");
  }

  const products = [
    [
      1,
      "Aurora Buds X",
      "Wireless earbuds with clear bass and 20h battery life.",
      59.99,
      "https://picsum.photos/seed/aurora-buds/600/600",
      12,
      1,
    ],
    [
      1,
      "Nova Phone Case",
      "Shockproof slim case with matte finish.",
      14.5,
      "https://picsum.photos/seed/nova-case/600/600",
      40,
      0,
    ],
    [
      1,
      "Pulse Smartwatch",
      "Fitness smartwatch with heart rate and sleep tracking.",
      99.0,
      "https://picsum.photos/seed/pulse-watch/600/600",
      4,
      1,
    ],
    [
      2,
      "Urban Hoodie",
      "Comfort-fit hoodie for everyday wear.",
      34.0,
      "https://picsum.photos/seed/urban-hoodie/600/600",
      15,
      1,
    ],
    [
      2,
      "Core Denim",
      "Stretch denim jeans with modern slim cut.",
      42.0,
      "https://picsum.photos/seed/core-denim/600/600",
      9,
      0,
    ],
    [
      3,
      "Premium Rice 5kg",
      "Soft and fluffy premium grain.",
      16.75,
      "https://picsum.photos/seed/premium-rice/600/600",
      22,
      0,
    ],
    [
      3,
      "Organic Eggs 12pcs",
      "Farm fresh organic eggs.",
      6.99,
      "https://picsum.photos/seed/organic-eggs/600/600",
      3,
      1,
    ],
    [
      4,
      "Hydra Glow Serum",
      "Lightweight serum for daily hydration.",
      21.2,
      "https://picsum.photos/seed/hydra-serum/600/600",
      6,
      1,
    ],
    [
      5,
      "Classic Oxford Shirt",
      "Timeless white cotton shirt for any occasion.",
      25.00,
      "https://picsum.photos/seed/mens-shirt/600/600",
      20,
      1,
    ],
    [
      5,
      "Slim Fit Chinos",
      "Comfortable stretch cotton chinos in khaki.",
      39.99,
      "https://picsum.photos/seed/mens-chinos/600/600",
      15,
      0,
    ],
    [
      6,
      "Floral Maxi Dress",
      "Elegant summer dress with vibrant floral patterns.",
      45.00,
      "https://picsum.photos/seed/womens-dress/600/600",
      10,
      1,
    ],
    [
      6,
      "Silk V-Neck Blouse",
      "Luxurious silk blouse for professional or casual wear.",
      29.50,
      "https://picsum.photos/seed/womens-blouse/600/600",
      8,
      0,
    ],
    [
      7,
      "Leather Desk Mat",
      "Premium waterproof faux leather desk protector.",
      18.50,
      "https://picsum.photos/seed/desk-mat/600/600",
      25,
      0,
    ],
    [
      7,
      "Bamboo Tablet Stand",
      "Eco-friendly adjustable stand for tablets and phones.",
      12.00,
      "https://picsum.photos/seed/tablet-stand/600/600",
      30,
      1,
    ],
  ] as const;

  for (const item of products) {
    createProductMemory({
      categoryId: item[0],
      name: item[1],
      description: item[2],
      price: item[3],
      image: item[4],
      stock: item[5],
      featured: Boolean(item[6]),
    });
  }

  state.adminUsers.push({
    id: state.ids.admin++,
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    role: "admin",
  });
}

export async function getCategoriesMemory() {
  return [...state.categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategoryMemory(name: string, description: string) {
  const exists = state.categories.some(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (exists) throw new Error("Category already exists.");

  state.categories.push({
    id: state.ids.category++,
    name: name.trim(),
    description: description.trim() || null,
    created_at: now(),
  });
}

export async function updateCategoryMemory(
  id: number,
  name: string,
  description: string,
) {
  const category = state.categories.find((c) => c.id === id);
  if (!category) throw new Error("Category not found.");
  category.name = name.trim();
  category.description = description.trim() || null;
}

export async function deleteCategoryMemory(id: number) {
  state.categories = state.categories.filter((c) => c.id !== id);
  state.products = state.products.filter((p) => p.category_id !== id);
  state.cartItems = state.cartItems.filter((ci) =>
    state.products.some((p) => p.id === ci.product_id),
  );
}

export async function getProductsMemory(
  filters: {
    categoryId?: number | null;
    search?: string;
    sortBy?: "newest" | "priceAsc" | "priceDesc";
    featuredOnly?: boolean;
  } = {},
) {
  let rows = state.products.filter((p) => p.status === "active");

  if (filters.categoryId) {
    rows = rows.filter((p) => p.category_id === filters.categoryId);
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    rows = rows.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (filters.featuredOnly) {
    rows = rows.filter((p) => p.featured === 1);
  }

  if (filters.sortBy === "priceAsc")
    rows = rows.sort((a, b) => a.price - b.price);
  if (filters.sortBy === "priceDesc")
    rows = rows.sort((a, b) => b.price - a.price);
  if (!filters.sortBy || filters.sortBy === "newest") {
    rows = rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  return rows.map((p) => ({
    ...p,
    category_name:
      state.categories.find((c) => c.id === p.category_id)?.name ?? "Unknown",
  }));
}

export async function getProductByIdMemory(id: number) {
  const product = state.products.find((p) => p.id === id);
  if (!product) return null;
  return {
    ...product,
    category_name:
      state.categories.find((c) => c.id === product.category_id)?.name ??
      "Unknown",
  };
}

export async function createProductMemory(input: {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  featured: boolean;
}) {
  state.products.push({
    id: state.ids.product++,
    category_id: input.categoryId,
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    image: input.image.trim() || null,
    stock: input.stock,
    featured: input.featured ? 1 : 0,
    status: "active",
    created_at: now(),
    updated_at: now(),
  });
}

export async function updateProductMemory(
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
  const product = state.products.find((p) => p.id === id);
  if (!product) throw new Error("Product not found.");

  product.category_id = input.categoryId;
  product.name = input.name.trim();
  product.description = input.description.trim();
  product.price = input.price;
  product.image = input.image.trim() || null;
  product.stock = input.stock;
  product.featured = input.featured ? 1 : 0;
  product.status = input.status;
  product.updated_at = now();
}

export async function deleteProductMemory(id: number) {
  state.products = state.products.filter((p) => p.id !== id);
  state.cartItems = state.cartItems.filter((ci) => ci.product_id !== id);
}

export async function getCartItemsMemory(): Promise<CartItem[]> {
  return state.cartItems
    .map((item) => {
      const product = state.products.find((p) => p.id === item.product_id);
      if (!product) return null;
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        created_at: item.created_at,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image,
        product_stock: product.stock,
      };
    })
    .filter((item): item is CartItem => Boolean(item));
}

export async function addToCartMemory(productId: number, quantity: number) {
  const product = state.products.find((p) => p.id === productId);
  if (!product || product.stock <= 0)
    throw new Error("This product is out of stock.");

  const existing = state.cartItems.find((ci) => ci.product_id === productId);
  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stock)
    throw new Error("Quantity exceeds available stock.");

  if (existing) {
    existing.quantity = newQty;
  } else {
    state.cartItems.push({
      id: state.ids.cart++,
      product_id: productId,
      quantity,
      created_at: now(),
    });
  }
}

export async function updateCartItemQuantityMemory(
  productId: number,
  quantity: number,
) {
  const item = state.cartItems.find((ci) => ci.product_id === productId);
  if (!item) return;
  if (quantity <= 0) {
    await removeCartItemMemory(productId);
    return;
  }

  const product = state.products.find((p) => p.id === productId);
  if (!product || quantity > product.stock)
    throw new Error("Quantity exceeds available stock.");
  item.quantity = quantity;
}

export async function removeCartItemMemory(productId: number) {
  state.cartItems = state.cartItems.filter((ci) => ci.product_id !== productId);
}

export async function clearCartMemory() {
  state.cartItems = [];
}

export async function placeOrderMemory(payload: CheckoutPayload) {
  const cartItems = await getCartItemsMemory();
  if (cartItems.length === 0) throw new Error("Your cart is empty.");

  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.product_price * i.quantity,
    0,
  );
  const total = subtotal;
  const orderNumber = `ORD-${Date.now()}`;

  const orderId = state.ids.order++;
  state.orders.push({
    id: orderId,
    order_number: orderNumber,
    customer_name: payload.customerName.trim(),
    customer_phone: payload.customerPhone.trim(),
    customer_address: payload.customerAddress.trim(),
    payment_method: payload.paymentMethod,
    subtotal,
    total,
    status: "Pending",
    created_at: now(),
  });

  for (const item of cartItems) {
    state.orderItems.push({
      id: state.ids.orderItem++,
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      line_total: item.product_price * item.quantity,
    });

    const product = state.products.find((p) => p.id === item.product_id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updated_at = now();
    }
  }

  state.cartItems = [];
  return orderNumber;
}

export async function getOrderByOrderNumberMemory(orderNumber: string) {
  return state.orders.find((o) => o.order_number === orderNumber) ?? null;
}

export async function getOrderItemsMemory(orderId: number) {
  return state.orderItems
    .filter((oi) => oi.order_id === orderId)
    .sort((a, b) => b.id - a.id);
}

export async function getOrdersMemory() {
  return [...state.orders].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export async function updateOrderStatusMemory(id: number, status: OrderStatus) {
  const order = state.orders.find((o) => o.id === id);
  if (order) order.status = status;
}

export async function verifyAdminMemory(username: string, password: string) {
  return (
    state.adminUsers.find(
      (u) => u.username === username.trim() && u.password === password,
    ) ?? null
  );
}

export async function getDashboardStatsMemory() {
  return {
    totalCategories: state.categories.length,
    totalProducts: state.products.length,
    lowStockProducts: state.products.filter(
      (p) => p.stock <= LOW_STOCK_THRESHOLD,
    ).length,
    totalOrders: state.orders.length,
  };
}
