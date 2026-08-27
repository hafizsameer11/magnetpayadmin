import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Search, User, Phone, Mail, Send, Building2, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { useRoleGuard } from "@/lib/use-role-guard";
import { EscrowStepper, escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/escrow/new/")({
  head: () => ({ meta: [{ title: "New escrow · counterparty — MagnetPay" }] }),
  component: NewEscrowCounterparty,
});

const CONTACTS = [
  { id: "C-201", name: "Guangzhou Huayi Co.", meta: "Supplier · 142 trades · 4.8★", I: Building2, verified: true },
  { id: "C-188", name: "Wei Chen", meta: "Shenzhen · sourcing agent", I: User, verified: true },
  { id: "C-176", name: "Foshan Ceramics", meta: "Supplier · 38 trades", I: Building2, verified: true },
  { id: "C-154", name: "Yiwu Trade Co.", meta: "Supplier · 12 trades", I: Building2, verified: false },
];

function NewEscrowCounterparty() {
  useRoleGuard(["buyer", "both"], "Buyer-side escrow flow. Sellers see incoming deals under /escrow/seller.");
  const t = escrowTheme;
  const navigate = useNavigate();
  const [mode, setMode] = useState<"contact" | "phone" | "email">("contact");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string>("C-201");
  const [phone, setPhone] = useState("+86 ");
  const [email, setEmail] = useState("");

  const ready =
    (mode === "contact" && picked) ||
    (mode === "phone" && phone.replace(/\D/g, "").length >= 8) ||
    (mode === "email" && /.+@.+\..+/.test(email));

  const proceed = () => {
    const sel = CONTACTS.find((c) => c.id === picked);
    const name =
      mode === "contact" ? sel?.name ?? "Counterparty" :
      mode === "phone" ? phone.trim() : email.trim();
    navigate({ to: "/escrow/new/terms", search: { party: name, mode } });
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>New escrow</p>
              <p className="text-[13px] font-bold">Counterparty</p>
            </div>
            <div className="size-9" />
          </header>

          <EscrowStepper step={1} />

          {/* Mode picker */}
          <section className="px-4 mt-4">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: `${t.navy}0d` }}>
              {([
                { k: "contact", l: "Contacts", I: User },
                { k: "phone", l: "Phone", I: Phone },
                { k: "email", l: "Email", I: Mail },
              ] as const).map((m) => (
                <button key={m.k} onClick={() => setMode(m.k)}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                  style={{ background: mode === m.k ? "#fff" : "transparent", color: mode === m.k ? t.navy : t.sub }}>
                  <m.I className="size-3.5" strokeWidth={2.4} /> {m.l}
                </button>
              ))}
            </div>
          </section>

          {/* Body */}
          {mode === "contact" && (
            <>
              <section className="px-4 mt-3">
                <div className="flex items-center gap-2 h-11 px-3 rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <Search className="size-4" strokeWidth={2.3} style={{ color: t.muted }} />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts" className="flex-1 bg-transparent outline-none text-[12.5px]" />
                </div>
              </section>
              <section className="px-4 mt-3 rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {CONTACTS.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).map((c, i, arr) => (
                  <button key={c.id} onClick={() => setPicked(c.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < arr.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: t.border, background: picked === c.id ? `${t.navy}08` : "transparent" }}>
                    <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                      <c.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{c.name}</p>
                      <p className="text-[10.5px]" style={{ color: t.muted }}>{c.meta}</p>
                    </div>
                    {c.verified && <ShieldCheck className="size-4" strokeWidth={2.4} style={{ color: t.success }} />}
                    <span className="size-4 rounded-full grid place-items-center"
                      style={{ border: `2px solid ${picked === c.id ? t.accent : t.border}`, background: picked === c.id ? t.accent : "transparent" }}>
                      {picked === c.id && <span className="size-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                ))}
              </section>
            </>
          )}

          {mode === "phone" && (
            <section className="px-4 mt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Phone number</p>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
                className="w-full h-12 px-3.5 rounded-2xl text-[14px] font-semibold tabular-nums"
                style={{ background: t.surface, border: `1px solid ${t.border}`, fontFamily: "'JetBrains Mono', monospace" }} />
              <p className="mt-2 text-[10.5px]" style={{ color: t.muted }}>We'll text an invite. They sign up free to accept.</p>
            </section>
          )}

          {mode === "email" && (
            <section className="px-4 mt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: t.muted }}>Email address</p>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="supplier@example.com"
                className="w-full h-12 px-3.5 rounded-2xl text-[13px]"
                style={{ background: t.surface, border: `1px solid ${t.border}` }} />
              <p className="mt-2 text-[10.5px]" style={{ color: t.muted }}>We'll email a secure deal link.</p>
            </section>
          )}

          {/* Invite hint */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}26` }}>
              <div className="size-8 rounded-lg grid place-items-center" style={{ background: `${t.accent}1f`, color: t.accent }}>
                <Send className="size-4" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Counterparty not on MagnetPay?</p>
                <p className="mt-0.5 text-[10.5px]" style={{ color: t.sub }}>We'll send a one-tap invite. They only see the deal you share.</p>
              </div>
            </div>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={proceed} disabled={!ready}
                className="h-13 w-full rounded-2xl text-[13.5px] font-bold text-white py-3.5 disabled:opacity-40"
                style={{ background: t.navy }}>
                Continue to deal terms
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
