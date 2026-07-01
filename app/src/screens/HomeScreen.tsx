import { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getReports } from "../services/reportService";
import { colors, radius, shadow, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import type { ReportStatus } from "../types/status";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getReports();

      if (!mountedRef.current) {
        return;
      }

      setStats({
        total: data.length,
        pending: countReportsWithStatus(data, "PENDING"),
        resolved: countReportsWithStatus(data, "RESOLVED"),
      });
    } catch {
      if (mountedRef.current) {
        setError("Unable to load dashboard stats.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = navigation.addListener("focus", () => {
      void loadStats();
    });

    void loadStats();

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [navigation]);

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroInner}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Ionicons name="leaf" size={22} color={colors.white} />
              </View>
              <View style={{ marginLeft: spacing.md }}>
                <Text style={styles.heroTitle}>WasteWatch</Text>
                <Text style={styles.heroSubtitle}>Garbage reporting</Text>
              </View>
            </View>

            <Text style={styles.heroLead}>
              Capture a dumping spot, submit it in seconds, and track cleanup
              status.
            </Text>

            <View style={styles.statStrip}>
              <HeroStat value={loading ? null : stats.total} label="Reports" />
              <View style={styles.statDivider} />
              <HeroStat
                value={loading ? null : stats.pending}
                label="Pending"
              />
              <View style={styles.statDivider} />
              <HeroStat
                value={loading ? null : stats.resolved}
                label="Resolved"
              />
            </View>

            {error ? (
              <View style={styles.heroError}>
                <Text style={styles.heroErrorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.heroRetry}
                  onPress={loadStats}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading dashboard stats"
                >
                  <Text style={styles.heroRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : loading ? (
              <View style={styles.heroLoadingRow}>
                <ActivityIndicator color={colors.white} />
                <Text style={styles.heroLoadingText}>
                  Loading recent reports...
                </Text>
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

        <ActionCard
          icon="camera"
          tint={colors.primary}
          tintSoft={colors.primarySoft}
          title="Submit Report"
          desc="Capture or upload a photo for analysis."
          onPress={() => navigation.navigate("Report")}
        />

        <ActionCard
          icon="list"
          tint={colors.inProgress}
          tintSoft={colors.inProgressSoft}
          title="Reports"
          desc="Browse submitted reports and their results."
          onPress={() => navigation.navigate("Reports")}
        />

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>How it works</Text>
          <TipStep
            icon="camera-outline"
            text="Take a clear photo of the area"
          />
          <TipStep
            icon="location-outline"
            text="We attach your location automatically"
          />
          <TipStep icon="scan-outline" text="AI checks for garbage" />
          <TipStep
            icon="checkmark-done-outline"
            text="Track the report until it is closed"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function HeroStat({ value, label }: { value: number | null; label: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value === null ? "--" : value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function countReportsWithStatus(
  reports: { status: ReportStatus }[],
  status: ReportStatus,
) {
  return reports.filter((report) => report.status === status).length;
}

function ActionCard({
  icon,
  tint,
  tintSoft,
  title,
  desc,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  tintSoft: string;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.actionCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${desc}`}
    >
      <View style={[styles.actionIcon, { backgroundColor: tintSoft }]}>
        <Ionicons name={icon} size={24} color={tint} />
      </View>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function TipStep({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.tipStep}>
      <Ionicons name={icon} size={18} color={colors.primaryDark} />
      <Text style={styles.tipStepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: "hidden",
  },
  heroInner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg + 2,
    paddingBottom: spacing.xl + 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: colors.primarySoft,
    marginTop: 2,
  },
  heroLead: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.lg,
    maxWidth: 310,
    opacity: 0.94,
  },
  statStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
  },
  heroStatLabel: {
    fontSize: 10.5,
    color: colors.primarySoft,
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  heroLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  heroLoadingText: {
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 12,
  },
  heroError: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroErrorText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  heroRetry: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  heroRetryText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextWrap: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  actionTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: colors.text,
  },
  actionDesc: {
    fontSize: 13.5,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg + 2,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(15,138,76,0.12)",
  },
  tipTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  tipStep: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  tipStepText: {
    fontSize: 13.5,
    color: colors.primaryDark,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
});
