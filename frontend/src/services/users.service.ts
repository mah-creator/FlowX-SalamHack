import { get, patch } from "./apiClient";
import { fromUserPayload, toUser, toUsers } from "./adapters/user.adapter";
import type { ApiUser } from "./types";

export const usersService = {
  getUsers: async () => toUsers(await get<unknown>("/users")),
  getUserById: async (id: string) =>
    toUser(await get<unknown>(`/users/${encodeURIComponent(id)}`)),
  updateUser: async (id: string, payload: Partial<ApiUser>) =>
    toUser(
      await patch<unknown>(
        `/users/${encodeURIComponent(id)}`,
        fromUserPayload(payload),
      ),
    ),
};
