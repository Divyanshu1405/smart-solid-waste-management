import type { Report } from "../types/report";

export type RootStackParamList = {
  Login: undefined;
  VerifyEmail: undefined;
  Home: undefined;
  Report: undefined;
  Reports: undefined;
  ReportDetails: {
    report: Report;
  };
};
