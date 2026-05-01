import { get, patch, post } from "./apiClient";
import type {
  ApiAuditLog,
  ApiConfig,
  ApiDispute,
  ApiTransfer,
  ApiUser,
  ApiVerification,
} from "./types";

function audit(
  actorId: string,
  actorRole: "ADMIN" | "USER",
  action: string,
  entityType: string,
  entityId: string,
) {
  return post<ApiAuditLog>("/auditLogs", {
    id: `audit-${Date.now()}`,
    actorId,
    actorRole,
    action,
    entityType,
    entityId,
    createdAt: new Date().toISOString(),
  });
}

export const adminService = {
  async getDashboardStats() {
    const [users, transfers, verifications, disputes, config, auditLogs] =
      await Promise.all([
        get<ApiUser[]>("/users"),
        get<ApiTransfer[]>("/transfers"),
        get<ApiVerification[]>("/verifications"),
        get<ApiDispute[]>("/disputes"),
        get<ApiConfig>("/config"),
        get<ApiAuditLog[]>("/auditLogs"),
      ]);
    return { users, transfers, verifications, disputes, config, auditLogs };
  },

  getVerificationQueue: () => get<ApiVerification[]>("/verifications"),

  async approveVerification(
    userId: string,
    verificationId: string,
    reviewerId = "system",
  ) {
    const now = new Date().toISOString();
    const [verification] = await Promise.all([
      patch<ApiVerification>(
        `/verifications/${encodeURIComponent(verificationId)}`,
        {
          status: "VERIFIED",
          reviewedAt: now,
          reviewerId,
        },
      ),
      patch<ApiUser>(`/users/${encodeURIComponent(userId)}`, {
        verified: true,
        kycLevel: "Verified",
        verificationStatus: "VERIFIED",
        status: "active",
      }),
      audit(
        reviewerId,
        "ADMIN",
        "APPROVE_VERIFICATION",
        "verification",
        verificationId,
      ).catch(() => null),
    ]);
    return verification;
  },

  async rejectVerification(
    userId: string,
    verificationId: string,
    reason: string,
    reviewerId = "system",
  ) {
    const now = new Date().toISOString();
    const [verification] = await Promise.all([
      patch<ApiVerification>(
        `/verifications/${encodeURIComponent(verificationId)}`,
        {
          status: "REJECTED",
          reviewedAt: now,
          reviewerId,
          rejectionReason: reason,
        },
      ),
      patch<ApiUser>(`/users/${encodeURIComponent(userId)}`, {
        verificationStatus: "REJECTED",
      }),
      audit(
        reviewerId,
        "ADMIN",
        "REJECT_VERIFICATION",
        "verification",
        verificationId,
      ).catch(() => null),
    ]);
    return verification;
  },

  async requestMoreInfo(
    userId: string,
    verificationId: string,
    note: string,
    reviewerId = "system",
  ) {
    const now = new Date().toISOString();
    const [verification] = await Promise.all([
      patch<ApiVerification>(
        `/verifications/${encodeURIComponent(verificationId)}`,
        {
          status: "NEEDS_INFO",
          reviewedAt: now,
          reviewerId,
          rejectionReason: note,
        },
      ),
      patch<ApiUser>(`/users/${encodeURIComponent(userId)}`, {
        verificationStatus: "NEEDS_INFO",
      }),
      audit(
        reviewerId,
        "ADMIN",
        "REQUEST_VERIFICATION_INFO",
        "verification",
        verificationId,
      ).catch(() => null),
    ]);
    return verification;
  },

  getRiskQueue: () => get<ApiTransfer[]>("/transfers?status=UNDER_REVIEW"),
  approveRiskReview: (transferId: string) =>
    post<ApiTransfer>(
      `/transfers/${encodeURIComponent(transferId)}/risk-approval`,
    ),
  rejectRiskReview: (transferId: string, reason: string) =>
    post<ApiTransfer>(
      `/transfers/${encodeURIComponent(transferId)}/risk-rejection`,
      { reason },
    ),
  getDisputes: () => get<ApiDispute[]>("/disputes"),
  resolveDispute: (disputeId: string, payload: Partial<ApiDispute>) =>
    patch<ApiDispute>(`/disputes/${encodeURIComponent(disputeId)}`, payload),
  refundTransfer: (transferId: string, reason: string) =>
    post<ApiTransfer>(`/transfers/${encodeURIComponent(transferId)}/refund`, {
      reason,
    }),
  updateConfig: (payload: Partial<ApiConfig>) =>
    patch<ApiConfig>("/config", payload),
  getConfig: () => get<ApiConfig>("/config"),
};
