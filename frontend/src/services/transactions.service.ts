import { get, post } from "./apiClient";
import {
  fromTransactionPayload,
  toTransaction,
  toTransactions,
} from "./adapters/transaction.adapter";
import type { ApiTransaction } from "./types";

export const transactionsService = {
  getTransactions: async () =>
    toTransactions(await get<unknown>("/transactions")),
  createTransaction: async (payload: { amount: number; currency: string }) =>
    toTransaction(
      await post<unknown>("/transactions", fromTransactionPayload(payload)),
    ),
  getTransactionById: async (id: string) =>
    toTransaction(
      await get<unknown>(`/transactions/${encodeURIComponent(id)}`),
    ),
  autoMatchTransaction: async (id: string) =>
    toTransaction(
      await post<unknown>(`/transactions/${encodeURIComponent(id)}/auto-match`),
    ),
  cancelTransaction: async (id: string) =>
    toTransaction(
      await post<unknown>(`/transactions/${encodeURIComponent(id)}/cancel`),
    ),
  confirmMatch: async (id: string) =>
    toTransaction(
      await post<unknown>(
        `/transactions/${encodeURIComponent(id)}/confirm-match`,
      ),
    ),
  depositTransaction: async (
    id: string,
    payload: { party: "A" | "B" },
  ): Promise<ApiTransaction> =>
    toTransaction(
      await post<unknown>(
        `/transactions/${encodeURIComponent(id)}/deposits`,
        payload,
      ),
    ),
  openDispute: async (id: string, payload: { reason: string }) =>
    toTransaction(
      await post<unknown>(
        `/transactions/${encodeURIComponent(id)}/disputes`,
        payload,
      ),
    ),
  processPayouts: async (id: string) =>
    toTransaction(
      await post<unknown>(
        `/transactions/${encodeURIComponent(id)}/process-payouts`,
      ),
    ),
};
