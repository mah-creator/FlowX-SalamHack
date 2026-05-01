import { get } from "./apiClient";
import type { ApiHealth } from "./types";

export const healthService = {
  check: () => get<ApiHealth>("/healthz"),
};
