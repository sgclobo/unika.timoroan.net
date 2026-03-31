import { useAdminAuth } from "@/context/AdminAuthContext";
import { getDashboardStats } from "@/database/shopService";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminDashboardScreen() {
  const { adminUser, logout } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    if (!adminUser) {
      router.replace("/admin/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      const result = await getDashboardStats();
      setStats(result);
      setLoading(false);
    };

    load();
  }, [adminUser]);

  const onLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  if (!adminUser) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0EA5E9"
            style={{ marginTop: 30 }}
          />
        ) : (
          <>
            <View style={styles.statsWrap}>
              <StatCard label="Categories" value={stats.totalCategories} />
              <StatCard label="Products" value={stats.totalProducts} />
              <StatCard label="Low Stock" value={stats.lowStockProducts} />
              <StatCard label="Orders" value={stats.totalOrders} />
            </View>

            <View style={styles.linksWrap}>
              <AdminLink label="Manage Categories" href="/admin/categories" />
              <AdminLink label="Manage Products" href="/admin/products" />
              <AdminLink label="View Orders" href="/admin/orders" />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AdminLink({
  label,
  href,
}: {
  label: string;
  href: "/admin/categories" | "/admin/products" | "/admin/orders";
}) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>{label}</Text>
      </TouchableOpacity>
    </Link>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 12,
  },
  statsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F766E",
  },
  statLabel: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  linksWrap: {
    marginTop: 16,
    gap: 10,
  },
  linkButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontWeight: "700",
  },
});
