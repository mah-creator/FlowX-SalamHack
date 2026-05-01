import { get, patch } from "./apiClient";
import type { ApiWallet } from "./types";

export const walletService = {
  getWallets: () => get<ApiWallet[]>("/wallets"),
  getUserWallets: (userId: string) =>
    get<ApiWallet[]>(`/wallets?userId=${encodeURIComponent(userId)}`),
  updateWallet: (id: string, payload: Partial<ApiWallet>) =>
    patch<ApiWallet>(`/wallets/${encodeURIComponent(id)}`, payload),
};
