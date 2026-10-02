import { DiagnosticResult } from "../types";

export type RootStackParamList = {
  HomeTabs: undefined;
  Quiz: { institutionName: string };
  Result: { result: DiagnosticResult };
};

export type HomeTabParamList = {
  HomeTab: undefined;
  DashboardTab: undefined;
  HistoryTab: undefined;
};
