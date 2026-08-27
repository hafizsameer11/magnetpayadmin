import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  ShieldCheck,
  Truck,
  Coins,
  Users2,
  MessageCircle,
  PhoneCall,
  BookOpen,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/help/")({
  head: () => ({ meta: [{ title: "Help center — MagnetPay" }] }),
  component: Help,
});

const TOPICS = [
  { I: ShieldCheck, k: "Escrow", n: 18, c: "#1D4ED8" },
  { I: Truck, k: "Shipping", n: 12, c: "#0F766E" },
  { I: Coins, k: "Payments & FX", n: 9, c: "#C2410C" },
  { I: Users2, k: "Account", n: 7, c: "#0E3B2E" },
];

const FAQ = [
  {
    q: "When are escrow milestones released?",
    a: "Funds release automatically when the corresponding milestone (deposit, production, B/L, delivery) is approved. You can also release early from the escrow page or open a dispute within 7 days.",
  },
  {
    q: "What does MagnetPay charge per transaction?",
    a: "0.9% on funded escrow + ¥6 fixed per release. FX conversion is at mid-market + 0.35%. There are no monthly fees.",
  },
  {
    q: "How long do CNY → NGN payouts take?",
    a: "Typically 1–2 business hours during banking hours. Cross-bank settlements in Nigeria can take up to 4 hours.",
  },
  {
    q: "Can I cancel an order after funding escrow?",
    a: "Yes, before production starts. Once the supplier confirms production the order moves to dispute resolution if you want to cancel.",
  },
  {
    q: "Is SGS inspection mandatory?",
    a: "Optional but recommended on first orders above ¥50,000. Cost is shared 50/50 unless agreed otherwise in your quote terms.",
  },
];

function Help() {
  const t = escrowTheme;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = FAQ.filter(
    (f) =>
      !q.trim() ||
      f.q.toLowerCase().includes(q.toLowerCase()) ||
      f.a.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-28"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/me"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">Help center</p>
            <div className="size-9" />
          </header>

          <section className="px-4">
            <div
              className="flex items-center gap-2 h-11 px-3.5 rounded-2xl"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search escrow, payouts, FX…"
                className="flex-1 bg-transparent outline-none text-[12.5px]"
                style={{ color: t.ink }}
              />
            </div>
          </section>

          <section className="px-4 mt-4 grid grid-cols-2 gap-2">
            {TOPICS.map((tp) => (
              <button
                key={tp.k}
                onClick={() => toast(`${tp.k} · ${tp.n} articles`)}
                className="rounded-2xl p-3 text-left flex items-center gap-2.5"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
              >
                <div
                  className="size-9 rounded-xl grid place-items-center shrink-0"
                  style={{ background: `${tp.c}12`, color: tp.c }}
                >
                  <tp.I className="size-4" strokeWidth={2.3} />
                </div>
                <div>
                  <p className="text-[12px] font-bold">{tp.k}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>
                    {tp.n} articles
                  </p>
                </div>
              </button>
            ))}
          </section>

          <section className="px-4 mt-5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Popular questions
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              {filtered.map((f, i) => (
                <button
                  key={f.q}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full px-3.5 py-3 text-left"
                  style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}
                >
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-[12.5px] font-bold leading-snug">{f.q}</p>
                    <ChevronDown
                      className="size-4 shrink-0 mt-0.5 transition-transform"
                      strokeWidth={2.4}
                      style={{
                        color: t.muted,
                        transform: open === i ? "rotate(180deg)" : "none",
                      }}
                    />
                  </div>
                  {open === i && (
                    <p
                      className="mt-2 text-[11.5px] leading-snug"
                      style={{ color: t.sub }}
                    >
                      {f.a}
                    </p>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3.5 py-6 text-center">
                  <p className="text-[12px]" style={{ color: t.muted }}>
                    No articles match "{q}".
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="px-4 mt-5">
            <Link
              to="/help"
              className="w-full rounded-2xl p-3 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <BookOpen className="size-4 shrink-0" strokeWidth={2.3} style={{ color: t.navy }} />
              <p className="flex-1 text-left text-[12px] font-bold">
                Open the full guide library
              </p>
              <ChevronDown
                className="size-4 -rotate-90"
                strokeWidth={2.4}
                style={{ color: t.muted }}
              />
            </Link>
          </section>

          {/* Bottom CTAs */}
          <section className="absolute bottom-3 left-0 right-0 px-4 grid grid-cols-2 gap-2">
            <a
              href="tel:+8008008000"
              className="h-12 rounded-2xl flex items-center justify-center gap-2 text-[12px] font-bold"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}
            >
              <PhoneCall className="size-4" strokeWidth={2.4} /> Call us
            </a>
            <Link
              to="/help/ticket"
              className="h-12 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold text-white"
              style={{ background: t.navy }}
            >
              <MessageCircle className="size-4" strokeWidth={2.6} /> Chat with support
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
