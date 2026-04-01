import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryChip } from "@/components/shop/CategoryChip";
import { EmptyState } from "@/components/common/EmptyState";
import { useEffect, useState, useMemo } from "react";
import { getProducts, getCategories } from "@/database/shopService";
import { Product, Category } from "@/types/models";
import { Link } from "expo-router";

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(prodData);
        setCategories(catData);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.featured === 1)
      .filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
  }, [products, search]);

  const previewCategories = useMemo(() => categories.slice(0, 5), [categories]);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader subtitle="Discover featured picks and latest deals" />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search featured products"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <Link href="/(tabs)/shop" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0EA5E9" />
        ) : featuredProducts.length === 0 ? (
          <EmptyState
            title="No featured products"
            description="Try another search keyword or add featured products in admin."
          />
        ) : (
          <FlatList
            data={featuredProducts}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ProductCard product={item} compact />}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Preview</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {previewCategories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={false}
              onPress={() => undefined}
            />
          ))}
        </ScrollView>

        <Link href="/(tabs)/shop" asChild>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Go to Shop</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    padding: 16,
    paddingBottom: 100, // Account for custom tab bar
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  linkText: {
    color: "#0EA5E9",
    fontWeight: "600",
    fontSize: 14,
  },
  catScroll: {
    paddingBottom: 8,
  },
  shopButton: {
    backgroundColor: "#0EA5E9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
