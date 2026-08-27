import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Search,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Sparkles,
  Hash,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/templates")({
  head: () => ({ meta: [{ title: "Quick replies — MagnetPay" }] }),
  component: Templates,
});

type Cat = "all" | "quote" | "order" | "logistics" | "after";

type Tpl = {
  id: string;
  title: string;
  body: string;
  cat: Exclude<Cat, "all">;
  used: number;
  pinned?: boolean;
  vars?: string[];
};

const TPLS: Tpl[] = [
  {
    id: "t1",
    title: "Initial quote · FOB",
    body: "Hi {{buyer}}, attached is our quote for {{qty}} × {{product}} at ¥{{price}}/unit, FOB Guangzhou, {{lead}} lead. SGS pre-shipment included.",
    cat: "quote",
    used: 142,
    pinned: true,
    vars: ["buyer", "qty", "product", "price", "lead"],
  },
  {
    id: "t2",
    title: "Counter offer · volume tier",
    body: "Thanks for the interest. We can do ¥{{price}}/unit at {{qty}}+ units, same terms. Crate packing included.",
    cat: "quote",
    used: 88,
    vars: ["price", "qty"],
  },
  {
    id: "t3",
    title: "Sample dispatched",
    body: "Sample shipped via SF Express, tracking {{tracking}}. ETA {{eta}}. Please confirm receipt.",
    cat: "logistics",
    used: 54,
    pinned: true,
    vars: ["tracking", "eta"],
  },
  {
    id: "t4",
    title: "Production confirmed",
    body: "Order {{order}} entered production today. QC photos will be shared at cartoning, around {{date}}.",
    cat: "order",
    used: 67,
    vars: ["order", "date"],
  },
  {
    id: "t5",
    title: "Ready for inspection",
    body: "Goods ready for SGS inspection at our Guangzhou warehouse from {{date}}. Please coordinate the booking.",
    cat: "order",
    used: 41,
    vars: ["date"],
  },
  {
    id: "t6",
    title: "Documents uploaded",
    body: "Commercial invoice, packing list and BL uploaded to order {{order}}. Please review and acknowledge.",
    cat: "logistics",
    used: 33,
    vars: ["order"],
  },
  {
    id: "t7",
    title: "Dispute response",
    body: "Thank you for raising this. Our QC is reviewing cartons {{cartons}}. We'll respond within 12 hours with findings.",
    cat: "after",
    used: 12,
    vars: ["cartons"],
  },
];

