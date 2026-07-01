import { NativeModules, Platform } from "react-native";
import { GENERATED_BASE_URL } from "./generatedApi";

const API_PORT = 8000;

function getHostFromUrl(url?: string): string | null {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname;
  } catch {
    const match = url.match(/^(?:[a-z]+:\/\/)?([^/:]+)/i);
    return match?.[1] ?? null;
  }
}

function isLocalhost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function getBundleUrl(): string | undefined {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.href;
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL as string | undefined;
  return scriptUrl;
}

function getDevServerHost(): string | null {
  const devSettingsHost = NativeModules.DevSettings?.getConstants?.()
    ?.serverHost as string | undefined;
  const platformHost = NativeModules.PlatformConstants?.ServerHost as
    | string
    | undefined;

  const host =
    getHostFromUrl(getBundleUrl()) ??
    getHostFromUrl(devSettingsHost) ??
    getHostFromUrl(platformHost);

  if (!host) {
    return null;
  }

  if (Platform.OS === "android" && isLocalhost(host)) {
    return null;
  }

  return host;
}

function getFallbackHost() {
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  return "localhost";
}

const host = getDevServerHost() ?? getFallbackHost();
const detectedBaseUrl = `http://${host}:${API_PORT}`;

export const BASE_URL =
  Platform.OS === "web"
    ? detectedBaseUrl
    : GENERATED_BASE_URL || detectedBaseUrl;

if (__DEV__) {
  console.log("[api] bundle URL:", getBundleUrl() ?? "unknown");
  console.log("[api] detected BASE_URL:", detectedBaseUrl);
  console.log("[api] BASE_URL:", BASE_URL);
}
