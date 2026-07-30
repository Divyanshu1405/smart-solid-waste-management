import { useEffect, useRef, useState } from "react";

import { View, Text, Alert, Image, StyleSheet, ScrollView } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { isAxiosError } from "axios";

import { submitReport as uploadReport } from "../services/detectionService";
import { UploadResult } from "../types/detection";
import { useAuth } from "../context/AuthContext";

import AppButton from "../components/AppButton";
import FadeInView from "../components/FadeInView";
import { colors, radius, shadow, spacing, typography } from "../theme";
import type { RootStackParamList } from "../navigation/types";

const LOCATION_TIMEOUT_MS = 20_000;

function getCurrentLocationWithTimeout(): Promise<Location.LocationObject> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("LOCATION_TIMEOUT"));
    }, LOCATION_TIMEOUT_MS);

    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }).then(
      (location) => {
        clearTimeout(timeoutId);
        resolve(location);
      },
      (error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

type ReportScreenProps = NativeStackScreenProps<RootStackParamList, "Report">;

export default function ReportScreen({ navigation }: ReportScreenProps) {
  const { email } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!res.canceled) {
        setImageUri(res.assets[0].uri);
        setResult(null);
      }
    } catch {
      Alert.alert("Couldn't open gallery", "Please try choosing a photo again.");
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Camera permission denied");
      return;
    }

    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!res.canceled) {
        setImageUri(res.assets[0].uri);
        setResult(null);
      }
    } catch {
      Alert.alert("Couldn't open camera", "Please try taking the photo again.");
    }
  };

  const submitReport = async () => {
    if (!imageUri) {
      Alert.alert("No image", "Please select or capture an image first");
      return;
    }

    if (!email) {
      Alert.alert("Not signed in", "Sign in with your email first.");
      return;
    }

    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Location permission denied");
      return;
    }

    setLoading(true);

    try {
      const location = await getCurrentLocationWithTimeout();

      const response = await uploadReport(
        imageUri,
        location.coords.latitude,
        location.coords.longitude,
        email,
      );

      if (mountedRef.current) {
        setResult(response);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "LOCATION_TIMEOUT") {
        Alert.alert(
          "Location unavailable",
          "We couldn't determine your location. Move to an open area or enable location services, then try again.",
        );
        return;
      }

      // Surface the server's own error when there is one — a 500 from the
      // dashboard is very different from having no internet.
      const data = isAxiosError(error)
        ? (error.response?.data as
            | { details?: string; error?: string }
            | undefined)
        : undefined;
      const detail = data?.details ?? data?.error;

      Alert.alert(
        "Submission failed",
        detail
          ? `The dashboard server rejected the report:\n\n"${detail}"\n\nThis is a server-side configuration issue, not a problem with your phone.`
          : "Could not reach the server. Check your internet connection and try again.",
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.pageHeader}>
          <Text style={styles.kicker}>Submit report</Text>
          <Text style={styles.pageTitle}>Report waste</Text>
          <Text style={styles.pageSubtitle}>
            Add a clear photo of the waste.
          </Text>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>Photo</Text>
          </View>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="image-outline"
                size={56}
                color={colors.textMuted}
              />
              <Text style={styles.placeholderText}>No photo selected</Text>
              <Text style={styles.placeholderHint}>
                Take a photo or choose one from your gallery
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Add a photo</Text>
        <View style={styles.actions}>
          <View style={styles.actionHalf}>
            <AppButton title="Camera" icon="camera" onPress={takePhoto} />
          </View>
          <View style={styles.gap} />
          <View style={styles.actionHalf}>
            <AppButton
              title="Gallery"
              icon="images"
              variant="secondary"
              onPress={pickImage}
            />
          </View>
        </View>

        <View style={styles.submitWrap}>
          <AppButton
            title={loading ? "Submitting report..." : "Submit report"}
            icon={loading ? undefined : "scan"}
            loading={loading}
            disabled={!imageUri}
            onPress={submitReport}
          />
        </View>

        {result &&
          (() => {
            const detected = result.status === "success";

            return (
              <FadeInView
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: detected
                      ? colors.resolvedSoft
                      : colors.pendingSoft,
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <View style={styles.resultBadge}>
                    <Ionicons
                      name={detected ? "checkmark" : "time"}
                      size={12}
                      color={detected ? colors.resolved : colors.pending}
                    />
                    <Text style={styles.resultBadgeText}>
                      {detected ? "Report submitted" : "No waste detected"}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultTitleRow}>
                  <Ionicons
                    name={detected ? "checkmark-circle" : "alert-circle"}
                    size={24}
                    color={detected ? colors.resolved : colors.pending}
                  />
                  <Text style={styles.resultTitle}>
                    {detected ? "Report submitted" : "No waste detected"}
                  </Text>
                </View>

                <View style={styles.resultRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>
                      {result.detected_items_count}
                    </Text>
                    <Text style={styles.metricLabel}>Items found</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>
                      {detected ? "Yes" : "No"}
                    </Text>
                    <Text style={styles.metricLabel}>Report filed</Text>
                  </View>
                </View>

                <Text style={styles.savedNote}>
                  {detected
                    ? "You can track progress in My Reports."
                    : "Try another clear photo if you think waste was missed."}
                </Text>

                <View style={{ marginTop: spacing.md }}>
                  {detected && (
                    <AppButton
                      title="View My Reports"
                      variant="secondary"
                      onPress={() => navigation.navigate("Reports")}
                    />
                  )}
                  {detected && <View style={{ height: spacing.sm }} />}
                  <AppButton
                    title="Report Another"
                    variant="secondary"
                    onPress={reset}
                  />
                </View>
              </FadeInView>
            );
          })()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageHeader: {
    marginBottom: spacing.lg,
  },
  kicker: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.primaryDark,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  pageTitle: {
    ...typography.screenTitle,
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  pageSubtitle: {
    ...typography.supporting,
    color: colors.textMuted,
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  previewLabel: {
    ...typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  preview: {
    width: "100%",
    height: 300,
  },
  placeholder: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
  },
  placeholderHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  actionHalf: {
    flex: 1,
  },
  gap: {
    width: spacing.md,
  },
  submitWrap: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  resultCard: {
    marginTop: spacing.xl,
    borderRadius: radius.lg + 2,
    padding: spacing.lg + 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
  },
  resultBadgeText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.text,
    marginLeft: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginLeft: spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  savedNote: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
