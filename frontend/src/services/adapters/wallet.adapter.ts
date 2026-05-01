import type { ApiWallet } from "../types";
import {
  dropUndefined,
  isRecord,
  readNumber,
  readString,
} from "./adapterUtils";

export function toWallet(raw: unknown): ApiWallet {
  const source = isRecord(raw) ? raw : {};
  return {
    id: readString(source, ["id"]),
    userId: readString(source, ["userId", "user_id"]),
    balance: readNumber(source, ["balance"]),
    currency: readString(source, ["currency"], "USD") as ApiWallet["currency"],
    escrowBalance: readNumber(source, ["escrowBalance", "escrow_balance"]),
    availableBalance: readNumber(source, [
      "availableBalance",
      "available_balance",
    ]),
  };
}

export function toWallets(raw: unknown): ApiWallet[] {
  return Array.isArray(raw) ? raw.map(toWallet) : [];
}

export function fromWalletPayload(payload: Partial<ApiWallet>) {
  return dropUndefined({
    id: payload.id,
    userId: payload.userId,
    balance: payload.balance,
    currency: payload.currency,
    escrowBalance: payload.escrowBalance,
    availableBalance: payload.availableBalance,
  });
}
