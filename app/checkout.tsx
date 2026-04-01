import { PAYMENT_INSTRUCTIONS, PAYMENT_METHODS } from "@/constants/payments";
import { useCart } from "@/context/CartContext";
import { getPendingOrderIntentCount, placeOrder } from "@/database/shopService";
import { PaymentMethod } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { isPhoneValid, isRequired } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const { cartItems, cartTotal, refreshCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const pendingQueueCount = getPendingOrderIntentCount();

  const onPlaceOrder = async () => {
    if (
      !isRequired(customerName) ||
      !isRequired(customerAddress) ||
      !isRequired(customerPhone)
    ) {
      Alert.alert("Validation", "Please complete all required fields.");
      return;
    }

    if (!isPhoneValid(customerPhone)) {
      Alert.alert("Validation", "Please enter a valid phone number.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Checkout", "Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await placeOrder({
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod,
      });

      await refreshCart();

      if (result.status === "placed") {
        router.replace({
          pathname: "/order-confirmation/[orderNumber]",
          params: { orderNumber: result.orderNumber },
        });
      } else {
        Alert.alert(
          "Queued Offline",
          "You are offline. Your order has been queued and will sync automatically when connection is restored.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/orders"),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        "Checkout",
        error instanceof Error ? error.message : "Failed to place order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Checkout</Text>

        {pendingQueueCount > 0 ? (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineNoticeText}>
              {pendingQueueCount} queued order{pendingQueueCount > 1 ? "s" : ""}{" "}
              waiting for sync.
            </Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Delivery Address"
          value={customerAddress}
          onChangeText={setCustomerAddress}
          multiline
        />

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentWrap}>
          {PAYMENT_METHODS.map((method) => {
            const active = method === paymentMethod;
            return (
              <TouchableOpacity
                key={method}
                style={[styles.methodChip, active ? styles.methodActive : null]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text
                  style={[
                    styles.methodText,
                    active ? styles.methodTextActive : null,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Payment Instructions</Text>
          <Text style={styles.instructionsText}>
            {PAYMENT_INSTRUCTIONS[paymentMethod]}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryName}>
                {item.product_name} x{item.quantity}
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(item.product_price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {formatCurrency(cartTotal)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.placeButton,
            submitting ? styles.buttonDisabled : null,
          ]}
          onPress={onPlaceOrder}
          disabled={submitting}
        >
          <Text style={styles.placeButtonText}>
            {submitting ? "Placing Order..." : "Place Order"}
          </Text>
        </TouchableOpacity>
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
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
  },
  offlineNotice: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  offlineNoticeText: {
    color: "#92400E",
    fontWeight: "600",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  paymentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  methodChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  methodActive: {
    borderColor: "#0EA5E9",
    backgroundColor: "#E0F2FE",
  },
  methodText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "600",
  },
  methodTextActive: {
    color: "#0369A1",
  },
  instructionsCard: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 12,
  },
  instructionsTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#1E3A8A",
  },
  instructionsText: {
    color: "#1F2937",
    lineHeight: 20,
  },
  summaryCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryName: {
    color: "#374151",
    flex: 1,
    marginRight: 8,
  },
  summaryValue: {
    color: "#111827",
    fontWeight: "600",
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 10,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F766E",
  },
  placeButton: {
    marginTop: 14,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  placeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
