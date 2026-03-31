import { EmptyState } from "@/components/common/EmptyState";
import { getOrders } from "@/database/shopService";
import { Order } from "@/types/models";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OrdersHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const rows = await getOrders();
    setOrders(rows);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Order History</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0EA5E9"
            style={{ marginTop: 20 }}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Place your first order from the shop."
          />
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <Text style={styles.orderNo}>{order.order_number}</Text>
              <Text style={styles.meta}>
                Date: {formatDateTime(order.created_at)}
              </Text>
              <Text style={styles.meta}>Payment: {order.payment_method}</Text>
              <Text style={styles.meta}>Status: {order.status}</Text>
              <Text style={styles.total}>
                Total: {formatCurrency(order.total)}
              </Text>
            </View>
          ))
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  orderNo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  meta: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 3,
  },
  total: {
    marginTop: 6,
    color: "#0F766E",
    fontWeight: "700",
  },
});
