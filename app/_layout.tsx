import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { CartProvider } from "@/context/CartContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import "react-native-reanimated";

// REBUILD_ID: 1775028680
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={styles.container}>
      <AdminAuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1, backgroundColor: "#F3F4F6" } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{ title: "Product Details", headerShown: true }}
            />
            <Stack.Screen name="checkout" options={{ title: "Checkout", headerShown: true }} />
            <Stack.Screen
              name="order-confirmation/[orderNumber]"
              options={{ title: "Order Confirmation", headerShown: true }}
            />
            <Stack.Screen name="admin/login" options={{ title: "Admin Login", headerShown: true }} />
            <Stack.Screen
              name="admin/dashboard"
              options={{ title: "Admin Dashboard", headerShown: true }}
            />
            <Stack.Screen
              name="admin/categories"
              options={{ title: "Manage Categories", headerShown: true }}
            />
            <Stack.Screen
              name="admin/products"
              options={{ title: "Manage Products", headerShown: true }}
            />
            <Stack.Screen name="admin/orders" options={{ title: "Orders", headerShown: true }} />
          </Stack>
          <StatusBar style="auto" />
        </CartProvider>
      </AdminAuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: "#F3F4F6",
    // @ts-ignore - web only property
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
  },
});
