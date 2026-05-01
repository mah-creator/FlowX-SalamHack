import { get, patch, post } from "./apiClient";
import {
  fromVerificationPayload,
  toVerification,
  toVerifications,
} from "./adapters/verification.adapter";
import type { ApiVerification } from "./types";

export const verificationService = {
  getUserVerifications: async (userId: string) => {
    const verifications = toVerifications(await get<unknown>("/verifications"));
    return verifications.filter(
      (verification) => verification.userId === userId,
    );
  },
  getAllVerifications: async () =>
    toVerifications(await get<unknown>("/verifications")),
  createVerification: async (payload: Partial<ApiVerification>) =>
    toVerification(
      await post<unknown>("/verifications", fromVerificationPayload(payload)),
    ),
  updateVerification: async (id: string, payload: Partial<ApiVerification>) =>
    toVerification(
      await patch<unknown>(
        `/verifications/${encodeURIComponent(id)}`,
        fromVerificationPayload(payload),
      ),
    ),
};
