import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Upload, FileText, Image as ImageIcon, X, CheckCircle2, Send } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";


export const Route = createFileRoute("/escrow/seller/$id/evidence/$ms")({
  head: () => ({ meta: [{ title: "Upload evidence — MagnetPay" }] }),
  component: EvidenceScreen,
});

const REQUIRED = [
  { k: "bol", l: "Bill of Lading", req: true },
  { k: "coo", l: "Certificate of Origin", req: true },
  { k: "photos", l: "Packing photos (≥4)", req: true },
  { k: "inv", l: "Commercial Invoice (revised)", req: false },
];

function EvidenceScreen() {
  const t = escrowTheme;
  const { id, ms } = useParams({ from: "/escrow/seller/$id/evidence/$ms" });
  useRoleGuard(["seller", "both"], "Evidence upload is for suppliers only");
  const navigate = useNavigate();
  const [files, setFiles] = useState([
    { name: "BL-2210-MSK.pdf", size: "1.2 MB", kind: "doc" as const, tag: "bol" },
    { name: "carton-01.jpg", size: "642 KB", kind: "img" as const, tag: "photos" },
    { name: "carton-02.jpg", size: "598 KB", kind: "img" as const, tag: "photos" },
  ]);
  const [note, setNote] = useState("All 200 units packed in 12 cartons. BL issued by Maersk on Mar 18. Container MSCU-77641-2.");

  const remove = (n: string) => setFiles((f) => f.filter((x) => x.name !== n));
  const has = (k: string) => files.some((f) => f.tag === k);
  const okCount = REQUIRED.filter((r) => r.req && has(r.k)).length;
  const total = REQUIRED.filter((r) => r.req).length;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-28" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/escrow/seller/$id" params={{ id }} className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Milestone {ms} evidence</p>
              <p className="text-[13px] font-bold">#{id}</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Required documents</p>
                <p className="text-[11px] font-bold tabular-nums" style={{ color: okCount === total ? t.success : t.warn, fontFamily: "'JetBrains Mono', monospace" }}>{okCount}/{total}</p>
              </div>
              <div className="space-y-1.5">
                {REQUIRED.map((r) => (
                  <div key={r.k} className="flex items-center justify-between text-[12px]">
                    <p>{r.l} {!r.req && <span className="text-[10px]" style={{ color: t.muted }}>· optional</span>}</p>
                    {has(r.k) ? <CheckCircle2 className="size-4" strokeWidth={2.6} style={{ color: t.success }} />
                              : <span className="size-2 rounded-full" style={{ background: t.warn }} />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 mt-4">
            <button onClick={() => setFiles((f) => [...f, { name: `doc-${Date.now() % 999}.pdf`, size: "420 KB", kind: "doc" as const, tag: "coo" }])}
              className="w-full rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border-dashed border-2"
              style={{ background: `${t.accent}08`, borderColor: `${t.accent}50`, color: t.accent }}>
              <Upload className="size-5" strokeWidth={2.4} />
              <p className="text-[12.5px] font-bold">Tap to upload files</p>
              <p className="text-[10px]" style={{ color: t.sub }}>PDF, JPG, PNG · up to 25 MB each</p>
            </button>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Attached ({files.length})</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {files.map((f, i, a) => (
                <div key={f.name} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <div className="size-9 rounded-lg grid place-items-center" style={{ background: `${t.navy}10`, color: t.navy }}>
                    {f.kind === "img" ? <ImageIcon className="size-4" strokeWidth={2.3} /> : <FileText className="size-4" strokeWidth={2.3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate">{f.name}</p>
                    <p className="text-[10px]" style={{ color: t.muted }}>{f.size} · tagged {f.tag}</p>
                  </div>
                  <button onClick={() => remove(f.name)} className="size-7 grid place-items-center rounded-full" style={{ color: t.muted }}>
                    <X className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Note to buyer & inspector</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
              className="w-full p-3 rounded-2xl text-[12px] outline-none resize-none"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.ink }} />
          </section>

          <section className="sticky bottom-4 left-0 right-0 px-4 pointer-events-none mt-6">
            <div className="max-w-[420px] mx-auto pointer-events-auto">
              <button onClick={() => navigate({ to: "/escrow/seller/$id/request/$ms", params: { id, ms } })}
                className="h-13 w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold text-white py-3.5"
                style={{ background: t.accent, boxShadow: `0 12px 28px -10px ${t.accent}80` }}>
                <Send className="size-4" strokeWidth={2.6} /> Submit & request release
              </button>
            </div>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
