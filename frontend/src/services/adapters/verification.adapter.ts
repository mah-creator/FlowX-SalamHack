import type { ApiVerification } from "../types";
import { dropUndefined, isRecord, readString } from "./adapterUtils";

export function toVerification(raw: unknown): ApiVerification {
  const source = isRecord(raw) ? raw : {};
  return {
    id: readString(source, ["id"]),
    userId: readString(source, ["userId", "user_id"]),
    status: readString(
      source,
      ["status"],
      "PENDING",
    ) as ApiVerification["status"],
    level: readString(source, ["level"], "Basic") as ApiVerification["level"],
    documentType: readString(
      source,
      ["documentType", "document_type"],
      "passport",
    ),
    submittedAt: readString(source, ["submittedAt", "submitted_at"]),
    reviewedAt: readString(source, ["reviewedAt", "reviewed_at"]) || null,
    reviewerId: readString(source, ["reviewerId", "reviewer_id"]) || null,
    rejectionReason:
      readString(source, ["rejectionReason", "rejection_reason"]) || null,
  };
}

export function toVerifications(raw: unknown): ApiVerification[] {
  return Array.isArray(raw) ? raw.map(toVerification) : [];
}

export function fromVerificationPayload(payload: Partial<ApiVerification>) {
  return dropUndefined({
    id: payload.id,
    userId: payload.userId,
    status: payload.status,
    level: payload.level,
    documentType: payload.documentType,
    submittedAt: payload.submittedAt,
    reviewedAt: payload.reviewedAt,
    reviewerId: payload.reviewerId,
    rejectionReason: payload.rejectionReason,
  });
}
