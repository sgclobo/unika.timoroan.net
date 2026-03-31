import { BRAND_LOGO } from "@/constants/branding";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/database/shopService";
import { Product } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { parseProductImages } from "@/utils/productImages";
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
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const item = await getProductById(Number(id));
      setProduct(item);
      setActiveImage(0);
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
  const images = parseProductImages(product.image);
  const heroImage = images[activeImage] ?? images[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandRow}>
          <Image source={BRAND_LOGO} style={styles.brandLogo} />
          <Text style={styles.brandText}>Unika Online</Text>
        </View>

        <Image source={{ uri: heroImage }} style={styles.image} />
        {images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbRow}
          >
            {images.map((image, index) => {
              const active = index === activeImage;
              return (
                <TouchableOpacity
                  key={`${product.id}-${index}`}
                  style={[
                    styles.thumbWrap,
                    active ? styles.thumbWrapActive : null,
                  ]}
                  onPress={() => setActiveImage(index)}
                >
                  <Image source={{ uri: image }} style={styles.thumbImage} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  brandText: {
    color: "#075985",
    fontWeight: "700",
    fontSize: 13,
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
    marginBottom: 10,
    backgroundColor: "#E5E7EB",
  },
  thumbRow: {
    marginBottom: 8,
  },
  thumbWrap: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 2,
  },
  thumbWrapActive: {
    borderColor: "#0284C7",
  },
  thumbImage: {
    width: 66,
    height: 66,
    borderRadius: 8,
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
    marginTop: 8,
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
