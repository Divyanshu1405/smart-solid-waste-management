import { useEffect, useMemo, useRef, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Report } from "../types/report";
import { getReports } from "../services/reportService";
import { useAuth } from "../context/AuthContext";

import StatusBadge from "../components/StatusBadge";
import DetectionConfidence from "../components/DetectionConfidence";
import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { colors, radius, shadow, spacing, typography } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import type { ReportStatus } from "../types/status";
import { formatReportDate } from "../utils/date";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "REJECTED", label: "Rejected" },
];

type FilterKey = ReportStatus | "ALL";

type ReportsScreenProps = NativeStackScreenProps<RootStackParamList, "Reports">;

export default function ReportsScreen({ navigation }: ReportsScreenProps) {
  const { email } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadReports = async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading) {
      setLoading(true);
    }

    setError(null);

    try {
      if (!email) {
        throw new Error("Not signed in");
      }

      const data = await getReports(email);

      if (!mountedRef.current) {
        return;
      }

      setReports(data);
    } catch {
      if (mountedRef.current) {
        setError("Unable to load reports.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    void loadReports({ showLoading: true });

    const unsubscribe = navigation.addListener("focus", () => {
      void loadReports();
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
  };

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === "PENDING").length,
      resolved: reports.filter((r) => r.status === "RESOLVED").length,
    }),
    [reports],
  );

  const filtered = useMemo(
    () =>
      filter === "ALL" ? reports : reports.filter((r) => r.status === filter),
    [reports, filter],
  );

  if (error && reports.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.errorState}>
          <Ionicons
            name="cloud-offline-outline"
            size={56}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>Couldn't load reports</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <View style={styles.retryWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void loadReports({ showLoading: true })}
              style={styles.retryButton}
              accessibilityRole="button"
              accessibilityLabel="Retry loading reports"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const Header = (
    <View>
      <View style={styles.statsRow}>
        <StatCard value={stats.total} label="Total" tint={colors.text} />
        <StatCard value={stats.pending} label="Pending" tint={colors.pending} />
        <StatCard
          value={stats.resolved}
          label="Resolved"
          tint={colors.resolved}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filter reports by ${f.label}`}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View style={styles.emptyInline}>
            <Ionicons
              name={
                reports.length === 0 ? "file-tray-outline" : "search-outline"
              }
              size={56}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {reports.length === 0 ? "No reports yet" : "No matching reports"}
            </Text>
            <Text style={styles.emptyText}>
              {reports.length === 0
                ? "Submit your first report from the Home screen."
                : "Try a different filter."}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item, index }) => (
          <FadeInView delay={Math.min(index, 6) * 70}>
            <ScalePressable
              onPress={() =>
                navigation.navigate("ReportDetails", { report: item })
              }
              style={styles.card}
              accessibilityLabel={`Open report ${item.display_id}`}
            >
              <View style={styles.cardTop}>
                <View>
                  <Image
                    source={{ uri: item.original_image_url }}
                    style={styles.thumb}
                  />
                  {item.garbage_count > 0 && (
                    <View style={styles.thumbChip}>
                      <Ionicons name="trash" size={9} color={colors.white} />
                      <Text style={styles.thumbChipText}>
                        {item.garbage_count}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.reportId} numberOfLines={1}>
                      Report #{item.display_id}
                    </Text>
                  </View>

                  <View style={styles.statusWrap}>
                    <StatusBadge
                      status={
                        item.garbage_detected ? item.status : "NO_GARBAGE"
                      }
                    />
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="trash-outline"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.metaText}>
                      {item.garbage_count} items found
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.metaText}>
                      {formatReportDate(item.created_at)}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.textMuted}
                />
              </View>

              <View style={styles.cardConfidence}>
                <DetectionConfidence
                  detected={item.garbage_detected}
                  value={item.highest_confidence}
                />
              </View>
            </ScalePressable>
          </FadeInView>
        )}
      />
    </SafeAreaView>
  );
}

function StatCard({
  value,
  label,
  tint,
}: {
  value: number;
  label: string;
  tint: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.thumb, styles.skel]} />
        <View style={styles.cardBody}>
          <View style={[styles.skel, styles.skelLineWide]} />
          <View style={[styles.skel, styles.skelLine]} />
          <View style={[styles.skel, styles.skelLineSm]} />
        </View>
      </View>
      <View style={[styles.skel, styles.skelBar]} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  chipsRow: {
    paddingVertical: spacing.sm + 2,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    minHeight: 48,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  thumbChip: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,32,22,0.78)",
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  thumbChipText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 2,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md + 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportId: {
    ...typography.body,
    fontWeight: "800",
    color: colors.text,
    flexShrink: 1,
  },
  statusWrap: {
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  metaText: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontWeight: "600",
    marginLeft: spacing.xs + 2,
  },
  cardConfidence: {
    marginTop: spacing.md,
  },
  emptyInline: {
    alignItems: "center",
    paddingVertical: spacing.xxl + 8,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  retryWrap: {
    marginTop: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  skel: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  skelLineWide: {
    height: 14,
    borderRadius: 4,
    width: "60%",
  },
  skelLine: {
    height: 12,
    borderRadius: 4,
    width: "85%",
    marginTop: spacing.sm,
  },
  skelLineSm: {
    height: 12,
    borderRadius: 4,
    width: "45%",
    marginTop: spacing.sm,
  },
  skelBar: {
    height: 8,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
});
