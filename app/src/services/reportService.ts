import api from "./api";

import { Report } from "../types/report";

export async function getReports(): Promise<Report[]> {
  const response = await api.get("/reports");
  return response.data;
}
