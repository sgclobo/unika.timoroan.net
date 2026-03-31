import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function CategoryChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? styles.activeChip : null]}
    >
      <Text style={[styles.label, active ? styles.activeLabel : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  label: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 12,
  },
  activeLabel: {
    color: "#fff",
  },
});
