import { get, patch } from "./apiClient";
import type { ApiUser } from "./types";

export const usersService = {
  getUsers: () => get<ApiUser[]>("/users"),
  getUserById: (id: string) => get<ApiUser>(`/users/${encodeURIComponent(id)}`),
  updateUser: (id: string, payload: Partial<ApiUser>) =>
    patch<ApiUser>(`/users/${encodeURIComponent(id)}`, payload),
};
