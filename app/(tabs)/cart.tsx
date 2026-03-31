import { EmptyState } from "@/components/common/EmptyState";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";
import { Link } from "expo-router";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const { cartItems, cartTotal, updateItemQty, removeItem } = useCart();

  const onUpdateQty = async (productId: number, quantity: number) => {
    try {
      await updateItemQty(productId, quantity);
    } catch (error) {
      Alert.alert(
        "Cart",
        error instanceof Error ? error.message : "Cannot update item.",
      );
    }
  };

  const onRemove = async (productId: number) => {
    await removeItem(productId);
    Alert.alert("Removed", "Item removed from cart.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Shopping Cart</Text>

        {cartItems.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Start adding products from the shop."
          />
        ) : (
          <>
            {cartItems.map((item) => {
              const itemSubtotal = item.product_price * item.quantity;
              return (
                <View key={item.id} style={styles.card}>
                  <Image
                    source={{
                      uri:
                        item.product_image ||
                        "https://picsum.photos/seed/cart-fallback/600/600",
                    }}
                    style={styles.image}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.product_name}</Text>
                    <Text style={styles.price}>
                      {formatCurrency(item.product_price)}
                    </Text>
                    <Text style={styles.subtotal}>
                      Subtotal: {formatCurrency(itemSubtotal)}
                    </Text>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() =>
                          onUpdateQty(item.product_id, item.quantity - 1)
                        }
                      >
                        <Text style={styles.qtyText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() =>
                          onUpdateQty(item.product_id, item.quantity + 1)
                        }
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => onRemove(item.product_id)}
                      >
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
            </View>

            <Link href="/checkout" asChild>
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
    color: "#1F2937",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  name: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111827",
  },
  price: {
    marginTop: 4,
    color: "#0F766E",
    fontWeight: "700",
  },
  subtotal: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12,
  },
  actions: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  qtyValue: {
    marginHorizontal: 10,
    fontWeight: "700",
    minWidth: 22,
    textAlign: "center",
  },
  removeButton: {
    marginLeft: "auto",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 12,
  },
  totalCard: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1F2937",
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 18,
    color: "#0F766E",
  },
  checkoutButton: {
    marginTop: 14,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});
