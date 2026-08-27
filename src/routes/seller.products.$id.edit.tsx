import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Save, Eye, EyeOff, Tag, Package, Ship, Layers, ImagePlus, ChevronRight, Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/products/$id/edit")({
  head: () => ({ meta: [{ title: "Edit product — Seller" }] }),
  component: EditProduct,
});

function EditProduct() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [live, setLive] = useState(true);
  const [name, setName] = useState("Cast-iron pump body PB-A2");
  const [stock, setStock] = useState("1240");

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Edit product</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{id}</p>
            </div>
            <button onClick={() => { if (confirm(`Delete ${id}? This cannot be undone.`)) { toast.success(`${id} deleted`); navigate({ to: "/seller/catalog" }); } }}
              className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.danger }}>
              <Trash2 className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          {/* Status toggle */}
          <section className="px-4 mt-2">
            <button onClick={() => setLive(!live)} className="w-full rounded-2xl p-3 flex items-center gap-3 text-left" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: live ? `${t.success}15` : `${t.muted}20`, color: live ? t.success : t.muted }}>
                {live ? <Eye className="size-4" strokeWidth={2.4} /> : <EyeOff className="size-4" strokeWidth={2.4} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">{live ? "Live on storefront" : "Draft · hidden"}</p>
                <p className="text-[10.5px]" style={{ color: t.muted }}>{live ? "412 sold · 4.86★" : "Toggle to publish"}</p>
              </div>
              <span className="w-9 h-5 rounded-full relative" style={{ background: live ? t.accent : t.border }}>
                <span className="absolute top-0.5 size-4 rounded-full bg-white transition-all" style={{ left: live ? "calc(100% - 18px)" : "2px" }} />
              </span>
            </button>
          </section>

          {/* Name */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Product name</p>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl px-3 py-2.5 text-[13px] font-bold outline-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          {/* Stock */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Stock on hand</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric"
                className="flex-1 bg-transparent text-[20px] font-extrabold tabular-nums outline-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              <p className="text-[11px] font-bold" style={{ color: t.muted }}>units</p>
            </div>
          </section>

          {/* Sections */}
          <section className="px-4 mt-3 space-y-2">
            {[
              { I: Tag, l: "Pricing & MOQ", s: "3 tiers · from ¥212 · MOQ 50", to: "/seller/products/new/pricing" as const },
              { I: ImagePlus, l: "Photos & media", s: "6 photos · 1 video", to: "/seller/products/new/media" as const },
              { I: Layers, l: "Variants", s: "Material × Size · 9 variants", to: "/seller/products/new/media" as const },
              { I: Package, l: "Packaging", s: "Carton · 0.012 CBM · 2.1 kg", to: "/seller/products/new/shipping" as const },
              { I: Ship, l: "Lead time & shipping", s: "5–10 days · Guangzhou hub", to: "/seller/products/new/shipping" as const },
            ].map((r) => (
              <Link key={r.l} to={r.to} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <r.I className="size-4" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold">{r.l}</p>
                  <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{r.s}</p>
                </div>
                <ChevronRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              </Link>
            ))}
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => toast.success(`${id} saved · ${live ? "Live" : "Draft"}`)}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <Save className="size-4" strokeWidth={2.6} /> Save changes
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
