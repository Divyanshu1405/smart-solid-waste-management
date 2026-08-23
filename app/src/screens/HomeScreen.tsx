import { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getReports } from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import FadeInView from "../components/FadeInView";
import ScalePressable from "../components/ScalePressable";
import { colors, radius, shadow, spacing, typography } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import type { ReportStatus } from "../types/status";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { email, signOut } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!email) {
        throw new Error("Not signed in");
      }

      const data = await getReports(email);

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
        <View style={styles.heroCircleLg} />
        <View style={styles.heroCircleSm} />
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroInner}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../../assets/adaptive-icon.png")}
                  style={styles.logoImage}
                />
              </View>
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={styles.heroTitle}>CivicX</Text>
                <Text style={styles.heroSubtitle} numberOfLines={1}>
                  {email ?? "Garbage reporting"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => void signOut()}
                style={styles.logoutButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroLead}>
              Report waste and follow its progress.
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

        <FadeInView delay={60}>
          <ActionCard
            icon="camera"
            tint={colors.primary}
            tintSoft={colors.primarySoft}
            title="Submit Report"
            desc="Add a photo and submit a report."
            onPress={() => navigation.navigate("Report")}
          />
        </FadeInView>

        <FadeInView delay={140}>
          <ActionCard
            icon="list"
            tint={colors.inProgress}
            tintSoft={colors.inProgressSoft}
            title="My Reports"
            desc="See progress on submitted reports."
            onPress={() => navigation.navigate("Reports")}
          />
        </FadeInView>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>How it works</Text>
          <TipStep icon="camera-outline" text="Take a clear photo" />
          <TipStep icon="location-outline" text="We add your location" />
          <TipStep icon="scan-outline" text="AI checks the image" />
          <TipStep icon="checkmark-done-outline" text="Track report progress" />
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
    <ScalePressable
      style={styles.actionCard}
      onPress={onPress}
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
    </ScalePressable>
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
    borderBottomLeftRadius: radius.lg + 8,
    borderBottomRightRadius: radius.lg + 8,
    overflow: "hidden",
  },
  heroCircleLg: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroCircleSm: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  logoImage: {
    width: 48,
    height: 48,
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
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    ...typography.supporting,
    color: colors.primarySoft,
    marginTop: 2,
  },
  heroLead: {
    ...typography.body,
    color: colors.white,
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
    ...typography.label,
    color: colors.primarySoft,
    marginTop: 2,
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
    ...typography.supporting,
  },
  heroError: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroErrorText: {
    color: colors.white,
    ...typography.supporting,
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
    ...typography.label,
    fontWeight: "700",
  },
  body: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
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
    ...typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  actionDesc: {
    ...typography.supporting,
    color: colors.textMuted,
    marginTop: 4,
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
    ...typography.sectionTitle,
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
    ...typography.supporting,
    color: colors.primaryDark,
    marginLeft: spacing.sm,
  },
});
