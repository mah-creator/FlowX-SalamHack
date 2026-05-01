import { get, patch, post } from "./apiClient";
import {
  fromWalletPayload,
  toWallet,
  toWallets,
} from "./adapters/wallet.adapter";
import type { ApiWallet } from "./types";

export const walletService = {
  getWallets: async () => toWallets(await get<unknown>("/wallets")),
  async getWallet(userId: string) {
    const wallets = await this.getUserWallets(userId);
    return wallets[0] ?? null;
  },
  getUserWallets: async (userId: string) => {
    const wallets = toWallets(await get<unknown>("/wallets"));
    return wallets.filter((wallet) => wallet.userId === userId);
  },
  createWallet: async (payload: Partial<ApiWallet>) =>
    toWallet(await post<unknown>("/wallets", fromWalletPayload(payload))),
  updateWallet: async (id: string, payload: Partial<ApiWallet>) =>
    toWallet(
      await patch<unknown>(
        `/wallets/${encodeURIComponent(id)}`,
        fromWalletPayload(payload),
      ),
    ),
};
