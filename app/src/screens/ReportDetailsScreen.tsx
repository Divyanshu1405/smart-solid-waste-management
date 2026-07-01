import { useState } from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BASE_URL } from "../config/api";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import ConfidenceBar from "../components/ConfidenceBar";
import { colors, radius, shadow, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { joinUrl } from "../utils/url";

type ReportDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ReportDetails"
>;

export default function ReportDetailsScreen({
  route,
}: ReportDetailsScreenProps) {
  const { report } = route.params;

  const [view, setView] = useState<"annotated" | "original">("annotated");

  const imageUrl =
    view === "annotated"
      ? report.annotated_image_url
      : report.original_image_url;

  const openMap = () => {
    const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Cannot open maps", "No map app available."),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Report #{report.id}</Text>
          <StatusBadge status={report.status} />
        </View>

        <View style={styles.toggle}>
          <ToggleTab
            label="AI Detection"
            icon="scan"
            active={view === "annotated"}
            onPress={() => setView("annotated")}
          />
          <ToggleTab
            label="Original"
            icon="image"
            active={view === "original"}
            onPress={() => setView("original")}
          />
        </View>

        <View style={styles.imageCard}>
          {imageUrl ? (
            <Image
              source={{ uri: joinUrl(BASE_URL, imageUrl) }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imageMissing}>
              <Ionicons
                name="image-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.imageMissingText}>Image not available</Text>
            </View>
          )}
        </View>

        <View style={styles.detectionCard}>
          <ConfidenceBar value={report.highest_confidence} />
          <Text style={styles.explainer}>
            How sure the app is that garbage is present.
          </Text>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{report.garbage_count}</Text>
              <Text style={styles.statLabel}>Items found</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {report.garbage_detected ? "Yes" : "No"}
              </Text>
              <Text style={styles.statLabel}>Garbage present</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>STATUS</Text>
        <View style={styles.statusCard}>
          <StatusTimeline status={report.status} />
          <View style={styles.officerNote}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.officerNoteText}>
              Status is updated by municipal staff.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>LOCATION</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="navigate"
            label="Coordinates"
            value={`${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="time"
            label="Reported"
            value={new Date(report.created_at).toLocaleString()}
          />
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          activeOpacity={0.85}
          onPress={openMap}
          accessibilityRole="button"
          accessibilityLabel="View report location on map"
        >
          <Ionicons name="map" size={18} color={colors.primary} />
          <Text style={styles.mapButtonText}>Open map</Text>
          <Ionicons name="open-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleTab({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} image`}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? colors.white : colors.primaryDark}
      />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelWrap}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: spacing.sm + 3,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
    marginLeft: spacing.xs + 2,
  },
  tabTextActive: {
    color: colors.white,
  },
  imageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  image: {
    width: "100%",
    height: 320,
  },
  imageMissing: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  imageMissingText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  detectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    padding: spacing.lg + 2,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  explainer: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 19,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statSep: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    padding: spacing.lg + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  officerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  officerNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    lineHeight: 17,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    padding: spacing.lg + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  infoLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(15,138,76,0.1)",
  },
  mapButtonText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.primary,
    marginHorizontal: spacing.sm,
  },
});
