import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeftRight, Clock3, Loader2, ShieldCheck, X } from "lucide-react";

import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import { SERVER_CONNECTION_ERROR } from "@/services/apiClient";
import { transfersService } from "@/services/transfers.service";
import type { ApiTransfer } from "@/services/types";

const POLL_INTERVAL_MS = 2000;
const NO_MATCH_AFTER_SECONDS = 6;
const TERMINAL_STATUSES = new Set([
  "CANCELLED",
  "FAILED",
  "REFUNDED",
  "COMPLETED",
]);

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function MatchingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<ApiTransfer | null>(null);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [placingPending, setPlacingPending] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!id || noMatchFound) return;
    cancelledRef.current = false;
    let timeoutId: number | undefined;

    const tick = async () => {
      if (cancelledRef.current) return;
      try {
        const updated = await transfersService.requestTransferMatch(id);
        if (cancelledRef.current) return;
        setTransfer(updated);

        if (["MATCH_FOUND", "MATCHED"].includes(updated.status)) {
          navigate(`/transfer/status/${updated.id}`, {
            replace: true,
            state: { message: "We found you a match!" },
          });
          return;
        }

        if (TERMINAL_STATUSES.has(updated.status)) {
          navigate("/transfers", { replace: true });
          return;
        }

        if (elapsed >= NO_MATCH_AFTER_SECONDS) {
          setNoMatchFound(true);
          return;
        }

        timeoutId = window.setTimeout(tick, POLL_INTERVAL_MS);
      } catch {
        if (cancelledRef.current) return;
        setError(SERVER_CONNECTION_ERROR);
        setNoMatchFound(true);
      }
    };

    void tick();

    return () => {
      cancelledRef.current = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [elapsed, id, navigate, noMatchFound]);

  useEffect(() => {
    if (noMatchFound) return;
    const intervalId = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [noMatchFound]);

  const cancel = async () => {
    if (!id || cancelling) return;
    setCancelling(true);
    cancelledRef.current = true;
    try {
      await transfersService.cancelTransfer(id);
    } catch {
      // Keep cancel best-effort so users can leave the blocked flow.
    } finally {
      navigate("/transfers", { replace: true });
    }
  };

  const placeAsPending = async () => {
    if (!id || placingPending) return;
    setPlacingPending(true);
    cancelledRef.current = true;
    try {
      await transfersService.placeTransferAsPending(id);
      navigate("/transfer/pending", {
        replace: true,
        state: {
          message:
            "Your transfer request is now pending. We will notify you when a matching opposite transfer is available.",
        },
      });
    } catch {
      setError(SERVER_CONNECTION_ERROR);
      setPlacingPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-8 lg:px-10 max-w-3xl mx-auto w-full flex-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl shadow-elevated p-8 sm:p-12 text-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative h-20 w-20">
                {!noMatchFound && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-500"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowLeftRight className="text-teal-600" size={28} />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-900">
                  {noMatchFound
                    ? "No Match Found"
                    : "Searching for a counterparty..."}
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  {noMatchFound
                    ? "There is no compatible opposite transfer right now. You can keep this request active or cancel it."
                    : "We're pairing you with another FlowX user who wants to send money in the opposite direction. This usually takes a few seconds."}
                </p>
              </div>

              {transfer && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mt-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Corridor
                    </p>
                    <p className="text-sm font-bold text-navy-900 mt-1">
                      {transfer.sourceCountry} to {transfer.destinationCountry}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Amount
                    </p>
                    <p className="text-sm font-bold text-navy-900 mt-1">
                      {transfer.amount.toFixed(2)} {transfer.currency}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Elapsed
                    </p>
                    <p className="text-sm font-bold text-navy-900 mt-1 tabular-nums">
                      {formatElapsed(elapsed)}
                    </p>
                  </div>
                </div>
              )}

              {!noMatchFound && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  Polling every {POLL_INTERVAL_MS / 1000}s
                </div>
              )}

              <div className="rounded-2xl bg-teal-50/60 border border-teal-100 p-4 max-w-md text-left flex gap-3">
                <ShieldCheck
                  size={20}
                  className="text-teal-600 shrink-0 mt-0.5"
                />
                <p className="text-xs text-teal-800 leading-relaxed">
                  Your funds are not committed yet. You can cancel before escrow
                  is funded.
                </p>
              </div>

              {error && (
                <p className="text-sm font-bold text-rose-600">{error}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {noMatchFound && (
                  <button
                    type="button"
                    onClick={placeAsPending}
                    disabled={placingPending}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 font-bold text-sm transition-all disabled:opacity-60"
                  >
                    <Clock3 size={16} />
                    {placingPending ? "Saving..." : "Place as Pending Request"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={cancel}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white font-bold text-sm cursor-pointer transition-all duration-300 ease-in-out disabled:opacity-60"
                >
                  <X size={16} />
                  {cancelling ? "Cancelling..." : "Cancel Request"}
                </button>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
