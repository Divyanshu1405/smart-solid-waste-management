import type { Report } from "../types/report";

export type RootStackParamList = {
  Home: undefined;
  Report: undefined;
  Reports: undefined;
  ReportDetails: {
    report: Report;
  };
};
