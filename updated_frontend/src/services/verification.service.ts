import { get, patch, post } from "./apiClient";
import type { ApiVerification } from "./types";

export const verificationService = {
  getUserVerifications: (userId: string) =>
    get<ApiVerification[]>(
      `/verifications?userId=${encodeURIComponent(userId)}`,
    ),
  getAllVerifications: () => get<ApiVerification[]>("/verifications"),
  createVerification: (payload: Partial<ApiVerification>) =>
    post<ApiVerification>("/verifications", payload),
  updateVerification: (id: string, payload: Partial<ApiVerification>) =>
    patch<ApiVerification>(`/verifications/${encodeURIComponent(id)}`, payload),
};
