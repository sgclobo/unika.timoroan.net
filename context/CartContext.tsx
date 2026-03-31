import {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "@/database/shopService";
import { CartItem } from "@/types/models";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItemQty: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    const items = await getCartItems();
    setCartItems(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      await addToCart(productId, quantity);
      await refreshCart();
    },
    [refreshCart],
  );

  const updateItemQty = useCallback(
    async (productId: number, quantity: number) => {
      await updateCartItemQuantity(productId, quantity);
      await refreshCart();
    },
    [refreshCart],
  );

  const removeItemFromCart = useCallback(
    async (productId: number) => {
      await removeCartItem(productId);
      await refreshCart();
    },
    [refreshCart],
  );

  const value = useMemo(() => {
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + item.product_price * item.quantity,
      0,
    );

    return {
      cartItems,
      cartCount,
      cartTotal,
      loading,
      refreshCart,
      addItem,
      updateItemQty,
      removeItem: removeItemFromCart,
    };
  }, [
    addItem,
    cartItems,
    loading,
    refreshCart,
    removeItemFromCart,
    updateItemQty,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
