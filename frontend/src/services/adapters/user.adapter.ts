import type { ApiUser } from "../types";
import {
  dropUndefined,
  isRecord,
  readBoolean,
  readNumber,
  readString,
} from "./adapterUtils";

export function toUser(raw: unknown): ApiUser {
  const source = isRecord(raw) ? raw : {};
  return {
    id: readString(source, ["id"]),
    fullName: readString(source, ["fullName", "full_name", "name"]),
    email: readString(source, ["email"]),
    password: readString(source, ["password"]),
    role:
      readString(source, ["role"], "USER").toUpperCase() === "ADMIN"
        ? "ADMIN"
        : "USER",
    accountType: readString(
      source,
      ["accountType", "account_type"],
      "Individual",
    ) as ApiUser["accountType"],
    country: readString(source, ["country"], "Gaza"),
    phone: readString(source, ["phone"]),
    verified: readBoolean(source, ["verified"]),
    kycLevel: readString(
      source,
      ["kycLevel", "kyc_level"],
      "Basic",
    ) as ApiUser["kycLevel"],
    verificationStatus: readString(
      source,
      ["verificationStatus", "verification_status"],
      "PENDING",
    ) as ApiUser["verificationStatus"],
    trustScore: readNumber(source, ["trustScore", "trust_score"], 70),
    status: readString(source, ["status"], "pending") as ApiUser["status"],
    createdAt: readString(source, ["createdAt", "created_at"]),
  };
}

export function toUsers(raw: unknown): ApiUser[] {
  return Array.isArray(raw) ? raw.map(toUser) : [];
}

export function fromUserPayload(payload: Partial<ApiUser>) {
  return dropUndefined({
    id: payload.id,
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    role: payload.role,
    accountType: payload.accountType,
    country: payload.country,
    phone: payload.phone,
    verified: payload.verified,
    kycLevel: payload.kycLevel,
    verificationStatus: payload.verificationStatus,
    trustScore: payload.trustScore,
    status: payload.status,
    createdAt: payload.createdAt,
  });
}
