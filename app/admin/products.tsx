import { BRAND_LOGO } from "@/constants/branding";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "@/database/shopService";
import { Category, Product } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import { parseProductImages } from "@/utils/productImages";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ProductForm = {
  categoryId: number | null;
  name: string;
  description: string;
  price: string;
  image: string;
  stock: string;
  featured: boolean;
  status: "active" | "inactive";
};

const defaultForm: ProductForm = {
  categoryId: null,
  name: "",
  description: "",
  price: "",
  image: "",
  stock: "",
  featured: false,
  status: "active",
};

export default function ManageProductsScreen() {
  const { adminUser } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!adminUser) {
      router.replace("/admin/login");
      return;
    }

    loadData();
  }, [adminUser]);

  const loadData = async () => {
    const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
    setCategories(cats);
    setProducts(prods);

    setForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId ?? cats[0]?.id ?? null,
    }));
  };

  const resetForm = () => {
    setForm({ ...defaultForm, categoryId: categories[0]?.id ?? null });
    setEditingId(null);
  };

  const onSave = async () => {
    if (
      !form.categoryId ||
      !form.name.trim() ||
      !form.price.trim() ||
      !form.stock.trim()
    ) {
      Alert.alert(
        "Validation",
        "Category, name, price, and stock are required.",
      );
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      Alert.alert("Validation", "Price and stock must be valid numbers.");
      return;
    }

    try {
      if (editingId) {
        await updateProduct(editingId, {
          categoryId: form.categoryId,
          name: form.name,
          description: form.description,
          price,
          image: form.image,
          stock,
          featured: form.featured,
          status: form.status,
        });
        Alert.alert("Saved", "Product updated.");
      } else {
        await createProduct({
          categoryId: form.categoryId,
          name: form.name,
          description: form.description,
          price,
          image: form.image,
          stock,
          featured: form.featured,
        });
        Alert.alert("Saved", "Product created.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      Alert.alert(
        "Product",
        error instanceof Error ? error.message : "Save failed.",
      );
    }
  };

  const onEdit = (item: Product) => {
    setEditingId(item.id);
    setForm({
      categoryId: item.category_id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      image: item.image ?? "",
      stock: String(item.stock),
      featured: item.featured === 1,
      status: item.status,
    });
  };

  const onDelete = async (id: number) => {
    await deleteProduct(id);
    Alert.alert("Deleted", "Product deleted.");
    await loadData();
  };

  const onPickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow media library access to pick an image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked = result.assets[0].uri;
      setForm((prev) => ({
        ...prev,
        image: prev.image.trim() ? `${prev.image}\n${picked}` : picked,
      }));
    }
  };

  if (!adminUser) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandRow}>
          <Image source={BRAND_LOGO} style={styles.brandLogo} />
          <Text style={styles.title}>Manage Products</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}
          >
            {categories.map((cat) => {
              const active = form.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    active ? styles.categoryChipActive : null,
                  ]}
                  onPress={() =>
                    setForm((prev) => ({ ...prev, categoryId: cat.id }))
                  }
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      active ? styles.categoryChipTextActive : null,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={form.name}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, name: value }))
            }
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Description"
            value={form.description}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, description: value }))
            }
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="decimal-pad"
            value={form.price}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, price: value }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Stock Quantity"
            keyboardType="number-pad"
            value={form.stock}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, stock: value }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Image URLs (optional, comma or new line separated)"
            value={form.image}
            onChangeText={(value) =>
              setForm((prev) => ({ ...prev, image: value }))
            }
          />

          <TouchableOpacity style={styles.imagePickerBtn} onPress={onPickImage}>
            <Text style={styles.imagePickerText}>Pick Image from Gallery</Text>
          </TouchableOpacity>

          {form.image.trim()
            ? parseProductImages(form.image).map((image, index) => (
                <Image
                  key={`preview-${index}`}
                  source={{ uri: image }}
                  style={styles.previewImage}
                />
              ))
            : null}

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                form.featured ? styles.toggleBtnActive : null,
              ]}
              onPress={() =>
                setForm((prev) => ({ ...prev, featured: !prev.featured }))
              }
            >
              <Text style={styles.toggleText}>
                Featured: {form.featured ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                form.status === "inactive" ? styles.toggleBtnActive : null,
              ]}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  status: prev.status === "active" ? "inactive" : "active",
                }))
              }
            >
              <Text style={styles.toggleText}>Status: {form.status}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
              <Text style={styles.primaryText}>
                {editingId ? "Update" : "Add"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={resetForm}>
              <Text style={styles.secondaryText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {products.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              {item.category_name} | {formatCurrency(item.price)} | Stock:{" "}
              {item.stock}
            </Text>
            <Text style={styles.itemMeta}>
              {item.featured ? "Featured" : "Standard"} | {item.status}
            </Text>

            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => onEdit(item)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  categoryChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  categoryChipText: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  imagePickerBtn: {
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  imagePickerText: {
    color: "#0369A1",
    fontWeight: "700",
    fontSize: 13,
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#E5E7EB",
  },
  multiline: {
    minHeight: 76,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#CFFAFE",
  },
  toggleText: {
    color: "#1F2937",
    fontWeight: "700",
    fontSize: 12,
  },
  formActions: {
    flexDirection: "row",
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  secondaryText: {
    color: "#374151",
    fontWeight: "700",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
  },
  itemName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  itemMeta: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  itemActions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editText: {
    color: "#0369A1",
    fontWeight: "700",
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 12,
  },
});
