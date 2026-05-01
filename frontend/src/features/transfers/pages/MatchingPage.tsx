import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeftRight, Loader2, ShieldCheck, X } from "lucide-react";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import { transfersService } from "@/services/transfers.service";
import type { ApiTransfer } from "@/services/types";

const POLL_INTERVAL_MS = 2000;
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
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    cancelledRef.current = false;
    let timeoutId: number | undefined;

    const tick = async () => {
      if (cancelledRef.current) return;
      try {
        const updated = await transfersService.requestTransferMatch(id);
        if (cancelledRef.current) return;
        setTransfer(updated);

        if (updated.status === "MATCH_FOUND") {
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

        timeoutId = window.setTimeout(tick, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelledRef.current) return;
        setError(
          err instanceof Error ? err.message : "Unable to search for a match.",
        );
        timeoutId = window.setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    void tick();

    return () => {
      cancelledRef.current = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [id, navigate]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const cancel = async () => {
    if (!id || cancelling) return;
    setCancelling(true);
    cancelledRef.current = true;
    try {
      await transfersService.cancelTransfer(id);
    } catch {
      // best-effort cancel
    } finally {
      navigate("/transfers", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-8 lg:px-10 max-w-3xl mx-auto w-full flex-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl shadow-elevated p-8 sm:p-12 text-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative h-20 w-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowLeftRight className="text-teal-600" size={28} />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-900">
                  Searching for a counterparty…
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  We're pairing you with another FlowX user who wants to send
                  money in the opposite direction. This usually takes a few
                  seconds.
                </p>
              </div>

              {transfer && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mt-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Corridor
                    </p>
                    <p className="text-sm font-bold text-navy-900 mt-1">
                      {transfer.sourceCountry} → {transfer.destinationCountry}
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

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Polling every {POLL_INTERVAL_MS / 1000}s
              </div>

              <div className="rounded-2xl bg-teal-50/60 border border-teal-100 p-4 max-w-md text-left flex gap-3">
                <ShieldCheck
                  size={20}
                  className="text-teal-600 shrink-0 mt-0.5"
                />
                <p className="text-xs text-teal-800 leading-relaxed">
                  Your funds are not committed yet. You can cancel at any time
                  and the request will be closed.
                </p>
              </div>

              {error && (
                <p className="text-sm font-bold text-rose-600">{error}</p>
              )}

              <button
                type="button"
                onClick={cancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white font-bold text-sm cursor-pointer transition-all duration-300 ease-in-out disabled:opacity-60"
              >
                <X size={16} />
                {cancelling ? "Cancelling…" : "Cancel request"}
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
