import { View, Text, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { radius, spacing, statusStyle } from "../theme";
import type { ReportStatus } from "../types/status";

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const s = statusStyle(status);

  return (
    <View
      style={[styles.badge, { backgroundColor: s.bg }]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${s.label}`}
    >
      <Ionicons name={s.icon} size={13} color={s.fg} style={styles.icon} />
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "transparent",
  },
  icon: {
    marginRight: spacing.xs + 1,
  },
  text: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
