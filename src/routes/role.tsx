import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft, ShoppingBag, Store, Check, ArrowRight, Repeat,
  Package, Wallet, Truck, Tag, Users, BarChart3,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { setRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/role")({
  head: () => ({ meta: [{ title: "Choose your role — MagnetPay" }] }),
  component: RolePicker,
});

function RolePicker() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", teal = "#0F766E";
  const navigate = useNavigate();
  const [picked, setPicked] = useState<V8Role | null>(null);

  useEffect(() => {
    // Hydrate from previous selection without forcing one.
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("v8.role") : null;
    if (stored === "buyer" || stored === "seller" || stored === "both") setPicked(stored);
  }, []);

  const roles = [
    {
      key: "buyer" as const,
      flag: "🇳🇬",
      title: "I'm buying",
      sub: "Nigeria → import from China",
      desc: "Source from vetted Chinese suppliers. Pay in Naira, get goods delivered to Lagos.",
      I: ShoppingBag,
      tint: navy,
      features: [
        { I: Package, l: "Bulk marketplace" },
        { I: Wallet, l: "Pay in ₦, settle in ¥" },
        { I: Truck, l: "Door-to-door logistics" },
      ],
    },
    {
      key: "seller" as const,
      flag: "🇨🇳",
      title: "I'm selling",
      sub: "China → supply African buyers",
      desc: "List products, get RFQs from African importers and receive payouts to your Chinese bank, WeChat or Alipay.",
      I: Store,
      tint: accent,
      features: [
        { I: Tag, l: "Storefront & catalog" },
        { I: Users, l: "RFQs from buyers" },
        { I: BarChart3, l: "WeChat / Alipay payout" },
      ],
    },
    {
      key: "both" as const,
      flag: "🌍",
      title: "I do both",
      sub: "Buy from CN · sell to AF",
      desc: "Run a two-way trade desk. Source from China, resell to African buyers, and route payouts both ways from one wallet.",
      I: Repeat,
      tint: "#0F766E",
      features: [
        { I: ShoppingBag, l: "Marketplace access" },
        { I: Store, l: "Storefront tools" },
        { I: Wallet, l: "₦ + ¥ wallets" },
      ],
    },
  ];

  const confirm = () => {
    if (!picked) return;
    setRole(picked);
    navigate({ to: "/signup" });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={navy}>
        <div
          className="relative min-h-full pb-32"
          style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link
              to="/welcome"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} style={{ color: ink }} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                Get started
              </p>
              <div className="mt-1 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1 flex-1 rounded-full"
                    style={{ background: i < 1 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-4">
            <h1 className="text-[26px] leading-[1.05] font-bold tracking-tight">
              How will you use<br />MagnetPay?
            </h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              Pick how you trade — this sets your country, currency and verification path. You can change it later from Settings.
            </p>
          </section>

          <section className="px-4 mt-6 space-y-3">
            {roles.map((r) => {
              const selected = picked === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setPicked(r.key)}
                  className="relative w-full text-left rounded-2xl p-4 transition-all active:scale-[0.99]"
                  style={{
                    background: selected ? r.tint : surface,
                    border: selected ? `1.5px solid ${r.tint}` : `1px solid ${border}`,
                    color: selected ? "#fff" : ink,
                    boxShadow: selected ? `0 20px 40px -15px ${r.tint}80` : "none",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="size-12 rounded-2xl grid place-items-center shrink-0 text-[22px]"
                      style={{
                        background: selected ? "rgba(255,255,255,0.18)" : `${r.tint}12`,
                      }}
                    >
                      <span>{r.flag}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold leading-tight">{r.title}</p>
                          <p
                            className="text-[10.5px] font-semibold uppercase tracking-wider mt-0.5"
                            style={{ color: selected ? "rgba(255,255,255,0.7)" : muted }}
                          >
                            {r.sub}
                          </p>
                        </div>
                        <span
                          className="size-6 rounded-full grid place-items-center shrink-0"
                          style={{
                            background: selected ? "#fff" : "transparent",
                            border: selected ? "none" : `1.5px solid ${border}`,
                          }}
                        >
                          {selected && <Check className="size-3.5" strokeWidth={3.2} style={{ color: r.tint }} />}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p
                    className="mt-3 text-[12px] leading-relaxed"
                    style={{ color: selected ? "rgba(255,255,255,0.85)" : sub }}
                  >
                    {r.desc}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.features.map((f) => (
                      <span
                        key={f.l}
                        className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-1 rounded-lg"
                        style={{
                          background: selected ? "rgba(255,255,255,0.14)" : `${ink}06`,
                          color: selected ? "#fff" : sub,
                        }}
                      >
                        <f.I className="size-3" strokeWidth={2.4} />
                        {f.l}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </section>

          <p className="px-4 mt-5 text-center text-[10.5px]" style={{ color: muted }}>
            Buyers verify with BVN/NIN. Sellers verify with Chinese business documents.
            <br />Need to switch later? Contact support.
          </p>

          <div
            className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6"
            style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}
          >
            <button
              disabled={!picked}
              onClick={confirm}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold transition active:scale-[0.98] disabled:opacity-40"
              style={{
                background: picked === "seller" ? accent : picked === "both" ? teal : navy,
                color: "#fff",
              }}
            >
              {picked ? (
                <>Continue as {picked === "buyer" ? "Buyer" : picked === "seller" ? "Seller" : "Both"} <ArrowRight className="size-4" strokeWidth={2.6} /></>
              ) : (
                <>Pick a role to continue</>
              )}
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}

