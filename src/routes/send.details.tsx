import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { useState } from "react";
import { ChevronLeft, Building2, Smartphone, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/send/details")({
  head: () => ({ meta: [{ title: "Send · recipient details — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    rid: String(s.rid ?? "new"),
    name: String(s.name ?? "New recipient"),
    channel: (String(s.channel ?? "bank") as Channel),
  }),
  component: SendDetails,
});

type Channel = "bank" | "alipay" | "wechat" | "unionpay" | "wire_usd";

const CHANNELS: { id: Channel; label: string; I: any; tint: string; sub: string }[] = [
  { id: "bank", label: "Bank transfer", I: Building2, tint: "#0E3B2E", sub: "ICBC, BOC, CMB, ABC…" },
  { id: "alipay", label: "Alipay", I: Smartphone, tint: "#1677FF", sub: "Send to Alipay ID" },
  { id: "wechat", label: "WeChat Pay", I: Smartphone, tint: "#07C160", sub: "Send via WeChat ID" },
  { id: "unionpay", label: "UnionPay", I: CreditCard, tint: "#C2410C", sub: "Card 62•• bank-issued" },
  { id: "wire_usd", label: "USD wire", I: CreditCard, tint: "#1E40AF", sub: "SWIFT · ABA / IBAN" },
];

function SendDetails() {
  useRoleGuard(["buyer", "both"], "Sending CNY isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C", success = "#0F766E";
  const navigate = useNavigate();
  const initial = useSearch({ from: "/send/details" });
  const [channel, setChannel] = useState<Channel>(initial.channel);
  const [name, setName] = useState(initial.rid === "new" ? "" : initial.name);
  const [v1, setV1] = useState(""); // account / id
  const [v2, setV2] = useState(""); // bank / phone
  const [v3, setV3] = useState(""); // branch / -
  const [save, setSave] = useState(true);

  const labels: Record<Channel, { a: string; b: string; c?: string; ap: string; bp: string; cp?: string }> = {
    bank:     { a: "Account number", b: "Bank name",     c: "Branch (optional)", ap: "6228 4800 1234 5678", bp: "ICBC · 中国工商银行",       cp: "Shenzhen, Futian" },
    alipay:   { a: "Alipay ID",      b: "Phone (verify)",                         ap: "wei.chen@alipay.com", bp: "+86 138 0013 8000" },
    wechat:   { a: "WeChat ID",      b: "Phone (verify)",                         ap: "weichen_88",          bp: "+86 138 0013 8000" },
    unionpay: { a: "Card number",    b: "Issuing bank",                           ap: "6228 4800 1234 5678", bp: "Bank of China" },
    wire_usd: { a: "Account / IBAN", b: "SWIFT / BIC",   c: "Bank name & address", ap: "DE89 3704 0044 0532 0130 00", bp: "ICBCCNBJ", cp: "Apex Trading · Delaware, USA" },
  };
  const L = labels[channel];
  const ready = name.length >= 2 && v1.length >= 4 && v2.length >= 3;

  const next = () =>
    navigate({ to: "/send/amount", search: { rid: "new", name, channel } });

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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Recipient</p>
              <p className="text-[13px] font-bold">Add details</p>
            </div>
            <div className="size-9" />
          </header>

          {/* Channel switcher */}
          <section className="px-4 mt-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Payout channel</p>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((c) => {
                const active = c.id === channel;
                return (
                  <button key={c.id} onClick={() => setChannel(c.id)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl text-left active:scale-[0.98] transition"
                    style={{ background: active ? c.tint : surface, border: `1px solid ${active ? c.tint : border}`, color: active ? "#fff" : ink }}>
                    <div className="size-9 rounded-xl grid place-items-center" style={{ background: active ? "rgba(255,255,255,0.18)" : `${c.tint}14`, color: active ? "#fff" : c.tint }}>
                      <c.I className="size-4" strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate">{c.label}</p>
                      <p className="text-[10px] truncate" style={{ color: active ? "rgba(255,255,255,0.7)" : muted }}>{c.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Fields */}
          <section className="px-4 mt-5 space-y-3">
            <Field label="Recipient name (as on account)" value={name} onChange={setName} placeholder="Wei Chen / 公司全称" />
            <Field label={L.a} value={v1} onChange={setV1} placeholder={L.ap} mono />
            <Field label={L.b} value={v2} onChange={setV2} placeholder={L.bp} />
            {L.c && <Field label={L.c} value={v3} onChange={setV3} placeholder={L.cp ?? ""} />}
          </section>

          <section className="px-4 mt-4">
            <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: `${success}10`, border: `1px solid ${success}26` }}>
              <ShieldCheck className="size-4 shrink-0 mt-0.5" style={{ color: success }} strokeWidth={2.4} />
              <p className="text-[11px]" style={{ color: ink }}>
                We verify the recipient name with the bank before releasing funds. Name mismatch = held for your approval.
              </p>
            </div>

            <button onClick={() => setSave((s) => !s)} className="mt-3 w-full flex items-center gap-2.5 p-3 rounded-2xl"
              style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-5 rounded grid place-items-center" style={{ background: save ? navy : "transparent", border: `1.5px solid ${save ? navy : border}` }}>
                {save && <CheckCircle2 className="size-4 text-white" strokeWidth={2.6} />}
              </div>
              <p className="text-[12px] font-semibold">Save recipient for next time</p>
            </button>
          </section>

          <section className="px-4 mt-5">
            <button onClick={next} disabled={!ready}
              className="w-full h-13 py-3.5 rounded-2xl text-[14px] font-bold text-white active:scale-[0.99] transition disabled:opacity-40"
              style={{ background: navy }}>
              Continue to amount
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

const Field = ({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; mono?: boolean }) => (
  <div>
    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#8A8472" }}>{label}</p>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-12 px-3.5 rounded-2xl text-[13px] outline-none"
      style={{ background: "#FFFFFF", border: `1px solid #E7DFCE`, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }} />
  </div>
);
