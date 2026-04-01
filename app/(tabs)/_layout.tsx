import { Link, Slot, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const pathname = usePathname();

  const tabs = [
    { label: "Home", href: "/(tabs)" as const, icon: "home" as const },
    { label: "Shop", href: "/(tabs)/shop" as const, icon: "basket" as const },
    { label: "Cart", href: "/(tabs)/cart" as const, icon: "cart" as const },
    { label: "Orders", href: "/(tabs)/orders" as const, icon: "list" as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href === "/(tabs)" && pathname === "/");

          return (
            <Link key={tab.href} href={tab.href} asChild>
              <View style={styles.tabItem}>
                <Ionicons
                  name={isActive ? (tab.icon as any) : (`${tab.icon}-outline` as any)}
                  size={24}
                  color={isActive ? "#0EA5E9" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? "#0EA5E9" : "#6B7280" },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: 70,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 15,
    paddingTop: 10,
    justifyContent: "space-around",
    alignItems: "center",
    // Fixed bottom for web stability
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
