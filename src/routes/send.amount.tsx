import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { useState } from "react";
import { ChevronLeft, Tag, ChevronRight, ArrowLeftRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/send/amount")({
  head: () => ({ meta: [{ title: "Send · amount — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    rid: String(s.rid ?? ""),
    name: String(s.name ?? "Recipient"),
    channel: String(s.channel ?? "bank"),
  }),
  component: SendAmount,
});

const PURPOSES = [
  { code: "GDS", label: "Goods purchase", desc: "Inventory, raw materials, samples" },
  { code: "SVC", label: "Services", desc: "Sourcing, agent, inspection fees" },
  { code: "LOG", label: "Logistics & freight", desc: "Shipping, customs, warehousing" },
  { code: "FAM", label: "Family support", desc: "Personal remittance" },
  { code: "EDU", label: "Education", desc: "Tuition, course fees" },
];

function SendAmount() {
  useRoleGuard(["buyer", "both"], "Sending CNY isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();
  const { rid, name, channel } = useSearch({ from: "/send/amount" });

  const [cny, setCny] = useState("5000");
  const [purpose, setPurpose] = useState(PURPOSES[0].code);
  const [note, setNote] = useState("");
  const [showPurpose, setShowPurpose] = useState(false);

  const rate = 229.04;
  const cnyNum = Number(cny.replace(/,/g, "")) || 0;
  const ngn = cnyNum * rate;
  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const selected = PURPOSES.find((p) => p.code === purpose) ?? PURPOSES[0];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/send" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Sending to</p>
              <p className="text-[13px] font-bold truncate max-w-[180px]">{name}</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Amount */}
          <section className="px-4 mt-4 text-center">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Amount in CNY</p>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-[40px] font-bold" style={{ color: muted }}>¥</span>
              <input
                inputMode="decimal" value={cny}
                onChange={(e) => setCny(e.target.value.replace(/[^\d.]/g, ""))}
                className="w-[200px] bg-transparent outline-none text-center text-[56px] font-bold tabular-nums tracking-tight"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <p className="mt-1 text-[12px] flex items-center justify-center gap-1.5" style={{ color: sub }}>
              <ArrowLeftRight className="size-3.5" strokeWidth={2.4} />
              ≈ ₦{fmt(ngn, 0)} · 1 CNY = ₦{rate.toFixed(2)}
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {[1000, 5000, 10000, 25000].map((v) => (
                <button key={v} onClick={() => setCny(String(v))}
                  className="px-3 py-1.5 rounded-full text-[10.5px] font-bold"
                  style={{ background: cnyNum === v ? navy : `${navy}0d`, color: cnyNum === v ? "#fff" : navy }}>
                  ¥{v >= 1000 ? `${v / 1000}k` : v}
                </button>
              ))}
            </div>
          </section>

          {/* Purpose */}
          <section className="px-4 mt-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>
              Purpose of payment · required
            </p>
            <button onClick={() => setShowPurpose((s) => !s)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left"
              style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${accent}14`, color: accent }}>
                <Tag className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">{selected.label}</p>
                <p className="text-[10.5px]" style={{ color: muted }}>{selected.desc} · Code {selected.code}</p>
              </div>
              <ChevronRight className="size-4" style={{ color: muted }} strokeWidth={2.4} />
            </button>

            {showPurpose && (
              <div className="mt-2 rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
                {PURPOSES.map((p, i) => (
                  <button key={p.code} onClick={() => { setPurpose(p.code); setShowPurpose(false); }}
                    className={`w-full text-left px-3.5 py-3 ${i < PURPOSES.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: border, background: purpose === p.code ? `${navy}08` : "transparent" }}>
                    <p className="text-[12.5px] font-bold">{p.label} <span className="font-mono text-[10px]" style={{ color: muted }}>· {p.code}</span></p>
                    <p className="text-[10.5px]" style={{ color: sub }}>{p.desc}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: muted }}>Note (optional)</p>
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={64}
                placeholder="Invoice INV-2284 · 200 units"
                className="w-full h-11 px-3.5 rounded-2xl text-[12.5px]"
                style={{ background: surface, border: `1px solid ${border}` }} />
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 mt-6">
            <button
              onClick={() => navigate({ to: "/send/review", search: { rid, name, channel, cny: cnyNum, purpose, note } })}
              disabled={cnyNum < 10}
              className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white active:scale-[0.99] transition disabled:opacity-40"
              style={{ background: navy }}>
              Continue
            </button>
            <p className="mt-2 text-center text-[10.5px]" style={{ color: muted }}>
              Daily limit ¥200,000 · Available ¥86,540.20
            </p>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
