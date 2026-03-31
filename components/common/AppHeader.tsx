import { APP_NAME } from "@/constants/app";
import { BRAND_LOGO } from "@/constants/branding";
import { useCart } from "@/context/CartContext";
import { Link } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title?: string;
  subtitle?: string;
};

export function AppHeader({ title = APP_NAME, subtitle }: Props) {
  const { cartCount } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.brandWrap}>
        <Image source={BRAND_LOGO} style={styles.logo} />
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <Link href="/(tabs)/cart" asChild>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartText}>Cart ({cartCount})</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    marginTop: 4,
    color: "#6B7280",
  },
  cartButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cartText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
