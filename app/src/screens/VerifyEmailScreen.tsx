import { useState } from "react";

import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AppButton from "../components/AppButton";
import FadeInView from "../components/FadeInView";
import { useAuth, authErrorMessage } from "../context/AuthContext";
import { colors, radius, shadow, spacing } from "../theme";

export default function VerifyEmailScreen() {
  const { email, refreshVerification, resendVerification, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const checkNow = async () => {
    setChecking(true);

    try {
      const verified = await refreshVerification();

      if (!verified) {
        Alert.alert(
          "Not verified yet",
          "We couldn't confirm your email yet. Open the link in the email we sent you, then tap Continue again. Check your spam folder too.",
        );
      }
      // If verified, the navigator switches to the app automatically.
    } catch (err) {
      Alert.alert("Check failed", authErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setResending(true);

    try {
      await resendVerification();
      Alert.alert(
        "Email sent",
        `A fresh verification link is on its way to ${email}.`,
      );
    } catch (err) {
      Alert.alert("Could not resend", authErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.body}>
        <FadeInView style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread-outline" size={40} color={colors.primary} />
          </View>

          <Text style={styles.title}>Verify your email</Text>

          <Text style={styles.text}>
            We sent a verification link to{"\n"}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <Text style={styles.textMuted}>
            Open the email and click the link, then come back here and tap
            Continue. Don't forget to check your spam folder.
          </Text>

          <View style={styles.buttonWrap}>
            <AppButton
              title={checking ? "Checking..." : "I've verified — Continue"}
              icon={checking ? undefined : "checkmark-circle"}
              loading={checking}
              onPress={checkNow}
            />
          </View>

          <View style={styles.buttonWrapSm}>
            <AppButton
              title={resending ? "Sending..." : "Resend email"}
              variant="secondary"
              loading={resending}
              onPress={resend}
            />
          </View>

          <View style={styles.buttonWrapSm}>
            <AppButton
              title="Use a different account"
              variant="secondary"
              onPress={() => void signOut()}
            />
          </View>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg + 2,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    ...shadow.card,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  text: {
    fontSize: 14.5,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 21,
  },
  email: {
    fontWeight: "800",
    color: colors.primaryDark,
  },
  textMuted: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 19,
  },
  buttonWrap: {
    alignSelf: "stretch",
    marginTop: spacing.xl,
  },
  buttonWrapSm: {
    alignSelf: "stretch",
    marginTop: spacing.md,
  },
});
