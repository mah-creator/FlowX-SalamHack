import { get, patch, post } from "./apiClient";
import type { ApiDispute } from "./types";

export const disputesService = {
  getDisputes: () => get<ApiDispute[]>("/disputes"),
  getUserDisputes: (userId: string) =>
    get<ApiDispute[]>(`/disputes?userId=${encodeURIComponent(userId)}`),
  openDispute: (payload: Partial<ApiDispute>) =>
    post<ApiDispute>("/disputes", payload),
  resolveDispute: (id: string, payload: Partial<ApiDispute>) =>
    patch<ApiDispute>(`/disputes/${encodeURIComponent(id)}`, payload),
};
