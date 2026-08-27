import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Send, Paperclip, ShieldCheck, User, Building2, Gavel, FileText } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/$id/dispute/thread")({
  head: () => ({ meta: [{ title: "Dispute mediation — MagnetPay" }] }),
  component: DisputeThread,
});

type Msg = { who: "you" | "them" | "mediator" | "system"; name: string; text: string; time: string; doc?: string };

const SEED: Msg[] = [
  { who: "system", name: "MagnetPay", text: "Dispute D-4421 opened · funds frozen", time: "10:02" },
  { who: "you", name: "Chidi Okoro", text: "Goods arrived but 18 of 200 units are cracked. Photos attached.", time: "10:04", doc: "IMG_2241.jpg" },
  { who: "mediator", name: "Adaeze · Mediator", text: "Thank you for the photos. Could you confirm the carton numbers affected?", time: "10:18" },
  { who: "them", name: "Guangzhou Huayi Co.", text: "We're checking with QC. Will respond within 12h.", time: "11:30" },
  { who: "you", name: "Chidi Okoro", text: "Cartons 4, 7, 11–14. Forwarding inspection report.", time: "12:05", doc: "SGS-Lagos-IR-771.pdf" },
];

function DisputeThread() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const { id } = useParams({ from: "/escrow/$id/dispute/thread" });
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { who: "you", name: "Chidi Okoro", text: draft.trim(), time: "now" }]);
    setDraft("");
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full flex flex-col" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between shrink-0" style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}>
            <Link to="/escrow/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.danger }}>● Dispute · D-4421</p>
              <p className="text-[13px] font-bold">#{id} mediation</p>
            </div>
            <button onClick={() => navigate({ to: "/escrow/$id/dispute/outcome", params: { id } })}
              className="h-9 px-3 rounded-full text-[10.5px] font-bold flex items-center gap-1"
              style={{ background: `${t.info}12`, color: t.info }}>
              <Gavel className="size-3" strokeWidth={2.6} /> Ruling
            </button>
          </header>

          <section className="px-4 pt-3 pb-3 shrink-0" style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-2">
              {[
                { I: User, n: "You", c: t.navy },
                { I: Building2, n: "Supplier", c: t.sub },
                { I: ShieldCheck, n: "Mediator", c: t.info },
              ].map((p) => (
                <div key={p.n} className="flex-1 rounded-xl px-2 py-1.5 flex items-center gap-1.5" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                  <p.I className="size-3 shrink-0" strokeWidth={2.4} style={{ color: p.c }} />
                  <p className="text-[10px] font-bold truncate" style={{ color: t.sub }}>{p.n}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
            {msgs.map((m, i) => {
              if (m.who === "system") {
                return (
                  <div key={i} className="text-center">
                    <span className="inline-block text-[9.5px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                      style={{ background: `${t.muted}15`, color: t.muted }}>
                      {m.text} · {m.time}
                    </span>
                  </div>
                );
              }
              const isYou = m.who === "you";
              const isMed = m.who === "mediator";
              const bg = isYou ? t.navy : isMed ? `${t.info}10` : t.surface;
              const color = isYou ? "#fff" : t.ink;
              const nameColor = isYou ? "#C8C2B0" : isMed ? t.info : t.muted;
              return (
                <div key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[78%]">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1 px-1" style={{ color: nameColor, textAlign: isYou ? "right" : "left" }}>
                      {m.name}
                    </p>
                    <div className="rounded-2xl px-3 py-2" style={{ background: bg, color, border: isMed ? `1px solid ${t.info}30` : isYou ? "none" : `1px solid ${t.border}` }}>
                      <p className="text-[12.5px] leading-snug">{m.text}</p>
                      {m.doc && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold rounded-lg px-2 py-1"
                          style={{ background: isYou ? "rgba(255,255,255,0.12)" : `${t.navy}10`, color: isYou ? "#fff" : t.navy }}>
                          <FileText className="size-3" strokeWidth={2.4} /> {m.doc}
                        </div>
                      )}
                      <p className="mt-1 text-[9.5px] tabular-nums" style={{ color: isYou ? "#C8C2B0" : t.muted, fontFamily: "'JetBrains Mono', monospace", textAlign: isYou ? "right" : "left" }}>
                        {m.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="px-3 pb-5 pt-2 shrink-0" style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-2">
              <button className="size-10 grid place-items-center rounded-full shrink-0" style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.sub }}>
                <Paperclip className="size-4" strokeWidth={2.3} />
              </button>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Reply to mediator…"
                className="flex-1 h-10 px-3.5 rounded-full text-[12.5px]"
                style={{ background: t.bg, border: `1px solid ${t.border}` }} />
              <button onClick={send} disabled={!draft.trim()}
                className="size-10 rounded-full grid place-items-center text-white shrink-0 disabled:opacity-40"
                style={{ background: t.accent }}>
                <Send className="size-4" strokeWidth={2.6} />
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
