import { useCart } from "@/context/CartContext";
import { getProductById } from "@/database/shopService";
import { Product } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const item = await getProductById(Number(id));
      setProduct(item);
      setLoading(false);
    };
    load();
  }, [id]);

  const onAddToCart = async () => {
    if (!product) return;
    try {
      await addItem(product.id, quantity);
      Alert.alert("Added", `${product.name} added to cart.`);
    } catch (error) {
      Alert.alert(
        "Cart",
        error instanceof Error ? error.message : "Cannot add item.",
      );
    }
  };

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

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{
            uri:
              product.image ||
              "https://picsum.photos/seed/product-detail/800/800",
          }}
          style={styles.image}
        />

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category_name}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={[styles.stock, outOfStock ? styles.outStock : null]}>
          {outOfStock ? "Out of stock" : `Stock: ${product.stock}`}
        </Text>

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyActions}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, outOfStock ? styles.addDisabled : null]}
          onPress={onAddToCart}
          disabled={outOfStock}
        >
          <Text style={styles.addText}>
            {outOfStock ? "Unavailable" : "Add to Cart"}
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
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#E5E7EB",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  category: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  price: {
    marginTop: 8,
    fontSize: 24,
    color: "#0F766E",
    fontWeight: "700",
  },
  description: {
    marginTop: 10,
    color: "#374151",
    lineHeight: 22,
  },
  stock: {
    marginTop: 10,
    color: "#166534",
    fontWeight: "700",
  },
  outStock: {
    color: "#B91C1C",
  },
  qtyRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyLabel: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1F2937",
  },
  qtyActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontWeight: "700",
    fontSize: 16,
  },
  qtyValue: {
    minWidth: 30,
    textAlign: "center",
    fontWeight: "700",
  },
  addButton: {
    marginTop: 16,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  addDisabled: {
    backgroundColor: "#9CA3AF",
  },
  addText: {
    color: "#fff",
    fontWeight: "700",
  },
});
