import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  PlayCircle,
  CheckCircle2,
  BadgeCheck,
  Search,
  ArrowLeftRight,
  TrendingDown,
  Clock,
  ShieldAlert,
  Globe,
  Quote,
} from "lucide-react";
import { cn } from "@/shared/utils";

export default function LandingPage() {
  const partners = [
    "GLOBAL PAY",
    "CORRIDOR X",
    "LEVANT TRUST",
    "MED TRADE",
    "NORDIC FLOW",
    "SAHARA BRIDGE",
    "ATLAS FUND",
  ];

  const testimonials = [
    {
      name: "Tariq Jarrar",
      org: "Al-Zahra Logistics",
      text: "FlowX transformed how we procure inventory. What used to take a week now happens before lunch.",
      avatar: "https://picsum.photos/seed/p1/100/100",
    },
    {
      name: "Sarah Levinson",
      org: "East Horizon Banking",
      text: "The security protocol is bank-grade, but the user experience is from the future. Unmatched in the Levantine region.",
      avatar: "https://picsum.photos/seed/p2/100/100",
    },
    {
      name: "Omar Bakri",
      org: "Gulf Import Co.",
      text: "A vital bridge for our humanitarian and trade corridors. FlowX is the infrastructure we were waiting for.",
      avatar: "https://picsum.photos/seed/p3/100/100",
    },
    {
      name: "Lina Kassem",
      org: "Kassem Trading",
      text: "Reliability is everything in our business. FlowX gives us the certainty we need.",
      avatar: "https://picsum.photos/seed/p4/100/100",
    },
    {
      name: "Kareem Abu",
      org: "Dunes Global",
      text: "Finally, a solution that understands the unique needs of our local markets.",
      avatar: "https://picsum.photos/seed/p5/100/100",
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-max max-w-6xl h-16 px-4 lg:px-8 flex items-center justify-between gap-12 z-50 bg-white/70 backdrop-blur-md rounded-full border border-slate-200/50 shadow-elevated transition-all duration-300">
        <div className="text-xl font-bold tracking-tighter text-navy-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-[10px]">
            FX
          </div>
          FlowX
        </div>
        <div className="flex items-center gap-6 lg:gap-10">
          <Link
            to="/login"
            className="text-sm font-bold text-slate-500 hover:text-navy-900 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 bg-navy-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-ambient whitespace-nowrap"
          >
            Open Account
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-40 pb-0 lg:pt-64">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl lg:text-7xl font-bold text-navy-900 leading-[1.05] tracking-tight mb-8"
          >
            A safer way to receive money across borders
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium"
          >
            FlowX matches local payment requests so you can send and receive
            money faster, cheaper, and more securely.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="px-10 py-5 bg-navy-900 text-white rounded-xl text-lg font-bold hover:bg-navy-800 transition-all shadow-elevated flex items-center gap-2"
            >
              Start Transfer
              <ArrowRight size={20} />
            </Link>
            <button className="px-10 py-5 bg-white border border-slate-200 text-navy-900 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all shadow-ambient flex items-center gap-2">
              <PlayCircle size={20} />
              See How It Works
            </button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 flex items-center gap-8"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck className="text-teal-500 h-5 w-5" />
              Bank-grade Security
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Zap className="text-teal-500 h-5 w-5" />
              Instant Matching
            </div>
          </motion.div>
        </div>

        {/* 0. Trust Section (Marquee) */}
        <section className="mt-40 lg:mt-56 overflow-hidden">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-12">
            Powering Institutional Hubs
          </p>
          <div className="relative flex overflow-x-hidden">
            <div className="flex animate-marquee whitespace-nowrap py-4">
              {[...partners, ...partners].map((brand, i) => (
                <span
                  key={i}
                  className="text-3xl font-black tracking-tighter text-navy-900 border-navy-100 px-12 italic opacity-30 hover:opacity-100 transition-opacity"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* --- Existing Sections --- */}

        {/* 1. Problem & Solution */}
        <section className="mt-40 lg:mt-64 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600 mb-6">
              The Challenge
            </h2>
            <h3 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-8 tracking-tight">
              The world is moving faster than the money that powers it.
            </h3>
            <p className="text-xl text-slate-500 leading-relaxed">
              Traditional cross-border transfers take days, cost up to 10% in
              fees, and are locked behind complex institutional barriers. For
              merchants in emerging markets, every delay is a lost opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              {
                title: "High Fees",
                desc: "Average global transfer fees hide in middleman margins.",
                icon: TrendingDown,
              },
              {
                title: "Slow Settlement",
                desc: "Money takes 3-5 days to cross a border through legacy systems.",
                icon: Clock,
              },
              {
                title: "Lack of Trust",
                desc: "Opaque clearing processes leave both sides vulnerable.",
                icon: ShieldAlert,
              },
            ].map((item, i) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={item.title}
                className="p-8 bg-surface-low rounded-2xl border border-slate-100 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
                  <item.icon size={24} className="text-teal-600" />
                </div>
                <h4 className="text-lg font-bold text-navy-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-navy-900 rounded-[2rem] text-white relative overflow-hidden text-left">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-500 rounded-full text-xs font-bold mb-6 ring-1 ring-teal-500/20">
                  <BadgeCheck size={14} /> The Solution
                </div>
                <h4 className="text-3xl font-bold mb-6">
                  FlowX localizes global flows.
                </h4>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                  By matching local liquidity in one region with matching needs
                  in another, we bypass the international wire system entirely.
                  Money stays local, matching happens instantly, and transfers
                  settle in minutes.
                </p>
                <ul className="space-y-4">
                  {[
                    "0.5% Flat Institutional Fee",
                    "Instant P2P Ledger Settlement",
                    "No Middleman Banking Delays",
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-center gap-3 text-sm font-bold"
                    >
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-teal-500" />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 p-4 relative overflow-hidden group">
                  {/* Live Match Visualization Mockup */}
                  <div className="absolute inset-0 flex flex-col p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-teal-500/40" />
                        <div className="w-2 h-2 rounded-full bg-teal-500/20" />
                      </div>
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">
                        Live Engine
                      </span>
                    </div>

                    <div className="flex-1 border border-white/5 bg-white/[0.02] rounded-2xl relative overflow-hidden p-4">
                      <div
                        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50 animate-scan"
                        style={{ animation: "scan 3s linear infinite" }}
                      />

                      <div className="grid grid-cols-2 gap-4 h-full">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="bg-white/5 rounded-xl p-3 flex flex-col justify-between border border-white/5"
                          >
                            <div className="h-1.5 w-1/2 bg-white/20 rounded" />
                            <div className="h-1.5 w-3/4 bg-white/10 rounded" />
                            <div className="flex items-center justify-between mt-2">
                              <div className="h-3 w-8 bg-teal-500/40 rounded" />
                              <div className="w-4 h-4 rounded-full bg-teal-500/40 flex items-center justify-center">
                                <CheckCircle2 size={8} className="text-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-400">
                        Institutional Match Rate
                      </span>
                      <span className="text-sm font-black text-teal-400">
                        92%
                      </span>
                    </div>
                  </div>

                  <img
                    src="https://picsum.photos/seed/solution/1000/1000"
                    alt="System Architecture Overlay"
                    className="w-full h-full object-cover rounded-xl opacity-20 mix-blend-overlay"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Process Section */}
        <section className="mt-40 lg:mt-64 relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
              Three steps to global liquidity.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Request",
                desc: "Specify your destination corridor and the amount you want to receive locally.",
                icon: Search,
              },
              {
                step: "02",
                title: "Wait for Match",
                desc: "Our engine instantly pairs your request with a matching verified merchant.",
                icon: ArrowLeftRight,
              },
              {
                step: "03",
                title: "Instant Release",
                desc: "Funds are released from secure escrow the moment the local payment is confirmed.",
                icon: Zap,
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="text-[120px] font-black text-slate-50 absolute -top-20 -left-4 -z-10 leading-none">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-8">
                  <item.icon size={32} className="text-teal-600" />
                </div>
                <h4 className="text-xl font-bold text-navy-900 mb-4">
                  {item.title}
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Product Preview Section */}
        <section className="mt-40 lg:mt-64 bg-surface-low rounded-[3rem] p-8 lg:p-20 border border-slate-200 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-[2rem] p-6 shadow-elevated border border-slate-100 relative overflow-hidden group min-h-[460px]">
                {/* Decorative Dashboard Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-[10px] font-bold">
                      FX
                    </div>
                    <div>
                      <div className="h-2 w-20 bg-slate-200 rounded mb-1" />
                      <div className="h-1.5 w-12 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded bg-slate-50" />
                    <div className="w-6 h-6 rounded bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mock Analytics Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                      <p className="text-[10px] font-bold text-teal-600 uppercase mb-1">
                        Volume
                      </p>
                      <div className="h-4 w-16 bg-teal-200/50 rounded animate-pulse" />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Safety
                      </p>
                      <div className="h-4 w-12 bg-slate-200 rounded" />
                    </div>
                  </div>

                  {/* Transaction List Mockup */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100" />
                          <div className="space-y-1">
                            <div className="h-2 w-24 bg-slate-200 rounded" />
                            <div className="h-1.5 w-16 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="h-2 w-10 bg-teal-100 rounded" />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-auto">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">
                        Network
                      </p>
                      <p className="font-bold text-teal-600 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />{" "}
                        Node: Levant-01
                      </p>
                    </div>
                    <button className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold shadow-ambient ring-4 ring-navy-900/5 transition-transform hover:scale-105 active:scale-95">
                      Expand Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600 mb-6">
                Interactive Portal
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-8 tracking-tight">
                Full control over every corridor.
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed mb-10">
                The FlowX dashboard provides real-time visibility into your
                local and global liquidity. Track every match, manage your
                verification status, and settle transfers with a single tap.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Uptime", val: "99.99%" },
                  { label: "Matches", val: "2M+" },
                  { label: "Settlement", val: "Instant" },
                  { label: "Security", val: "L4 Auth" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-navy-900">
                      {stat.val}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Feedback Section (Testimonial Marquee) */}
        <section className="mt-40 lg:mt-64">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 tracking-tight">
              Trusted by institutional merchants.
            </h2>
          </div>

          <div className="relative flex overflow-x-hidden">
            <div className="flex animate-marquee whitespace-nowrap py-12 gap-8">
              {[...testimonials, ...testimonials].map((quote, i) => (
                <div
                  key={i}
                  className="min-w-[400px] p-10 bg-white rounded-3xl border border-slate-100 shadow-ambient flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1 mb-6 text-teal-500">
                    <Quote size={20} className="fill-teal-500/10" />
                  </div>
                  <p className="text-lg text-navy-900 italic mb-8 leading-relaxed whitespace-normal">
                    "{quote.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={quote.avatar}
                      className="w-12 h-12 rounded-full border border-slate-200"
                      alt={quote.name}
                    />
                    <div>
                      <p className="text-sm font-bold text-navy-900">
                        {quote.name}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {quote.org}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. About Section */}
        <section className="mt-40 lg:mt-64 border-t border-slate-100 pt-40">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600 mb-6">
                Our Vision
              </h2>
              <h3 className="text-4xl font-bold text-navy-900 mb-8 tracking-tight">
                Building the future of friction-less trade.
              </h3>
              <p className="text-xl text-slate-500 leading-relaxed mb-8">
                FlowX was founded in 2024 to solve a simple yet profound
                problem: borders shouldn't be barriers to prosperity. We believe
                that liquidity is a fundamental right for every merchant.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed">
                Our team consists of veterans from central banking,
                cybersecurity, and cross-border logistics. We aren't just
                building an app; we're establishing a new protocol for global
                trust.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden mt-12">
                <img
                  src="https://picsum.photos/seed/vision1/600/800"
                  className="w-full h-full object-cover"
                  alt="team"
                />
              </div>
              <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden">
                <img
                  src="https://picsum.photos/seed/vision2/600/800"
                  className="w-full h-full object-cover"
                  alt="office"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-56 mb-0 bg-navy-900 rounded-[3rem] p-12 lg:p-32 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              Ready to modernize your transfers?
            </h2>
            <p className="text-xl text-slate-400 mb-12">
              Join FlowX today and experience the future of global liquidity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-12 py-5 bg-teal-500 text-navy-900 rounded-xl font-bold text-lg hover:bg-teal-400 transition-all shadow-glow w-full sm:w-auto"
              >
                Get Started Now
              </Link>
              <button className="px-12 py-5 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/10 w-full sm:w-auto">
                Talk to Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 pt-12 pb-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-2xl font-bold text-navy-900 mb-6 tracking-tighter">
              FlowX
            </h4>
            <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
              Revolutionizing cross-border transfers through institutional
              matching and localized settlement.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-6">
              Product
            </h5>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Corridors
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Matching Engine
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Institutional Suite
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-6">
              Company
            </h5>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li>
                <Link to="#" className="hover:text-teal-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Newsroom
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-6">
              Legal
            </h5>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Security
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-teal-600">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-50 flex flex-col md:flex-row justify-between gap-6 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          <p>© 2024 FlowX Technologies. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="#" className="hover:text-navy-900 transition-colors">
              Twitter
            </Link>
            <Link to="#" className="hover:text-navy-900 transition-colors">
              LinkedIn
            </Link>
            <Link to="#" className="hover:text-navy-900 transition-colors">
              Telegram
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