function Templates() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [cat, setCat] = useState<Cat>("all");
  const [q, setQ] = useState("");

  const cats: { k: Cat; l: string }[] = [
    { k: "all", l: "All" },
    { k: "quote", l: "Quotes" },
    { k: "order", l: "Orders" },
    { k: "logistics", l: "Logistics" },
    { k: "after", l: "After-sales" },
  ];

  const list = TPLS.filter(
    (x) =>
      (cat === "all" || x.cat === cat) &&
      (q === "" || (x.title + " " + x.body).toLowerCase().includes(q.toLowerCase())),
  ).sort((a, b) => Number(b.pinned ?? 0) - Number(a.pinned ?? 0));

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-32"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header
            className="px-4 pt-12 pb-3 flex items-center justify-between sticky top-0 z-20"
            style={{ background: t.bg, borderBottom: `1px solid ${t.border}` }}
          >
            <Link
              to="/seller"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: t.muted }}
              >
                Seller · Inbox tools
              </p>
              <p className="text-[14px] font-bold">Quick replies</p>
            </div>
            <button
              className="size-9 grid place-items-center rounded-full text-white"
              style={{ background: t.accent }}
            >
              <Plus className="size-4" strokeWidth={2.6} />
            </button>
          </header>

          <section className="px-4 pt-3">
            <div
              className="flex items-center gap-2 h-11 px-3 rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <Search className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search templates…"
                className="flex-1 bg-transparent outline-none text-[12.5px]"
                style={{ color: t.ink }}
              />
            </div>
          </section>

          <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
            {cats.map((x) => {
              const on = cat === x.k;
              return (
                <button
                  key={x.k}
                  onClick={() => setCat(x.k)}
                  className="shrink-0 h-8 px-3 rounded-full text-[11px] font-bold"
                  style={{
                    background: on ? t.navy : t.surface,
                    color: on ? "#fff" : t.sub,
                    border: `1px solid ${on ? t.navy : t.border}`,
                  }}
                >
                  {x.l}
                </button>
              );
            })}
          </section>

          <section className="px-4 mt-4">
            <div
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{
                background: `${t.accent}08`,
                border: `1px dashed ${t.accent}40`,
              }}
            >
              <div
                className="size-8 rounded-lg grid place-items-center shrink-0"
                style={{ background: `${t.accent}15`, color: t.accent }}
              >
                <Sparkles className="size-4" strokeWidth={2.6} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] font-bold">Auto-draft from RFQ</p>
                <p className="text-[10.5px]" style={{ color: t.sub }}>
                  Let AI pre-fill {`{{variables}}`} from the buyer's request.
                </p>
              </div>
              <button
                className="h-7 px-2.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: t.accent }}
              >
                Try
              </button>
            </div>
          </section>

          <section className="px-4 mt-4 space-y-2.5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: t.muted }}
            >
              {list.length} template{list.length === 1 ? "" : "s"}
            </p>
            {list.map((tpl) => (
              <article
                key={tpl.id}
                className="rounded-2xl p-3.5"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-bold truncate">{tpl.title}</p>
                      {tpl.pinned && (
                        <Pin
                          className="size-3 shrink-0"
                          strokeWidth={2.4}
                          style={{ color: t.accent }}
                          fill={t.accent}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: catColor(tpl.cat, t) }}
                      >
                        {labelCat(tpl.cat)}
                      </span>
                      <span
                        className="text-[9.5px] tabular-nums"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: t.muted,
                        }}
                      >
                        · used {tpl.used}×
                      </span>
                    </div>
                  </div>
                  <button
                    className="size-8 grid place-items-center rounded-full"
                    style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.sub }}
                  >
                    <Pencil className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>

                <p
                  className="mt-2 text-[12px] leading-relaxed rounded-xl p-2.5"
                  style={{ background: t.bg, color: t.sub, border: `1px solid ${t.border}` }}
                >
                  {renderBody(tpl.body, t)}
                </p>

                {tpl.vars && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tpl.vars.map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md tabular-nums"
                        style={{
                          background: `${t.info}10`,
                          color: t.info,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        <Hash className="size-2.5" strokeWidth={2.6} />
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="mt-3 pt-3 flex items-center gap-2"
                  style={{ borderTop: `1px solid ${t.border}` }}
                >
                  <button
                    className="flex-1 h-9 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5"
                    style={{ background: t.navy, color: "#fff" }}
                  >
                    <Copy className="size-3.5" strokeWidth={2.6} /> Insert
                  </button>
                  <button
                    className="size-9 grid place-items-center rounded-full"
                    style={{
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      color: t.danger,
                    }}
                  >
                    <Trash2 className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function renderBody(body: string, t: typeof escrowTheme) {
  const parts = body.split(/(\{\{[^}]+\}\})/g);
  return parts.map((p, i) =>
    p.startsWith("{{") ? (
      <span
        key={i}
        className="font-bold px-1 rounded"
        style={{
          background: `${t.info}15`,
          color: t.info,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function labelCat(c: "quote" | "order" | "logistics" | "after") {
  return c === "quote"
    ? "Quote"
    : c === "order"
      ? "Order"
      : c === "logistics"
        ? "Logistics"
        : "After-sales";
}

function catColor(c: "quote" | "order" | "logistics" | "after", t: typeof escrowTheme) {
  return c === "quote"
    ? t.accent
    : c === "order"
      ? t.navy
      : c === "logistics"
        ? t.info
        : t.warn;
}
