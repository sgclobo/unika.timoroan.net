import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchBar } from "@/components/common/SearchBar";
import { CategoryChip } from "@/components/shop/CategoryChip";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProducts } from "@/database/shopService";
import { Category, Product } from "@/types/models";
import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cats, featured] = await Promise.all([
        getCategories(),
        getProducts({ featuredOnly: true, search }),
      ]);

      setCategories(cats);
      setFeaturedProducts(featured);
      setLoading(false);
    };

    load();
  }, [search]);

  const previewCategories = useMemo(() => categories.slice(0, 5), [categories]);

  return (
    <SafeAreaView style={styles.safeArea}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
  sectionHeader: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  linkText: {
    color: "#0EA5E9",
    fontWeight: "700",
    fontSize: 13,
  },
  shopButton: {
    marginTop: 20,
    backgroundColor: "#0F766E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
