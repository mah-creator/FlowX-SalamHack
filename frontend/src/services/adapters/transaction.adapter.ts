import type { ApiTransaction } from "../types";
import {
  dropUndefined,
  isRecord,
  readBoolean,
  readNumber,
  readString,
  type UnknownRecord,
} from "./adapterUtils";

export function toTransaction(raw: unknown): ApiTransaction {
  const source = isRecord(raw) ? raw : {};
  return {
    id: readString(source, ["id"]),
    source: readString(source, ["source", "sourceCountry", "source_country"]),
    destination: readString(source, [
      "destination",
      "destinationCountry",
      "destination_country",
    ]),
    amount: readNumber(source, ["amount"]),
    currency: readString(
      source,
      ["currency"],
      "USD",
    ) as ApiTransaction["currency"],
    status: readString(
      source,
      ["status"],
      "Pending Request",
    ) as ApiTransaction["status"],
    feePercent: readNumber(source, ["feePercent", "fee_percent"], 2),
    exchangeRate: readNumber(source, ["exchangeRate", "exchange_rate"], 1),
    receivableAmount: readNumber(source, [
      "receivableAmount",
      "receivable_amount",
      "netAmount",
      "net_amount",
    ]),
    createdAt: readString(source, ["createdAt", "created_at"]),
    depositA: readBoolean(source, ["depositA", "deposit_a"]),
    depositB: readBoolean(source, ["depositB", "deposit_b"]),
    disputeReason:
      readString(source, ["disputeReason", "dispute_reason"]) || null,
    auditLog: Array.isArray(source.auditLog)
      ? (source.auditLog as ApiTransaction["auditLog"])
      : [],
  };
}

export function toTransactions(raw: unknown): ApiTransaction[] {
  const rows =
    isRecord(raw) && Array.isArray(raw.transactions)
      ? raw.transactions
      : Array.isArray(raw)
        ? raw
        : [];
  return rows.map(toTransaction);
}

export function fromTransactionPayload(payload: {
  amount?: number;
  currency?: string;
}): UnknownRecord {
  return dropUndefined({
    amount: payload.amount,
    currency: payload.currency,
  });
}
