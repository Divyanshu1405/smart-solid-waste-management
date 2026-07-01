import type { ReportStatus } from "./status";

export interface Report {
  id: number;
  latitude: number;
  longitude: number;

  original_image_url: string;
  annotated_image_url: string;

  garbage_detected: boolean;
  garbage_count: number;

  highest_confidence: number;

  status: ReportStatus;

  created_at: string;
}
