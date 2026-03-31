import { Link } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminEntryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Area</Text>
        <Text style={styles.description}>
          Manage categories, products, and orders in the admin dashboard.
        </Text>

        <Link href="/admin/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to Admin Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 18,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
