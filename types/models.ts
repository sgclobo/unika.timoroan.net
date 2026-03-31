export type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  stock: number;
  featured: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  category_name?: string;
};

export type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  product_stock: number;
};

export type PaymentMethod =
  | "COD"
  | "TPay"
  | "Mosan"
  | "Mandiri"
  | "BNU"
  | "BNCTL"
  | "BNF"
  | "BRI";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Delivered"
  | "Cancelled";

export type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: PaymentMethod;
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total: number;
};

export type AdminUser = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export type CheckoutPayload = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
};
