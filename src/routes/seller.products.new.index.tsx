import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, X, ArrowRight, Tag } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { ProductStepper } from "@/components/magnetpay/ProductStepper";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/products/new/")({
  head: () => ({ meta: [{ title: "Add product · Basics — Seller" }] }),
  component: AddBasics,
});

const CATS = ["Industrial", "Pumps & Motors", "Bearings", "Magnets", "Fasteners", "Electrical", "Tools", "Raw materials"];

function AddBasics() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [cat, setCat] = useState("Pumps & Motors");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<string[]>(["OEM"]);
  const [tagDraft, setTagDraft] = useState("");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/catalog" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Add product · 1 of 4</p>
              <p className="text-[13px] font-bold">Basics</p>
            </div>
            <div className="size-9" />
          </header>

          <ProductStepper step={1} />

          <section className="px-4 mt-5">
            <Label>Product name</Label>
            <Input v={name} setV={setName} placeholder="e.g. Cast-iron pump body PB-A2" />
          </section>

          <section className="px-4 mt-3 grid grid-cols-2 gap-2">
            <div>
              <Label>SKU / Model</Label>
              <Input v={sku} setV={setSku} placeholder="PB-A2" mono />
            </div>
            <div>
              <Label>Category</Label>
              <select value={cat} onChange={(e) => setCat(e.target.value)}
                className="w-full rounded-2xl px-3 py-2.5 text-[12.5px] font-semibold outline-none"
                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </section>

          <section className="px-4 mt-3">
            <Label>Description</Label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5}
              placeholder="Materials, certifications, applications, dimensions…"
              className="w-full rounded-2xl p-3 text-[12.5px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          <section className="px-4 mt-3">
            <Label>Tags</Label>
            <div className="rounded-2xl p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tg) => (
                  <span key={tg} className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={{ background: `${t.navy}10`, color: t.navy }}>
                    <Tag className="size-2.5" strokeWidth={2.8} />{tg}
                    <button onClick={() => setTags(tags.filter((x) => x !== tg))}><X className="size-2.5" strokeWidth={2.8} /></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: `1px dashed ${t.border}` }}>
                <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && tagDraft.trim()) { setTags([...tags, tagDraft.trim()]); setTagDraft(""); } }}
                  placeholder="Add tag and press Enter"
                  className="flex-1 bg-transparent text-[12px] outline-none" />
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => navigate({ to: "/seller/products/new/pricing" })}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              Continue to pricing <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const t = escrowTheme;
  return <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>{children}</p>;
}
function Input({ v, setV, placeholder, mono }: { v: string; setV: (s: string) => void; placeholder?: string; mono?: boolean }) {
  const t = escrowTheme;
  return (
    <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
      className="w-full rounded-2xl px-3 py-2.5 text-[12.5px] font-semibold outline-none"
      style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink, fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif" }} />
  );
}
