import api from "./api";

import { Report } from "../types/report";
import type { ReportStatus } from "../types/status";

// Dashboard-side statuses for a WasteReport.
type DashboardStatus = "PENDING" | "PROCESSED" | "FAILED";

interface DashboardDetectedItem {
  id: string;
  label: string;
  confidence: number;
}

interface DashboardReport {
  id: string;
  imageUrl: string;
  status: DashboardStatus;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  detectedItemsCount: number;
  createdAt: string;
  detectedItems: DashboardDetectedItem[];
}

const STATUS_MAP: Record<DashboardStatus, ReportStatus> = {
  PENDING: "PENDING",
  PROCESSED: "RESOLVED",
  FAILED: "REJECTED",
};

// Report ids are long strings (the dashboard uses the image URL / uuid), so
// derive something short and stable enough to show as "Report #XXXXXX".
function toDisplayId(id: string): string {
  const lastSegment = id.split("/").pop() ?? id;
  const withoutExtension = lastSegment.replace(/\.[a-z0-9]+$/i, "");
  return withoutExtension.slice(-6).toUpperCase();
}

function toReport(raw: DashboardReport): Report {
  const detectedItems = raw.detectedItems ?? [];

  return {
    id: raw.id,
    display_id: toDisplayId(raw.id),
    latitude: raw.latitude,
    longitude: raw.longitude,
    address: raw.address,
    original_image_url: raw.imageUrl,
    garbage_detected: raw.detectedItemsCount > 0,
    garbage_count: raw.detectedItemsCount,
    highest_confidence: detectedItems.reduce(
      (max, item) => Math.max(max, item.confidence),
      0,
    ),
    status: STATUS_MAP[raw.status] ?? "PENDING",
    created_at: raw.createdAt,
    detected_items: detectedItems.map((item) => ({
      id: item.id,
      label: item.label,
      confidence: item.confidence,
    })),
  };
}

// Only the signed-in citizen's reports come back — the dashboard filters by
// email server-side, which is exactly the per-citizen visibility we want.
export async function getReports(userEmail: string): Promise<Report[]> {
  const response = await api.post("/api/v1/mycomplaints", { userEmail });
  const reports: DashboardReport[] = response.data?.reports ?? [];
  return reports.map(toReport);
}
