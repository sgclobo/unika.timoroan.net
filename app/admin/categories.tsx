import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/database/shopService";
import { Category } from "@/types/models";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ManageCategoriesScreen() {
  const { adminUser } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!adminUser) {
      router.replace("/admin/login");
      return;
    }

    loadCategories();
  }, [adminUser]);

  const loadCategories = async () => {
    const rows = await getCategories();
    setCategories(rows);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Category name is required.");
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, name, description);
        Alert.alert("Saved", "Category updated successfully.");
      } else {
        await createCategory(name, description);
        Alert.alert("Saved", "Category created successfully.");
      }
      resetForm();
      await loadCategories();
    } catch (error) {
      Alert.alert(
        "Category",
        error instanceof Error ? error.message : "Failed to save.",
      );
    }
  };

  const onEdit = (item: Category) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description ?? "");
  };

  const onDelete = async (id: number) => {
    await deleteCategory(id);
    Alert.alert("Deleted", "Category deleted.");
    await loadCategories();
  };

  if (!adminUser) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Manage Categories</Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Category Name"
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />

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

        {categories.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDesc}>
              {item.description || "No description"}
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
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 12,
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
  multiline: {
    minHeight: 76,
    textAlignVertical: "top",
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
  itemDesc: {
    marginTop: 5,
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
