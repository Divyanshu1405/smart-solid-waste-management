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

import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import DetectionConfidence from "../components/DetectionConfidence";
import FadeInView from "../components/FadeInView";
import { colors, radius, shadow, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { formatReportDate } from "../utils/date";

type ReportDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ReportDetails"
>;

export default function ReportDetailsScreen({
  route,
}: ReportDetailsScreenProps) {
  const { report } = route.params;

  const imageUrl = report.original_image_url;
  const hasCoordinates = report.latitude !== null && report.longitude !== null;

  const openMap = () => {
    if (!hasCoordinates) {
      return;
    }

    const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Cannot open maps", "No map app available."),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Report #{report.display_id}</Text>
          <StatusBadge
            status={report.garbage_detected ? report.status : "NO_GARBAGE"}
          />
        </View>

        <FadeInView style={styles.imageCard}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
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
        </FadeInView>

        <View style={styles.detectionCard}>
          <DetectionConfidence
            detected={report.garbage_detected}
            value={report.highest_confidence}
          />
          <Text style={styles.explainer}>
            {report.garbage_detected
              ? "How sure the app is that garbage is present."
              : "No garbage was detected — showing the original photo."}
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

          {report.detected_items.length > 0 && (
            <>
              <View style={[styles.divider, { marginTop: spacing.md }]} />
              <Text style={styles.itemsLabel}>Detected items</Text>
              {report.detected_items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Ionicons
                    name="trash-outline"
                    size={15}
                    color={colors.primaryDark}
                  />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemConfidence}>
                    {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>STATUS</Text>
        <View style={styles.statusCard}>
          {report.garbage_detected ? (
            <>
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
            </>
          ) : (
            <View style={styles.officerNoteBare}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.textMuted}
              />
              <Text style={styles.officerNoteText}>
                No garbage was detected, so this isn't tracked as an actionable
                complaint — there's nothing for staff to resolve.
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>LOCATION</Text>
        <View style={styles.infoCard}>
          {report.address ? (
            <>
              <InfoRow icon="business" label="Area" value={report.address} />
              <View style={styles.divider} />
            </>
          ) : null}
          <InfoRow
            icon="navigate"
            label="Coordinates"
            value={
              hasCoordinates
                ? `${report.latitude?.toFixed(5)}, ${report.longitude?.toFixed(5)}`
                : "Not available"
            }
          />
          <View style={styles.divider} />
          <InfoRow
            icon="time"
            label="Reported"
            value={formatReportDate(report.created_at)}
          />
        </View>

        {hasCoordinates && (
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
        )}
      </ScrollView>
    </SafeAreaView>
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
  itemsLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  itemLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.sm,
    textTransform: "capitalize",
  },
  itemConfidence: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
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
  officerNoteBare: {
    flexDirection: "row",
    alignItems: "flex-start",
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
