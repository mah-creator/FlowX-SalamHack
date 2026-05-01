import type { ApiNotification } from "../types";
import {
  dropUndefined,
  isRecord,
  readBoolean,
  readString,
} from "./adapterUtils";

export function toNotification(raw: unknown): ApiNotification {
  const source = isRecord(raw) ? raw : {};
  return {
    id: readString(source, ["id"]),
    userId: readString(source, ["userId", "user_id"]),
    title: readString(source, ["title"]),
    message: readString(source, ["message"]),
    read: readBoolean(source, ["read"]),
    type: readString(source, ["type"], "system") as ApiNotification["type"],
    createdAt: readString(source, ["createdAt", "created_at"]),
  };
}

export function toNotifications(raw: unknown): ApiNotification[] {
  return Array.isArray(raw) ? raw.map(toNotification) : [];
}

export function fromNotificationPayload(payload: Partial<ApiNotification>) {
  return dropUndefined({
    id: payload.id,
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    read: payload.read,
    type: payload.type,
    createdAt: payload.createdAt,
  });
}
