import { LOW_STOCK_THRESHOLD } from "@/constants/app";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { Link } from "expo-router";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  product: Product;
  compact?: boolean;
};

export function ProductCard({ product, compact = false }: Props) {
  const { addItem } = useCart();

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  const onAddToCart = async () => {
    try {
      await addItem(product.id, 1);
      Alert.alert("Added", `${product.name} added to cart.`);
    } catch (error) {
      Alert.alert(
        "Cart",
        error instanceof Error ? error.message : "Cannot add item.",
      );
    }
  };

  return (
    <View style={[styles.card, compact ? styles.compact : null]}>
      <Link
        href={{
          pathname: "/product/[id]",
          params: { id: String(product.id) },
        }}
        asChild
      >
        <TouchableOpacity activeOpacity={0.85}>
          <Image
            source={{
              uri:
                product.image ||
                "https://picsum.photos/seed/fallback-product/600/600",
            }}
            style={styles.image}
          />
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          <View style={styles.metaRow}>
            {product.featured ? (
              <Text style={styles.badge}>Featured</Text>
            ) : null}
            {lowStock ? <Text style={styles.lowStock}>Low stock</Text> : null}
            {outOfStock ? (
              <Text style={styles.outStock}>Out of stock</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={[styles.addButton, outOfStock ? styles.addButtonDisabled : null]}
        onPress={onAddToCart}
        disabled={outOfStock}
      >
        <Text style={styles.addButtonText}>
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    marginBottom: 12,
  },
  compact: {
    minWidth: 180,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#E5E7EB",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    minHeight: 36,
  },
  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F766E",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  badge: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    fontSize: 11,
    fontWeight: "700",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  lowStock: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: 11,
    fontWeight: "700",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  outStock: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    fontSize: 11,
    fontWeight: "700",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
