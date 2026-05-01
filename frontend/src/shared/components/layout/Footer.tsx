import React from "react";
import { Shield, Globe, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield size={14} className="text-teal-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Escrow Protected
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe size={14} className="text-teal-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Global Network
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Lock size={14} className="text-teal-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                256-bit AES
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="flex gap-6">
              <a
                href="#"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 transition-colors"
              >
                Compliance
              </a>
            </nav>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              © 2026 FlowX Institutional
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
