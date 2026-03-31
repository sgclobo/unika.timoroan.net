import { getOrderByOrderNumber, getOrderItems } from "@/database/shopService";
import { Order, OrderItem } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderConfirmationScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!orderNumber) return;
      const foundOrder = await getOrderByOrderNumber(orderNumber);
      setOrder(foundOrder);

      if (foundOrder) {
        const orderItems = await getOrderItems(foundOrder.id);
        setItems(orderItems);
      }

      setLoading(false);
    };

    load();
  }, [orderNumber]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color="#0EA5E9"
          style={{ marginTop: 30 }}
        />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.success}>Order placed successfully</Text>
        <Text style={styles.orderNumber}>
          Order Number: {order.order_number}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <Text style={styles.cardText}>{order.payment_method}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemName}>
                {item.product_name} x{item.quantity}
              </Text>
              <Text style={styles.itemValue}>
                {formatCurrency(item.line_total)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <Link href="/(tabs)/index" asChild>
          <TouchableOpacity style={styles.homeButton}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Link>
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
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  success: {
    fontSize: 24,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  cardText: {
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    color: "#374151",
    flex: 1,
    marginRight: 8,
  },
  itemValue: {
    color: "#111827",
    fontWeight: "600",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "700",
    color: "#0F766E",
    fontSize: 18,
  },
  homeButton: {
    marginTop: 12,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
