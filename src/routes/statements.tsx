import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Download, FileText, Mail, Calendar, FileSpreadsheet, FileDown, Check } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/statements")({
  head: () => ({ meta: [{ title: "Statements — MagnetPay" }] }),
  component: Statements,
});

type Range = "30d" | "90d" | "ytd" | "custom";
type Ccy = "all" | "ngn" | "usd" | "cny";
type Fmt = "pdf" | "csv" | "xlsx";

const RECENT = [
  { m: "May 2026", ccy: "All", sz: "PDF · 184 KB", n: "MP-Statement-2026-05.pdf" },
  { m: "April 2026", ccy: "CNY", sz: "PDF · 92 KB", n: "MP-Statement-2026-04-cny.pdf" },
  { m: "Q1 2026", ccy: "All", sz: "XLSX · 312 KB", n: "MP-Statement-Q1-2026.xlsx" },
];

function Statements() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const [range, setRange] = useState<Range>("30d");
  const [ccy, setCcy] = useState<Ccy>("all");
  const [fmt, setFmt] = useState<Fmt>("pdf");
  const [emailed, setEmailed] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const customReady = range !== "custom" || (customFrom && customTo);
  const today = new Date().toISOString().slice(0, 10);
  const periodLabel =
    range === "custom" && customFrom && customTo ? `${customFrom} → ${customTo}`
    : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : range === "ytd" ? "Year to date" : "Custom";
  const generate = () => {
    if (!customReady) { toast.error("Pick custom start and end dates"); return; }
    toast.success(`Statement ready`, { description: `${ccy.toUpperCase()} · ${periodLabel} · ${fmt.toUpperCase()}` });
  };
  const downloadOld = (n: string) => toast.success("Downloaded", { description: n });

  const ranges: { id: Range; l: string }[] = [
    { id: "30d", l: "Last 30 days" },
    { id: "90d", l: "Last 90 days" },
    { id: "ytd", l: "Year to date" },
    { id: "custom", l: "Custom range" },
  ];
  const ccys: { id: Ccy; l: string }[] = [
    { id: "all", l: "All" }, { id: "ngn", l: "NGN" }, { id: "usd", l: "USD" }, { id: "cny", l: "CNY" },
  ];
  const fmts: { id: Fmt; l: string; I: any }[] = [
    { id: "pdf", l: "PDF", I: FileText },
    { id: "csv", l: "CSV", I: FileDown },
    { id: "xlsx", l: "XLSX", I: FileSpreadsheet },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/home" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Statements</p>
              <p className="text-[13px] font-bold">Export & download</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Range */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Period</p>
            <div className="grid grid-cols-2 gap-2">
              {ranges.map((r) => {
                const active = r.id === range;
                return (
                  <button key={r.id} onClick={() => setRange(r.id)}
                    className="flex items-center gap-2 p-3 rounded-2xl text-left"
                    style={{ background: active ? navy : surface, color: active ? "#fff" : ink, border: `1px solid ${active ? navy : border}` }}>
                    <Calendar className="size-4" strokeWidth={2.3} style={{ color: active ? "#fff" : sub }} />
                    <span className="text-[12px] font-bold">{r.l}</span>
                  </button>
                );
              })}
            </div>
            {range === "custom" && (
              <div className="mt-2 rounded-2xl p-3 grid grid-cols-2 gap-2" style={{ background: surface, border: `1px solid ${border}` }}>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>From</span>
                  <input type="date" max={today} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                    className="mt-1 w-full h-9 px-2 rounded-xl text-[12px] outline-none" style={{ background: bg, border: `1px solid ${border}` }} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>To</span>
                  <input type="date" max={today} value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                    className="mt-1 w-full h-9 px-2 rounded-xl text-[12px] outline-none" style={{ background: bg, border: `1px solid ${border}` }} />
                </label>
              </div>
            )}
          </section>

          {/* Currency */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Currency</p>
            <div className="grid grid-cols-4 gap-2">
              {ccys.map((c) => {
                const active = c.id === ccy;
                return (
                  <button key={c.id} onClick={() => setCcy(c.id)}
                    className="py-2.5 rounded-2xl text-[12px] font-bold"
                    style={{ background: active ? navy : surface, color: active ? "#fff" : ink, border: `1px solid ${active ? navy : border}` }}>
                    {c.l}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Format */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Format</p>
            <div className="grid grid-cols-3 gap-2">
              {fmts.map((f) => {
                const active = f.id === fmt;
                return (
                  <button key={f.id} onClick={() => setFmt(f.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                    style={{ background: active ? navy : surface, color: active ? "#fff" : ink, border: `1px solid ${active ? navy : border}` }}>
                    <f.I className="size-5" strokeWidth={2.3} />
                    <span className="text-[11px] font-bold">{f.l}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* CTAs */}
          <section className="px-4 mt-5 space-y-2">
            <button onClick={generate} className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
              style={{ background: accent }}>
              <Download className="size-4" strokeWidth={2.4} /> Generate statement
            </button>
            <button onClick={() => { setEmailed(true); setTimeout(() => setEmailed(false), 2000); }}
              className="w-full h-12 py-3 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2"
              style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
              {emailed ? <><Check className="size-4" strokeWidth={2.6} /> Sent to your email</> : <><Mail className="size-4" strokeWidth={2.4} /> Email me a copy</>}
            </button>
          </section>

          {/* Recent */}
          <section className="px-4 mt-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Recent exports</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              {RECENT.map((r, i, arr) => (
                <div key={i} className={`flex items-center gap-3 px-3.5 py-3 ${i < arr.length - 1 ? "border-b" : ""}`} style={{ borderColor: border }}>
                  <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
                    <FileText className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold truncate">{r.m} · {r.ccy}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>{r.sz}</p>
                  </div>
                  <button onClick={() => downloadOld(r.n)} className="size-8 rounded-full grid place-items-center" style={{ background: bg, color: navy }}>
                    <Download className="size-4" strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
