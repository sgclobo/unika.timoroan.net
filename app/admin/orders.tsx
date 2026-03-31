import { useAdminAuth } from "@/context/AdminAuthContext";
import { getOrders, updateOrderStatus } from "@/database/shopService";
import { Order, OrderStatus } from "@/types/models";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Delivered",
  "Cancelled",
];

export default function OrdersScreen() {
  const { adminUser } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!adminUser) {
      router.replace("/admin/login");
      return;
    }

    loadOrders();
  }, [adminUser]);

  const loadOrders = async () => {
    const rows = await getOrders();
    setOrders(rows);
  };

  const onStatusChange = async (orderId: number, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    Alert.alert("Order", "Order status updated.");
    await loadOrders();
  };

  if (!adminUser) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Orders</Text>

        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.orderNo}>{order.order_number}</Text>
            <Text style={styles.meta}>Customer: {order.customer_name}</Text>
            <Text style={styles.meta}>
              Total: {formatCurrency(order.total)}
            </Text>
            <Text style={styles.meta}>Payment: {order.payment_method}</Text>
            <Text style={styles.meta}>Status: {order.status}</Text>
            <Text style={styles.meta}>
              Created: {formatDateTime(order.created_at)}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {ORDER_STATUSES.map((status) => {
                const active = order.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusChip,
                      active ? styles.statusChipActive : null,
                    ]}
                    onPress={() => onStatusChange(order.id, status)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        active ? styles.statusChipTextActive : null,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))}

        {orders.length === 0 ? (
          <Text style={styles.empty}>No orders yet.</Text>
        ) : null}
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
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
  },
  orderNo: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 15,
    marginBottom: 6,
  },
  meta: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 2,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  statusChipText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "600",
  },
  statusChipTextActive: {
    color: "#fff",
  },
  empty: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
});
