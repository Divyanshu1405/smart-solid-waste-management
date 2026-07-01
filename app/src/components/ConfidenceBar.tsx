import { View, Text, StyleSheet } from "react-native";

import { colors, confidenceStyle, radius, spacing } from "../theme";

interface Props {
  // model confidence in the 0..1 range
  value: number;
  // show the "AI Confidence" caption + band label above the bar
  showLabel?: boolean;
}

export default function ConfidenceBar({ value, showLabel = true }: Props) {
  const c = confidenceStyle(value);
  const width = Math.max(4, Math.min(100, c.pct));

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel={`AI confidence ${c.pct} percent, ${c.label}`}
      accessibilityValue={{ min: 0, max: 100, now: c.pct }}
    >
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.caption}>AI confidence</Text>
          <Text style={[styles.pct, { color: c.fg }]}>
            {c.pct}% • {c.label}
          </Text>
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${width}%`, backgroundColor: c.fg }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs + 4,
  },
  caption: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  pct: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});
