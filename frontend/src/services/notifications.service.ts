import { get, patch, post } from "./apiClient";
import type { ApiNotification } from "./types";

export const notificationsService = {
  getUserNotifications: (userId: string) =>
    get<ApiNotification[]>(
      `/notifications?userId=${encodeURIComponent(userId)}`,
    ),
  getAllNotifications: () => get<ApiNotification[]>("/notifications"),
  createNotification: (payload: Partial<ApiNotification>) =>
    post<ApiNotification>("/notifications", payload),
  markRead: (id: string) =>
    patch<ApiNotification>(`/notifications/${encodeURIComponent(id)}`, {
      read: true,
    }),
};
