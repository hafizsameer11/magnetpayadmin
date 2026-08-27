import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Star, Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";
import pPump from "@/assets/market/p-pump.jpg";

export const Route = createFileRoute("/market/order/$id/review")({
  head: () => ({ meta: [{ title: "Review — MagnetPay" }] }),
  component: ReviewSubmit,
});

const FACETS = [
  { k: "quality", l: "Product quality" },
  { k: "ontime", l: "On-time delivery" },
  { k: "comm", l: "Communication" },
  { k: "packing", l: "Packing & docs" },
] as const;

function ReviewSubmit() {
  useRoleGuard(["buyer", "both"], "Marketplace purchases are for buyers");
  const t = escrowTheme;
  const { id } = useParams({ from: "/market/order/$id/review" });
  const navigate = useNavigate();
  const [overall, setOverall] = useState(5);
  const [facets, setFacets] = useState<Record<string, number>>({ quality: 5, ontime: 4, comm: 5, packing: 5 });
  const [text, setText] = useState("On time, well packed. Will reorder.");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
        <PhoneFrame background={t.navy}>
          <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
            <section className="px-6 pt-32 text-center">
              <div className="mx-auto size-20 rounded-full grid place-items-center" style={{ background: `${t.success}15`, color: t.success }}>
                <CheckCircle2 className="size-10" strokeWidth={2.2} />
              </div>
              <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: t.success }}>Thanks for rating</p>
              <h1 className="mt-1 text-[22px] font-bold leading-tight">Review published</h1>
              <p className="mt-2 text-[12.5px]" style={{ color: t.sub }}>Your feedback helps other buyers and lifts trusted suppliers.</p>
            </section>
            <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
              <div className="max-w-[420px] mx-auto pointer-events-auto">
                <Link to="/market/orders" className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                  style={{ background: t.navy }}>
                  Back to orders
                </Link>
              </div>
            </section>
          </div>
        </PhoneFrame>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-4" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/market/order/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Rate this order</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <img src={pPump} alt="" className="size-12 rounded-xl shrink-0 object-cover" style={{ border: `1px solid ${t.border}` }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-bold">Pump bodies PB-A2 · 200u</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>Guangzhou Huayi · delivered Mar 18</p>
              </div>
            </div>
          </section>

          <section className="px-4 mt-5 text-center">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Overall</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setOverall(n)}>
                  <Star className="size-9" strokeWidth={2}
                    style={{ color: n <= overall ? t.warn : t.border, fill: n <= overall ? t.warn : "transparent" }} />
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] font-bold" style={{ color: t.sub }}>
              {overall === 5 ? "Excellent" : overall === 4 ? "Good" : overall === 3 ? "Okay" : overall === 2 ? "Poor" : "Bad"}
            </p>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Break it down</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {FACETS.map((f, i, a) => (
                <div key={f.k} className={`flex items-center justify-between px-3.5 py-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <p className="text-[12px] font-semibold">{f.l}</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setFacets((p) => ({ ...p, [f.k]: n }))}>
                        <Star className="size-4" strokeWidth={2.2}
                          style={{ color: n <= facets[f.k] ? t.warn : t.border, fill: n <= facets[f.k] ? t.warn : "transparent" }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Notes</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
              className="w-full p-3 rounded-2xl text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub }} />
            <button className="mt-2 w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[12px] font-semibold"
              style={{ background: t.surface, border: `1px dashed ${t.border}`, color: t.sub }}>
              <Camera className="size-3.5" strokeWidth={2.4} /> Add photos (optional)
            </button>
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${t.success}10`, border: `1px solid ${t.success}30` }}>
              <ShieldCheck className="size-4 mt-0.5 shrink-0" strokeWidth={2.4} style={{ color: t.success }} />
              <p className="text-[11px] leading-snug" style={{ color: t.sub }}>
                Reviews are verified by escrow delivery — only buyers who received goods can post.
              </p>
            </div>
          </section>

          <section className="sticky bottom-3 left-0 right-0 px-4 pointer-events-none mt-3">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => setDone(true)}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <Star className="size-4" strokeWidth={2.6} /> Publish review
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
