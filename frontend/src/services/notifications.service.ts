import { get, patch, post } from "./apiClient";
import {
  fromNotificationPayload,
  toNotification,
  toNotifications,
} from "./adapters/notification.adapter";
import type { ApiNotification } from "./types";

export const notificationsService = {
  getNotifications: async (userId: string) => {
    const notifications = toNotifications(await get<unknown>("/notifications"));
    return notifications.filter(
      (notification) => notification.userId === userId,
    );
  },
  getUserNotifications: async (userId: string) =>
    notificationsService.getNotifications(userId),
  getAllNotifications: async () =>
    toNotifications(await get<unknown>("/notifications")),
  createNotification: async (payload: Partial<ApiNotification>) =>
    toNotification(
      await post<unknown>("/notifications", fromNotificationPayload(payload)),
    ),
  markRead: async (id: string) =>
    toNotification(
      await patch<unknown>(`/notifications/${encodeURIComponent(id)}`, {
        read: true,
      }),
    ),
};
