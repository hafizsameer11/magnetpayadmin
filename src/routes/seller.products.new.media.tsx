import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ArrowRight, ImagePlus, Plus, X, Star, Layers, Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { ProductStepper } from "@/components/magnetpay/ProductStepper";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/products/new/media")({
  head: () => ({ meta: [{ title: "Add product · Media — Seller" }] }),
  component: AddMedia,
});

type Axis = { name: string; values: string[] };

function AddMedia() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<{ id: string; url?: string }[]>([{ id: "1" }, { id: "2" }, { id: "3" }]);
  const [axes, setAxes] = useState<Axis[]>([
    { name: "Material", values: ["Cast iron", "Stainless 304", "Stainless 316"] },
    { name: "Size", values: ["50mm", "75mm", "100mm"] },
  ]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setMedia((m) => [...m, ...files.map((f, i) => ({ id: `${Date.now()}-${i}`, url: URL.createObjectURL(f) }))]);
    toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} added`);
    e.target.value = "";
  }

  function addAxis() {
    if (axes.length >= 3) return;
    setAxes([...axes, { name: "", values: [] }]);
  }
  function rmAxis(i: number) { setAxes(axes.filter((_, x) => x !== i)); }
  function setAxisName(i: number, name: string) {
    setAxes(axes.map((a, x) => (x === i ? { ...a, name } : a)));
  }
  function addVal(i: number) {
    const v = (draft[i] || "").trim(); if (!v) return;
    setAxes(axes.map((a, x) => (x === i ? { ...a, values: [...a.values, v] } : a)));
    setDraft({ ...draft, [i]: "" });
  }
  function rmVal(i: number, v: string) {
    setAxes(axes.map((a, x) => (x === i ? { ...a, values: a.values.filter((y) => y !== v) } : a)));
  }

  const combos = axes.reduce((n, a) => n * Math.max(1, a.values.length), 1);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/products/new/pricing" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Add product · 3 of 4</p>
              <p className="text-[13px] font-bold">Media & variants</p>
            </div>
            <div className="size-9" />
          </header>

          <ProductStepper step={3} />

          {/* Media grid */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Photos & video · first is cover</p>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
            <div className="grid grid-cols-3 gap-2">
              {media.map((m, i) => (
                <div key={m.id} className="aspect-square rounded-2xl relative overflow-hidden" style={{ background: m.url ? `url(${m.url}) center/cover` : `${t.navy}10`, border: `1px solid ${t.border}` }}>
                  {!m.url && (
                    <div className="absolute inset-0 grid place-items-center" style={{ color: t.navy }}>
                      <ImagePlus className="size-6" strokeWidth={2} />
                    </div>
                  )}
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: t.accent, color: "#fff" }}>
                      <Star className="size-2.5" strokeWidth={0} fill="#fff" /> Cover
                    </span>
                  )}
                  <button onClick={() => setMedia(media.filter((x) => x.id !== m.id))}
                    className="absolute top-1.5 right-1.5 size-5 grid place-items-center rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                    <X className="size-3" strokeWidth={2.8} />
                  </button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1" style={{ background: t.surface, border: `1.5px dashed ${t.border}` }}>
                <Plus className="size-5" strokeWidth={2.4} style={{ color: t.muted }} />
                <p className="text-[9.5px] font-bold" style={{ color: t.muted }}>Add</p>
              </button>
            </div>
          </section>

          {/* Variants */}
          <section className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Variants · up to 3 axes</p>
              <button onClick={addAxis} disabled={axes.length >= 3}
                className="text-[10.5px] font-bold flex items-center gap-0.5 disabled:opacity-40" style={{ color: t.accent }}>
                <Plus className="size-3" strokeWidth={2.8} /> Add axis
              </button>
            </div>

            <div className="space-y-2">
              {axes.map((a, i) => (
                <div key={i} className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-2">
                    <Layers className="size-3.5" strokeWidth={2.6} style={{ color: t.muted }} />
                    <input value={a.name} onChange={(e) => setAxisName(i, e.target.value)} placeholder="Axis name (e.g. Material)"
                      className="flex-1 bg-transparent text-[12.5px] font-bold outline-none" />
                    <button onClick={() => rmAxis(i)} className="size-6 grid place-items-center rounded-full" style={{ color: t.muted }}>
                      <Trash2 className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.values.map((v) => (
                      <span key={v} className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: `${t.navy}10`, color: t.navy }}>
                        {v}
                        <button onClick={() => rmVal(i, v)}><X className="size-2.5" strokeWidth={2.8} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: `1px dashed ${t.border}` }}>
                    <input value={draft[i] || ""} onChange={(e) => setDraft({ ...draft, [i]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") addVal(i); }}
                      placeholder="Add value, press Enter"
                      className="flex-1 bg-transparent text-[12px] outline-none" />
                    <button onClick={() => addVal(i)} className="text-[10.5px] font-bold" style={{ color: t.accent }}>Add</button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 text-[10.5px]" style={{ color: t.muted }}>
              {combos} variant{combos === 1 ? "" : "s"} will be generated. Per-variant SKU, stock & price set next.
            </p>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/seller/products/new/shipping" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Continue to shipping <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
