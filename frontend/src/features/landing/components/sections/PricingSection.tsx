import { Container } from "../ui";

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-zinc-50 border-y border-zinc-100">
      <Container className="text-center">
        <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-8 text-brand-blue">
          Simple, Transparent Fees
        </h2>
        <p className="text-lg md:text-xl text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed mb-16 px-4">
          FlowX charges a small fee per transaction - typically between{" "}
          <span className="text-brand-teal font-medium">1% and 3%</span>,
          significantly lower than traditional transfer services.
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal/10 border border-brand-teal/20 rounded-full text-[10px] uppercase tracking-widest text-brand-teal font-bold shadow-lg shadow-brand-teal/5">
          No Hidden Exchange Rate Markups
        </div>
      </Container>
    </section>
  );
}
