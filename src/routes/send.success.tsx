import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Share2, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRoleGuard } from "@/lib/use-role-guard";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/send/success")({
  head: () => ({ meta: [{ title: "Sent — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    rid: String(s.rid ?? ""),
    name: String(s.name ?? "Recipient"),
    channel: String(s.channel ?? "bank"),
    cny: Number(s.cny) || 0,
    purpose: String(s.purpose ?? "GDS"),
    note: String(s.note ?? ""),
  }),
  component: SendSuccess,
});

function SendSuccess() {
  useRoleGuard(["buyer", "both"]);
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C", success = "#0F766E";
  const { name, channel, cny, rid } = useSearch({ from: "/send/success" });
  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const ref = rid ? `MP-S-${rid}` : `MP-S-${Math.floor(2000 + cny * 7).toString(36).toUpperCase()}`;
  const share = () => toast.success("Receipt link copied", { description: ref });

  const steps = [
    { l: "Authorized", t: "Just now", done: true },
    { l: "FX settled · ¥→bank", t: "In ~1 min", done: false, active: true },
    { l: `Paid out · ${channel === "bank" ? "ICBC" : channel === "alipay" ? "Alipay" : channel === "wechat" ? "WeChat" : "UnionPay"}`, t: "~30 min", done: false },
    { l: "Recipient confirmation", t: "Today", done: false },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-10" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3" />

          <section className="px-4 mt-2 text-center">
            <div className="size-16 rounded-full grid place-items-center mx-auto" style={{ background: `${success}1a`, color: success }}>
              <CheckCircle2 className="size-9" strokeWidth={2.2} />
            </div>
            <h1 className="mt-4 text-[24px] font-bold tracking-tight">¥{fmt(cny)} sent</h1>
            <p className="mt-1 text-[12.5px]" style={{ color: sub }}>to {name}</p>
            <p className="mt-3 text-[10.5px] font-mono" style={{ color: muted }}>Ref · {ref}</p>
          </section>

          {/* Tracking */}
          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Tracking</p>
            <div className="rounded-2xl p-4" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="relative">
                {steps.map((s, i) => (
                  <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < steps.length - 1 && (
                      <span className="absolute left-[10px] top-6 bottom-0 w-px" style={{ background: border }} />
                    )}
                    <div className="size-5 rounded-full shrink-0 grid place-items-center mt-0.5"
                      style={{
                        background: s.done ? success : s.active ? accent : surface,
                        border: `1.5px solid ${s.done ? success : s.active ? accent : border}`,
                      }}>
                      {s.done && <CheckCircle2 className="size-3.5 text-white" strokeWidth={3} />}
                      {s.active && <span className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12.5px] font-bold" style={{ color: s.done || s.active ? ink : muted }}>{s.l}</p>
                      <p className="text-[10.5px] flex items-center gap-1" style={{ color: muted }}>
                        <Clock className="size-3" strokeWidth={2.4} /> {s.t}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="px-4 mt-4 grid grid-cols-2 gap-2">
            <button onClick={share} className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
              style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
              <Share2 className="size-4" strokeWidth={2.4} /> Share receipt
            </button>
            <Link to="/send/status" search={{ ref, name, cny, state: "processing" as const }}
              className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold"
              style={{ background: navy, color: "#fff" }}>
              Live status <ArrowRight className="size-4" strokeWidth={2.4} />
            </Link>
          </section>

          <section className="px-4 mt-3">
            <Link to="/home" className="block w-full h-12 py-3 rounded-2xl text-center text-[13px] font-bold" style={{ color: navy }}>
              Back to home
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
