import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { CartProvider } from "@/context/CartContext";
import { initDatabase } from "@/database/schema";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      await initDatabase();
      setReady(true);
    };

    load();
  }, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  return (
    <AdminAuthProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{ title: "Product Details" }}
          />
          <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
          <Stack.Screen
            name="order-confirmation/[orderNumber]"
            options={{ title: "Order Confirmation" }}
          />
          <Stack.Screen name="admin/login" options={{ title: "Admin Login" }} />
          <Stack.Screen
            name="admin/dashboard"
            options={{ title: "Admin Dashboard" }}
          />
          <Stack.Screen
            name="admin/categories"
            options={{ title: "Manage Categories" }}
          />
          <Stack.Screen
            name="admin/products"
            options={{ title: "Manage Products" }}
          />
          <Stack.Screen name="admin/orders" options={{ title: "Orders" }} />
        </Stack>
      </CartProvider>
    </AdminAuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
});
