import { EmptyState } from "@/components/common/EmptyState";
import { SearchBar } from "@/components/common/SearchBar";
import { CategoryChip } from "@/components/shop/CategoryChip";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProducts } from "@/database/shopService";
import { Category, Product } from "@/types/models";
import { useEffect, useState } from "react";
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

const SORT_OPTIONS: {
  label: string;
  value: "newest" | "priceAsc" | "priceDesc";
}[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
];

export default function ShopScreen() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">(
    "newest",
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({
          categoryId: selectedCategoryId,
          sortBy,
          search,
        }),
      ]);
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    };

    load();
  }, [selectedCategoryId, search, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Shop</Text>
        <SearchBar value={search} onChangeText={setSearch} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <CategoryChip
            label="All"
            active={selectedCategoryId === null}
            onPress={() => setSelectedCategoryId(null)}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={selectedCategoryId === category.id}
              onPress={() => setSelectedCategoryId(category.id)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortRow}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortChip,
                sortBy === option.value ? styles.sortChipActive : null,
              ]}
              onPress={() => setSortBy(option.value)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === option.value ? styles.sortChipTextActive : null,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0EA5E9"
            style={{ marginTop: 20 }}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try another search or category."
          />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sortRow: {
    marginTop: 10,
    marginBottom: 12,
    maxHeight: 42,
  },
  sortChip: {
    marginRight: 8,
    backgroundColor: "#fff",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sortChipActive: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  sortChipText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  sortChipTextActive: {
    color: "#fff",
  },
  row: {
    gap: 10,
  },
});
