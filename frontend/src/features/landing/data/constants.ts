/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavLink {
  name: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { name: "Problem", href: "#problem" },
  { name: "Solution", href: "#solution" },
  { name: "Features", href: "#features" },
  { name: "Case Study", href: "#case-study" },
  { name: "Security", href: "#security" },
  { name: "Pricing", href: "#pricing" },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroCard {
  title: string;
  desc: string;
  img: string;
}

export const heroCards: HeroCard[] = [
  {
    title: "Secure Match Engine",
    desc: "Every transaction is backed by our proprietary local matching algorithm and multi-layer secure escrow protection.",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop",
  },
  {
    title: "Instant Liquidity",
    desc: "Our platform liquidity reserves ensure that urgent transfers are completed even when an immediate peer match isn't available.",
    img: "https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Zero-Border Protocol",
    desc: "Money never actually crosses a physical border. Credits are swapped locally, making the process 10x faster than SWIFT.",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop",
  },
];

// ─── Marquee ──────────────────────────────────────────────────────────────────

export const logos: string[] = [
  "STRIPE",
  "REVOLUT",
  "WISE",
  "COINBASE",
  "PLAIDS",
  "N26",
  "KLARNA",
  "ADVYEN",
  "CHIME",
  "MONZO",
  "NU BANK",
  "BLOCK",
];

// ─── Problem Section ──────────────────────────────────────────────────────────

export interface ProblemItem {
  title: string;
  desc: string;
  icon: "blocked" | "fees" | "slow" | "trust";
  variant: "wide" | "standard";
}

export const problemItems: ProblemItem[] = [
  {
    title: "Blocked or restricted",
    desc: "Transfers are often limited by arbitrary bank policies.",
    icon: "blocked",
    variant: "wide",
  },
  {
    title: "High fees",
    desc: "Traditional services take a massive cut of your hard-earned money.",
    icon: "fees",
    variant: "standard",
  },
  {
    title: "Slow processing",
    desc: "Waiting days for money to arrive in urgent situations.",
    icon: "slow",
    variant: "standard",
  },
  {
    title: "Lack of trust",
    desc: "No visibility into where your money is during transition.",
    icon: "trust",
    variant: "wide",
  },
];

// ─── Solution Steps ───────────────────────────────────────────────────────────

export interface SolutionStep {
  step: string;
  title: string;
  desc: string;
  longDesc: string;
  visual: "request" | "matching" | "payments" | "completion";
}

export const solutionSteps: SolutionStep[] = [
  {
    step: "01",
    title: "Create Request",
    desc: "Enter amount, destination, and receiver details securely.",
    longDesc:
      "Start by specifying how much you want to send, the destination country, and who should receive the funds. Our encrypted form captures only what's necessary with minimal friction. Your request enters the FlowX matching pool within milliseconds.",
    visual: "request",
  },
  {
    step: "02",
    title: "Smart Matching",
    desc: "FlowX finds a user with an exactly opposite transfer need.",
    longDesc:
      "Our AI-driven matching engine scans active requests to find someone sending money in the opposite direction. The algorithm optimizes for speed, amount compatibility, and trust score quality, typically finding a match in under 30 seconds.",
    visual: "matching",
  },
  {
    step: "03",
    title: "Local Payments",
    desc: "Both sides pay locally using their preferred local methods.",
    longDesc:
      "Once matched, both parties pay locally in their own currency using familiar options like bank transfer, mobile money, or digital wallets. No money crosses borders, reducing friction from correspondent bank chains and traditional transfer overhead.",
    visual: "payments",
  },
  {
    step: "04",
    title: "Secure Completion",
    desc: "Funds released after encrypted confirmation via escrow.",
    longDesc:
      "After both local payments are cryptographically verified, escrow releases funds to recipients in a coordinated completion flow. The full process from request to settlement is engineered to complete in minutes, not days.",
    visual: "completion",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────

export interface Feature {
  title: string;
  desc: string;
  longDesc: string;
  icon: "matching" | "escrow" | "tracking" | "currency" | "dispute" | "scores";
}

export const features: Feature[] = [
  {
    title: "Smart Matching System",
    desc: "AI-driven engine that pairs transactions in milliseconds.",
    longDesc:
      "Our proprietary matching algorithm analyzes thousands of pending requests across corridors, optimizing for amount compatibility, urgency level, and user trust scores. Average match time: 28 seconds.",
    icon: "matching",
  },
  {
    title: "Escrow-Based Security",
    desc: "Funds are locked in digital escrow until both parties confirm.",
    longDesc:
      "Every transaction is protected by our distributed digital escrow system. Funds are cryptographically locked and only released when both sender and receiver confirm completion through multi-factor verification.",
    icon: "escrow",
  },
  {
    title: "Real-Time Tracking",
    desc: "Know exactly where your transaction stands at any second.",
    longDesc:
      "From request creation to final settlement, you get live status updates and milestone confirmations. Clear tracking removes uncertainty and lets both parties coordinate with confidence across time zones.",
    icon: "tracking",
  },
  {
    title: "Multi-Currency",
    desc: "Seamless handling of USD, EGP, ILS, and more local currencies.",
    longDesc:
      "FlowX supports localized settlement in multiple currencies, with smart conversion-aware matching to reduce friction. Users keep familiar local payment rails while still achieving cross-border outcomes.",
    icon: "currency",
  },
  {
    title: "Dispute Resolution",
    desc: "Built-in mediation for any transaction discrepancies.",
    longDesc:
      "If a transfer issue appears, our structured dispute workflow captures evidence, freezes affected escrow states, and routes the case to guided mediation with full timeline transparency for both users.",
    icon: "dispute",
  },
  {
    title: "Verification Scores",
    desc: "Users are ranked based on their successful transaction history.",
    longDesc:
      "A dynamic trust score reflects successful completions, verification depth, and dispute outcomes. Higher-quality participants are prioritized in matching, improving speed and reliability for everyone.",
    icon: "scores",
  },
];

// ─── Case Study ───────────────────────────────────────────────────────────────

export interface CaseStudyPerson {
  name: string;
  location: string;
  locationCode: string;
  description: string;
  role: "sender" | "receiver";
}

export interface CaseStudyData {
  overline: string;
  headingMain: string;
  headingAccent: string;
  matchLine: string;
  resultTitle: string;
  resultSubtitle: string;
  persons: [CaseStudyPerson, CaseStudyPerson];
}

export const caseStudy: CaseStudyData = {
  overline: "Real Example",
  headingMain: "Gaza ↔ Egypt",
  headingAccent: "Without Borders",
  matchLine: "FlowX matches them instantly.",
  resultTitle: "Local Payout Triggered",
  resultSubtitle: "Zero International Movement",
  persons: [
    {
      name: "Mohammed",
      location: "Gaza Center",
      locationCode: "GA",
      description:
        "Needs to receive money from Egypt to pay for essential supplies.",
      role: "receiver",
    },
    {
      name: "Ahmad",
      location: "Cairo Center",
      locationCode: "CA",
      description: "Needs to send money to Gaza to support his family.",
      role: "sender",
    },
  ],
};

// ─── Security Pillars ─────────────────────────────────────────────────────────

export interface SecurityPillar {
  t: string;
  d: string;
  longDesc: string;
  icon: "identity" | "escrow" | "admin" | "fraud";
  position: "top" | "right" | "bottom" | "left";
}

export const securityPillars: SecurityPillar[] = [
  {
    t: "Identity Verification",
    d: "Strict KYC protocols to ensure every user is legitimate.",
    longDesc:
      "Multi-layer KYC with document verification, liveness detection, and cross-reference checks against global watchlists. Every user is verified before their first transaction.",
    icon: "identity",
    position: "top",
  },
  {
    t: "Escrow Protection",
    d: "Military-grade encryption for all locked transactions.",
    longDesc:
      "AES-256 encrypted digital escrow locks funds until both parties confirm. No single point of failure is distributed across redundant secure nodes.",
    icon: "escrow",
    position: "right",
  },
  {
    t: "Admin Review",
    d: "Manual oversight for high-risk or large volume transfers.",
    longDesc:
      "Automated risk scoring flags suspicious patterns. High-value or unusual transfers are escalated to trained review agents before processing.",
    icon: "admin",
    position: "left",
  },
  {
    t: "Fraud Detection",
    d: "Real-time monitoring of behavioral patterns and trust loops.",
    longDesc:
      "Continuous behavioral analysis monitors velocity, device fingerprints, and network patterns. Anomalies trigger instant holds and user notifications.",
    icon: "fraud",
    position: "bottom",
  },
];

// ─── Demo / Transaction Statuses ──────────────────────────────────────────────

export interface DemoStatus {
  s: string;
  d: string;
  active: boolean;
  timestamp: string;
  icon: "clock" | "link" | "wallet" | "check";
}

export const demoStatuses: DemoStatus[] = [
  {
    s: "Pending",
    d: "Request analyzed",
    active: true,
    timestamp: "00:00",
    icon: "clock",
  },
  {
    s: "Matched",
    d: "Pairing found",
    active: true,
    timestamp: "00:28",
    icon: "link",
  },
  {
    s: "Awaiting Payment",
    d: "Local deposit",
    active: false,
    timestamp: "02:15",
    icon: "wallet",
  },
  {
    s: "Completed",
    d: "Funds released",
    active: false,
    timestamp: "04:32",
    icon: "check",
  },
];

export interface DemoTransaction {
  id: string;
  amount: string;
  currencyFrom: string;
  currencyTo: string;
  routeFrom: string;
  routeTo: string;
}

export const demoTransaction: DemoTransaction = {
  id: "TXN-2024-FL0X-7829",
  amount: "$500.00",
  currencyFrom: "USD",
  currencyTo: "EGP",
  routeFrom: "Gaza",
  routeTo: "Cairo",
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FAQEntry {
  q: string;
  a: string;
}

export const faqData: FAQEntry[] = [
  {
    q: "Is my money safe?",
    a: "Yes, all transactions are protected through our distributed digital escrow. Funds are never moved until verification is cryptographically confirmed by both parties.",
  },
  {
    q: "What if no match is found?",
    a: "Your request stays in our prioritized queue. For urgent transactions, FlowX can fulfill needs using platform liquidity reserves to ensure timely delivery.",
  },
  {
    q: "Can I cancel a transfer?",
    a: "Transfers can be cancelled at any point before local payment is confirmed by the matching party. Once both sides confirm, the escrow settlement is final.",
  },
  {
    q: "How long does a transfer take?",
    a: "Most transfers complete in under 15 minutes. The matching engine typically finds a pair within 30 seconds, and local payments are processed through instant settlement rails.",
  },
  {
    q: "What countries are supported?",
    a: "FlowX currently supports corridors between Palestine, Egypt, Turkey, and Jordan, with more regions being added quarterly based on demand and regulatory approval.",
  },
];
