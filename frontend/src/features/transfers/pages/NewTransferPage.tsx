import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  CreditCard,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/shared/utils";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { adminService } from "@/services/admin.service";
import { SERVER_CONNECTION_ERROR } from "@/services/apiClient";
import { transfersService } from "@/services/transfers.service";
import { verificationService } from "@/services/verification.service";
import type { ApiConfig } from "@/services/types";

const fallbackConfig: ApiConfig = {
  id: "main",
  feePercent: 2,
  exchangeRate: 1,
  supportedCountries: [
    "Gaza",
    "Egypt",
    "Jordan",
    "Saudi Arabia",
    "United Arab Emirates",
  ],
  supportedCurrencies: ["USD", "EGP", "ILS"],
  supportedCorridors: [
    { source: "Gaza", destination: "Egypt" },
    { source: "Egypt", destination: "Gaza" },
  ],
  paymentWindowMinutes: 30,
};

export default function NewTransferPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("750");
  const [currency, setCurrency] = useState<"USD" | "EGP" | "ILS">("USD");
  const [sourceCountry, setSourceCountry] = useState("Gaza");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPaymentMethod, setReceiverPaymentMethod] =
    useState("Bank Transfer");
  const [paymentMethod, setPaymentMethod] = useState("FlowX Wallet");
  const [notes, setNotes] = useState("");
  const [config, setConfig] = useState<ApiConfig>(fallbackConfig);
  const [isVerified, setIsVerified] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void adminService
      .getConfig()
      .then((nextConfig) => {
        const merged = { ...fallbackConfig, ...nextConfig };
        setConfig(merged);
        setCurrency(merged.supportedCurrencies[0] ?? "USD");
        setSourceCountry(
          user?.country && merged.supportedCountries.includes(user.country)
            ? user.country
            : (merged.supportedCountries[0] ?? "Gaza"),
        );
      })
      .catch(() => setConfig(fallbackConfig));
  }, [user?.country]);

  useEffect(() => {
    if (!user?.id) return;
    void verificationService
      .getUserVerifications(user.id)
      .then((records) => {
        setIsVerified(records.some((record) => record.status === "VERIFIED"));
      })
      .catch(() => setIsVerified(false));
  }, [user?.id]);

  const destinationOptions = useMemo(() => {
    const corridorDestinations = config.supportedCorridors
      ?.filter((corridor) => corridor.source === sourceCountry)
      .map((corridor) => corridor.destination);
    const options = corridorDestinations?.length
      ? corridorDestinations
      : config.supportedCountries.filter(
          (country) => country !== sourceCountry,
        );
    return Array.from(new Set(options));
  }, [config.supportedCorridors, config.supportedCountries, sourceCountry]);

  useEffect(() => {
    if (!destinationOptions.includes(destinationCountry)) {
      setDestinationCountry(destinationOptions[0] ?? "");
    }
  }, [destinationCountry, destinationOptions]);

  const amountNum = Number(amount || "0");
  const fee = useMemo(
    () => amountNum * (config.feePercent / 100),
    [amountNum, config.feePercent],
  );
  const netAmount = useMemo(() => amountNum - fee, [amountNum, fee]);

  const validationError = useMemo(() => {
    if (amountNum <= 0) return "Amount must be positive.";
    if (!config.supportedCurrencies.includes(currency))
      return "Currency is not supported.";
    if (!sourceCountry || !destinationCountry)
      return "Source and destination countries are required.";
    if (sourceCountry === destinationCountry)
      return "Source and destination countries must be different.";
    if (!receiverName.trim()) return "Receiver name is required.";
    if (!paymentMethod.trim()) return "Payment method is required.";
    if (!receiverPaymentMethod.trim())
      return "Receiver payment method is required.";
    return "";
  }, [
    amountNum,
    config.supportedCurrencies,
    currency,
    destinationCountry,
    paymentMethod,
    receiverName,
    receiverPaymentMethod,
    sourceCountry,
  ]);

  const confirmRequest = async () => {
    setError(validationError);
    if (validationError || !user?.id) return;
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const saved = await transfersService.createTransfer({
        id: `tr-${Date.now()}`,
        userId: user.id,
        sourceCountry,
        destinationCountry,
        amount: amountNum,
        currency,
        fee,
        exchangeRate: config.exchangeRate,
        netAmount,
        status: "PENDING_REQUEST",
        paymentMethod,
        receiverName,
        receiverPaymentMethod,
        referenceNumber: `FX-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        riskLevel: "low",
        paymentConfirmationRequested: false,
      });
      navigate(`/transfer/match/${saved.id}`, {
        state: { message: "Transfer request submitted." },
      });
    } catch {
      setError(SERVER_CONNECTION_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-10 flex items-center justify-center min-h-[calc(100vh-64px)] w-full flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-white rounded-[2.5rem] border border-slate-100 shadow-elevated p-6 sm:p-10 mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-900 leading-tight tracking-tight">
                  Create Request
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Step {step} of 3:{" "}
                  {step === 1 ? "Corridor" : step === 2 ? "Details" : "Review"}
                </p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-all duration-500",
                      s === step
                        ? "bg-teal-500 w-12"
                        : s < step
                          ? "bg-teal-600/20"
                          : "bg-slate-100",
                    )}
                  />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-8 py-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    From / To
                  </label>
                  <p className="text-sm text-slate-500 mt-2 mb-4">
                    Choose where the money starts and where the receiver will
                    get paid.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        From
                      </label>
                      <select
                        value={sourceCountry}
                        onChange={(event) =>
                          setSourceCountry(event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-navy-900"
                      >
                        {config.supportedCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        To
                      </label>
                      <select
                        value={destinationCountry}
                        onChange={(event) =>
                          setDestinationCountry(event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-navy-900"
                      >
                        {destinationOptions.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {!isVerified && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                    <AlertCircle
                      className="text-amber-500 shrink-0"
                      size={20}
                    />
                    <p className="text-xs font-medium text-amber-700 leading-relaxed">
                      Your account is not fully verified. Transfer limits may
                      apply until KYC is approved.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm font-bold text-rose-600">{error}</p>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setError(validationError);
                      if (
                        !validationError ||
                        validationError === "Receiver name is required." ||
                        validationError === "Payment method is required." ||
                        validationError ===
                          "Receiver payment method is required."
                      )
                        setStep(2);
                    }}
                    className="flex items-center justify-center gap-2 px-10 py-4 bg-navy-900 text-white rounded-xl font-bold text-lg hover:bg-navy-800 transition-all shadow-elevated"
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Amount
                  </label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                      <span className="text-2xl font-bold text-navy-900">
                        $
                      </span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-surface-low border-2 border-slate-100 rounded-2xl py-6 pl-14 pr-32 text-4xl font-bold text-navy-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 outline-none transition-all placeholder:text-slate-200"
                    />
                    <select
                      value={currency}
                      onChange={(e) =>
                        setCurrency(e.target.value as "USD" | "EGP" | "ILS")
                      }
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm text-sm font-bold text-navy-900"
                    >
                      {config.supportedCurrencies.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-xs font-medium text-teal-600 flex items-center gap-1">
                      <ShieldCheck size={14} /> API fee preview
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      Rate: 1.00 USD = {config.exchangeRate.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Receiver Name
                    </label>
                    <input
                      value={receiverName}
                      onChange={(event) => setReceiverName(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 p-4 text-sm font-bold"
                      placeholder="Receiver full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Receiver Payment Method
                    </label>
                    <select
                      value={receiverPaymentMethod}
                      onChange={(event) =>
                        setReceiverPaymentMethod(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold"
                    >
                      <option>Bank Transfer</option>
                      <option>Mobile Wallet</option>
                      <option>Local Gateway</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        id: "FlowX Wallet",
                        label: "FlowX Wallet",
                        icon: Wallet,
                      },
                      {
                        id: "Bank Transfer",
                        label: "Bank Transfer",
                        icon: Building,
                      },
                      { id: "Card", label: "Card", icon: CreditCard },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "p-4 border rounded-xl flex flex-col items-center gap-2 transition-all",
                          method.id === paymentMethod
                            ? "border-teal-500 bg-teal-50 ring-4 ring-teal-500/10 text-teal-600"
                            : "border-slate-200 hover:bg-slate-50 text-slate-500",
                        )}
                      >
                        <method.icon size={24} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {method.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="mt-2 w-full min-h-24 rounded-xl border border-slate-200 p-4 text-sm"
                    placeholder="Optional notes for the operations team"
                  />
                </div>

                {error && (
                  <p className="text-sm font-bold text-rose-600">{error}</p>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-navy-900 transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setError(validationError);
                      if (!validationError) setStep(3);
                    }}
                    className="flex items-center justify-center gap-2 px-10 py-4 bg-navy-900 text-white rounded-xl font-bold text-lg hover:bg-navy-800 transition-all shadow-elevated"
                  >
                    Review Request
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Source Country:</span>
                    <span className="font-bold">{sourceCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination Country:</span>
                    <span className="font-bold">{destinationCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold">
                      {amountNum.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee ({config.feePercent}%):</span>
                    <span className="font-bold">
                      -{fee.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Amount:</span>
                    <span className="font-bold">
                      {netAmount.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span className="font-bold">
                      1 USD = {config.exchangeRate.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Window:</span>
                    <span className="font-bold">
                      {config.paymentWindowMinutes} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receiver:</span>
                    <span className="font-bold">{receiverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receiver Method:</span>
                    <span className="font-bold">{receiverPaymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold">{paymentMethod}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between gap-4">
                      <span>Notes:</span>
                      <span className="font-bold text-right">{notes}</span>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="text-sm font-bold text-rose-600">{error}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-navy-900 transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button
                    disabled={submitting}
                    onClick={confirmRequest}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all shadow-elevated disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Transfer"}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
