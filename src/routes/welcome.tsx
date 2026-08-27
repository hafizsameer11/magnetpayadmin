import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Ship, Repeat, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — MagnetPay" }] }),
  component: Welcome,
});

function Welcome() {
  const navy = "#0E3B2E";
  const bg = "#F6F1E7";
  const ink = "#1B1A17";
  const sub = "#5B5749";
  const muted = "#8A8472";
  const accent = "#C2410C";
  const teal = "#0F766E";
  const gold = "#B8860B";

  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const slides = [
    {
      tag: "Payments",
      title: "Pay suppliers\nin China, instantly",
      desc: "Send Naira to vendor bank accounts, WeChat Pay or Alipay in seconds. Transparent FX, no middlemen, no hidden fees.",
      I: Repeat,
      tint: accent,
      img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&q=70&auto=format&fit=crop",
    },
    {
      tag: "Shopping",
      title: "Source bulk from\nvetted suppliers",
      desc: "B2B sourcing from China — chat with vetted vendors, place bulk orders, and we handle payment, shipping, customs and delivery to Nigeria.",
      I: ShoppingBag,
      tint: gold,
      img: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=900&q=70&auto=format&fit=crop",
    },
    {
      tag: "Logistics",
      title: "Already have a\nsupplier? We ship.",
      desc: "Bring your own vendors in China — get live forwarder quotes, book pickup in Guangzhou, and track door-to-door delivery to Lagos.",
      I: Ship,
      tint: teal,
      img: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=900&q=70&auto=format&fit=crop",
    },
    {
      tag: "Escrow",
      title: "Secure deals with\nany vendor, anywhere",
      desc: "Already have a deal outside the platform? Hold funds in escrow until goods are delivered and approved. No more wire-and-pray.",
      I: ShieldCheck,
      tint: navy,
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=70&auto=format&fit=crop",
    },
  ];

  const s = slides[active];
  const isLast = active === slides.length - 1;

  const next = () => {
    if (isLast) navigate({ to: "/role" });
    else setActive(active + 1);
  };
  const prev = () => setActive(Math.max(0, active - 1));

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={navy}>
        <div
          className="relative w-full h-full"
          style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}
        >
          {/* Hero image */}
          <div
            className="relative h-[510px] w-full overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(180deg, ${s.tint}30 0%, ${s.tint}80 70%, ${bg} 100%), url('${s.img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "background-image 300ms ease",
            }}
          >
            {/* Back */}
            {active > 0 && (
              <button
                onClick={prev}
                className="absolute top-12 left-5 z-10 size-9 grid place-items-center rounded-full backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
              >
                <ChevronLeft className="size-4" strokeWidth={2.4} />
              </button>
            )}
            {/* Skip */}
            <Link
              to="/role"
              className="absolute top-12 right-5 z-10 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}
            >
              Skip
            </Link>

            {/* Icon badge */}
            <div className="absolute bottom-14 left-5">
              <div
                className="size-14 rounded-2xl grid place-items-center"
                style={{
                  background: "#FFFFFF",
                  boxShadow: `0 20px 40px -10px ${s.tint}80`,
                }}
              >
                <s.I className="size-6" strokeWidth={2.2} style={{ color: s.tint }} />
              </div>
              <span
                className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.28)", color: "#fff", backdropFilter: "blur(6px)" }}
              >
                {s.tag}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 -mt-6 relative">
            <div className="px-1">
              <h1
                className="text-[26px] leading-[1.05] font-bold tracking-tight whitespace-pre-line"
                style={{ color: ink }}
              >
                {s.title}
              </h1>
              <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: sub }}>
                {s.desc}
              </p>
            </div>

            {/* Feature row — all 4 pillars */}
            <div
              className="mt-5 rounded-2xl p-2.5 flex items-center justify-between"
              style={{ background: "#FFFFFF", border: `1px solid #E7DFCE` }}
            >
              {slides.map((sl, i) => (
                <button
                  key={sl.tag}
                  onClick={() => setActive(i)}
                  className="flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all"
                  style={{ opacity: i === active ? 1 : 0.42 }}
                >
                  <div
                    className="size-9 rounded-xl grid place-items-center"
                    style={{
                      background: i === active ? `${sl.tint}15` : "transparent",
                      color: sl.tint,
                    }}
                  >
                    <sl.I className="size-4" strokeWidth={2.3} />
                  </div>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider" style={{ color: muted }}>
                    {sl.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pagination + CTA */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-7 pt-4" style={{ background: bg }}>
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === active ? 22 : 6,
                    height: 6,
                    background: i === active ? navy : `${navy}33`,
                  }}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold"
              style={{ background: navy, color: "#fff" }}
            >
              {isLast ? "Get started" : "Next"} <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
