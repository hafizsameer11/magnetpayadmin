import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Bell, Camera, MapPin, Contact2, ArrowRight, Check } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/permissions")({
  head: () => ({ meta: [{ title: "Permissions — MagnetPay" }] }),
  component: Permissions,
});

function Permissions() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C", teal = "#0F766E";

  type Perm = { I: typeof Bell; k: string; why: string; recommended: boolean; on: boolean; tint: string };
  const [perms, setPerms] = useState<Perm[]>([
    { I: Bell, k: "Notifications", why: "Order updates, payment alerts, FX deals", recommended: true, on: true, tint: accent },
    { I: Camera, k: "Camera", why: "Scan QR codes, capture ID and product photos", recommended: true, on: true, tint: navy },
    { I: MapPin, k: "Location", why: "Suggest nearby pickup points & accurate delivery", recommended: false, on: false, tint: teal },
    { I: Contact2, k: "Contacts", why: "Quickly invite vendors and pay people you know", recommended: false, on: false, tint: "#1D4ED8" },
  ]);

  const toggle = (i: number) => setPerms((arr) => arr.map((p, idx) => idx === i ? { ...p, on: !p.on } : p));

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/address" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Final step · Permissions</p>
            </div>
            <Link to="/home" className="text-[11px] font-bold" style={{ color: muted }}>Skip</Link>
          </header>

          <section className="px-4 mt-4">
            <h1 className="text-[26px] leading-[1.05] font-bold tracking-tight">A few quick<br />permissions</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              You can change these anytime in your phone settings. Nothing happens without your tap.
            </p>
          </section>

          <section className="px-4 mt-5 space-y-3">
            {perms.map((p, i) => (
              <div key={p.k} className="p-3.5 rounded-2xl flex items-start gap-3" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${p.tint}14`, color: p.tint }}>
                  <p.I className="size-4" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold">{p.k}</p>
                    {p.recommended && (
                      <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                        style={{ background: `${accent}14`, color: accent }}>Recommended</span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-snug" style={{ color: sub }}>{p.why}</p>
                </div>
                <button onClick={() => toggle(i)}
                  className="w-11 h-6 rounded-full p-0.5 flex items-center transition-all shrink-0"
                  style={{ background: p.on ? navy : `${ink}1a`, justifyContent: p.on ? "flex-end" : "flex-start" }}>
                  <span className="size-5 rounded-full bg-white grid place-items-center">
                    {p.on && <Check className="size-3" strokeWidth={3.5} style={{ color: navy }} />}
                  </span>
                </button>
              </div>
            ))}
          </section>

          <section className="px-4 mt-5">
            <div className="p-3.5 rounded-2xl" style={{ background: `${navy}08`, border: `1px solid ${navy}1a` }}>
              <p className="text-[12px] font-bold">You're all set 🎉</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: sub }}>
                Your wallet is ready. Buyer & seller dashboards are unlocked — switch with one tap from the home tab.
              </p>
            </div>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <Link to="/home" className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition" style={{ background: navy, color: "#fff" }}>
              Enter MagnetPay <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
