import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Search, Package, MoreVertical, Eye, EyeOff } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/catalog")({
  head: () => ({ meta: [{ title: "Catalog — Seller" }] }),
  component: Catalog,
});

const PRODUCTS = [
  { id: "PB-A2", name: "Cast-iron pump body PB-A2", price: 243, moq: 50, stock: 1240, sold: 412, live: true },
  { id: "CS-7", name: "Coil set CS-7 · copper", price: 280, moq: 20, stock: 320, sold: 188, live: true },
  { id: "B-22", name: "Sealed bearing B-22 · 6204ZZ", price: 26, moq: 500, stock: 18200, sold: 5400, live: true },
  { id: "MG-9", name: "Neodymium magnet MG-9", price: 88, moq: 100, stock: 0, sold: 720, live: false },
  { id: "SH-3", name: "Steel shaft SH-3 · 200mm", price: 64, moq: 100, stock: 540, sold: 92, live: true },
  { id: "GR-12", name: "Gear ring GR-12 · 12T", price: 142, moq: 30, stock: 80, sold: 41, live: false },
];

function Catalog() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [tab, setTab] = useState<"all" | "live" | "draft" | "out">("all");
  const list = PRODUCTS.filter((p) => {
    if (tab === "live") return p.live;
    if (tab === "draft") return !p.live;
    if (tab === "out") return p.stock === 0;
    return true;
  });
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="catalog" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Seller</p>
              <p className="text-[13px] font-bold">Catalog · {PRODUCTS.length}</p>
            </div>
            <Link to="/seller/products/new" className="size-9 grid place-items-center rounded-full text-white" style={{ background: t.accent }}>
              <Plus className="size-4" strokeWidth={2.8} />
            </Link>
          </header>

          {/* Search */}
          <section className="px-4 mt-2">
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input placeholder="Search SKU, name…" className="flex-1 bg-transparent text-[12.5px] outline-none" />
            </div>
          </section>

          {/* Tabs */}
          <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
            {[
              { k: "all" as const, l: `All · ${PRODUCTS.length}` },
              { k: "live" as const, l: `Live · ${PRODUCTS.filter(p => p.live).length}` },
              { k: "draft" as const, l: `Draft · ${PRODUCTS.filter(p => !p.live).length}` },
              { k: "out" as const, l: `Out · ${PRODUCTS.filter(p => p.stock === 0).length}` },
            ].map((c) => {
              const on = tab === c.k;
              return (
                <button key={c.k} onClick={() => setTab(c.k)} className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: on ? t.accent : t.surface, color: on ? "#fff" : t.ink, border: `1px solid ${on ? t.accent : t.border}` }}>{c.l}</button>
              );
            })}
          </section>

          {/* List */}
          <section className="px-4 mt-3 space-y-2">
            {list.map((p) => (
              <Link key={p.id} to="/seller/products/$id/edit" params={{ id: p.id }}
                className="block rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="size-14 rounded-xl grid place-items-center shrink-0" style={{ background: `${t.navy}10`, color: t.navy }}>
                  <Package className="size-6" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11.5px] font-extrabold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: t.muted }}>{p.id}</p>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: p.live ? `${t.success}15` : `${t.muted}20`, color: p.live ? t.success : t.muted }}>
                      {p.live ? <Eye className="size-2.5 inline mr-0.5" strokeWidth={2.6} /> : <EyeOff className="size-2.5 inline mr-0.5" strokeWidth={2.6} />}
                      {p.live ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold mt-0.5 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10.5px]" style={{ color: t.muted }}>MOQ {p.moq}</p>
                    <span style={{ color: t.border }}>·</span>
                    <p className="text-[10.5px]" style={{ color: p.stock === 0 ? t.danger : t.muted }}>{p.stock === 0 ? "Out of stock" : `${p.stock.toLocaleString()} in stock`}</p>
                    <span style={{ color: t.border }}>·</span>
                    <p className="text-[10.5px]" style={{ color: t.muted }}>{p.sold} sold</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-extrabold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>¥{p.price}</p>
                  <p className="text-[9.5px] mt-0.5" style={{ color: t.muted }}>from</p>
                </div>
                <MoreVertical className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              </Link>
            ))}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
