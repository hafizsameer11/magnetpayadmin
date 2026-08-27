import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ChevronLeft, Ship, FileText, FileCheck2, Package, Upload, CheckCircle2, Eye, Send } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/orders/$id/docs")({
  head: () => ({ meta: [{ title: "Shipping docs — Seller" }] }),
  component: ShippingDocs,
});

type Doc = { k: string; I: any; l: string; sub: string; uploaded: boolean; file?: string };

function ShippingDocs() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([
    { k: "bl", I: Ship, l: "Bill of Lading", sub: "Required · MAEU-XXXXXX", uploaded: false },
    { k: "pl", I: Package, l: "Packing list", sub: "10 cartons · 0.12 CBM · 84 kg", uploaded: true, file: "packing-list-4831.pdf" },
    { k: "ci", I: FileText, l: "Commercial invoice", sub: "Customs value · HS codes", uploaded: true, file: "commercial-4831.pdf" },
    { k: "co", I: FileCheck2, l: "Certificate of Origin", sub: "CCPIT stamped · required for Nigeria", uploaded: false },
    { k: "sgs", I: FileCheck2, l: "SGS inspection report", sub: "Optional · speeds buyer release", uploaded: false },
  ]);

  function pick(k: string) {
    setPendingKey(k);
    inputRef.current?.click();
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !pendingKey) return;
    setDocs(docs.map((d) => d.k === pendingKey ? { ...d, uploaded: true, file: f.name } : d));
    toast.success(`${f.name} uploaded`);
    e.target.value = "";
    setPendingKey(null);
  }

  const ready = docs.filter(d => d.uploaded).length;
  const required = docs.filter(d => d.k !== "sgs").length;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller/orders/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Shipping docs</p>
              <p className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <input ref={inputRef} type="file" accept="application/pdf,image/*" hidden onChange={onFile} />

          {/* Progress */}
          <section className="px-4 mt-2">
            <div className="rounded-3xl p-4" style={{ background: t.navy, color: "#fff" }}>
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.65)" }}>Doc package</p>
                <p className="text-[10.5px] font-bold" style={{ color: t.accent }}>{ready}/{docs.length} uploaded</p>
              </div>
              <p className="mt-1 text-[20px] font-extrabold leading-tight">{ready >= required ? "Ready for buyer release" : `${required - ready} required doc${required - ready === 1 ? "" : "s"} left`}</p>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="h-full rounded-full" style={{ width: `${(ready / docs.length) * 100}%`, background: t.accent }} />
              </div>
            </div>
          </section>

          {/* Doc list */}
          <section className="px-4 mt-3 space-y-2">
            {docs.map((d) => (
              <div key={d.k} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="size-10 rounded-xl grid place-items-center shrink-0"
                  style={{ background: `${d.uploaded ? t.success : t.muted}15`, color: d.uploaded ? t.success : t.muted }}>
                  {d.uploaded ? <CheckCircle2 className="size-5" strokeWidth={2.4} /> : <d.I className="size-5" strokeWidth={2.4} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold">{d.l}</p>
                  <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{d.uploaded && d.file ? d.file : d.sub}</p>
                </div>
                {d.uploaded ? (
                  <button onClick={() => toast(`Previewing ${d.file}`)} className="text-[10.5px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: t.bg, color: t.navy }}>
                    <Eye className="size-3" strokeWidth={2.6} /> View
                  </button>
                ) : (
                  <button onClick={() => pick(d.k)} className="text-[10.5px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white" style={{ background: t.accent }}>
                    <Upload className="size-3" strokeWidth={2.6} /> Upload
                  </button>
                )}
              </div>
            ))}
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10px] leading-relaxed" style={{ color: t.muted }}>
              Buyer auto-receives a notification each time you upload a doc. Once Bill of Lading and Certificate of Origin are uploaded, the buyer can release escrow on delivery confirmation.
            </p>
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 mt-6">
            <button onClick={() => { toast.success("Doc package sent to buyer"); navigate({ to: "/seller/orders/$id", params: { id } }); }}
              disabled={ready < required}
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5 disabled:opacity-50"
              style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
              <Send className="size-4" strokeWidth={2.6} /> {ready >= required ? "Send doc package to buyer" : "Upload required docs to send"}
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
