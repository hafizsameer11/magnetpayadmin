import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ArrowRight, Upload, Check, FileText, Plus, X } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/kyb-docs")({
  head: () => ({ meta: [{ title: "Business documents — MagnetPay" }] }),
  component: KybDocs,
});

type Doc = { k: string; required: boolean; file: string | null; size: string; hint?: string };
const INITIAL: Doc[] = [
  { k: "Business License (营业执照)", required: true, file: null, size: "", hint: "Color scan, all 18 USCC digits visible" },
  { k: "Legal Rep. ID card (身份证 — front & back)", required: true, file: null, size: "" },
  { k: "Tax Registration Certificate (税务登记证)", required: true, file: null, size: "" },
  { k: "Bank Account Opening Permit (开户许可证)", required: true, file: null, size: "" },
  { k: "Product / brand authorization", required: false, file: null, size: "", hint: "Required for branded goods (Apple, Nike, etc.)" },
  { k: "Export license (出口许可证)", required: false, file: null, size: "", hint: "Only for restricted categories" },
];

const SAMPLE = (k: string) =>
  k.startsWith("Legal") ? { f: "legal-rep-id.jpg", s: `${(Math.random() * 1.5 + 0.4).toFixed(1)} MB` }
  : { f: `${k.split(" ")[0].toLowerCase()}.pdf`, s: `${(Math.random() * 2 + 0.3).toFixed(1)} MB` };

function KybDocs() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    teal = "#0F766E", accent = "#C2410C", warn = "#B45309";
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>(INITIAL);
  type Dir = { n: string; r: string; v: boolean };
  const [directors, setDirectors] = useState<Dir[]>([
    { n: "Wang Wei 王伟", r: "Legal rep · 70%", v: true },
  ]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPct, setNewPct] = useState("");

  const upload = (i: number) => {
    const s = SAMPLE(docs[i].k);
    setDocs((arr) => arr.map((d, idx) => idx === i ? { ...d, file: s.f, size: s.s } : d));
  };
  const remove = (i: number) => setDocs((arr) => arr.map((d, idx) => idx === i ? { ...d, file: null, size: "" } : d));

  const uploaded = docs.filter((d) => d.required && d.file).length;
  const required = docs.filter((d) => d.required).length;
  const allRequired = uploaded === required;

  const addDirector = () => {
    if (!newName.trim() || !newPct) return;
    setDirectors([...directors, { n: newName.trim(), r: `Director · ${newPct}%`, v: false }]);
    setNewName(""); setNewPct(""); setAdding(false);
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/kyb" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 2 of 2 · Seller verification (KYB)</p>
              <div className="mt-1 flex gap-1">
                <span className="h-1 flex-1 rounded-full" style={{ background: accent }} />
                <span className="h-1 flex-1 rounded-full" style={{ background: accent }} />
              </div>
            </div>
            <button onClick={() => navigate({ to: "/bank" })} className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Skip</button>
          </header>

          <section className="px-4 mt-4">
            <h1 className="text-[24px] leading-[1.05] font-bold tracking-tight">Upload documents</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              PDF, JPG or PNG up to 10 MB each. We accept clear photos.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
              style={{
                background: allRequired ? `${teal}14` : `${warn}14`,
                color: allRequired ? teal : warn,
                border: `1px solid ${allRequired ? teal : warn}26`,
              }}>
              <span className="text-[10.5px] font-bold uppercase tracking-wider">
                {uploaded} of {required} required uploaded
              </span>
            </div>
          </section>

          <section className="px-4 mt-5 space-y-2.5">
            {docs.map((d, i) => (
              <div key={d.k} className="p-3 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl grid place-items-center shrink-0"
                    style={{
                      background: d.file ? `${teal}14` : `${ink}06`,
                      color: d.file ? teal : muted,
                    }}>
                    {d.file ? <Check className="size-4" strokeWidth={3} /> : <Upload className="size-4" strokeWidth={2.4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold leading-tight">
                      {d.k}
                      {d.required && <span className="ml-1 text-[10px]" style={{ color: accent }}>*</span>}
                    </p>
                    {d.file ? (
                      <p className="text-[10.5px] mt-0.5 truncate flex items-center gap-1" style={{ color: muted }}>
                        <FileText className="size-3" strokeWidth={2.4} /> {d.file} · {d.size}
                      </p>
                    ) : (
                      <p className="text-[10.5px] mt-0.5" style={{ color: muted }}>{d.hint ?? "Not uploaded yet"}</p>
                    )}
                  </div>
                  {d.file ? (
                    <button onClick={() => remove(i)}
                      className="size-7 rounded-lg grid place-items-center active:scale-95" style={{ background: `${ink}06`, color: sub }}>
                      <X className="size-3.5" strokeWidth={2.6} />
                    </button>
                  ) : (
                    <button onClick={() => upload(i)}
                      className="px-3 h-8 rounded-lg text-[11px] font-bold active:scale-95"
                      style={{ background: navy, color: "#fff" }}>
                      Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Beneficial owners ≥ 25% 实际受益人</p>
              <button onClick={() => setAdding((a) => !a)} className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: navy }}>
                <Plus className="size-3.5" strokeWidth={2.8} /> Add
              </button>
            </div>
            <div className="rounded-2xl divide-y" style={{ background: surface, border: `1px solid ${border}` }}>
              {directors.map((d, idx) => (
                <div key={idx} className="px-3 py-2.5 flex items-center gap-3" style={{ borderColor: border }}>
                  <div className="size-9 rounded-full grid place-items-center text-[11px] font-bold"
                    style={{ background: navy, color: "#fff" }}>
                    {d.n.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12.5px] font-bold leading-tight">{d.n}</p>
                    <p className="text-[10.5px]" style={{ color: muted }}>{d.r}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{ background: d.v ? `${teal}14` : `${warn}14`, color: d.v ? teal : warn }}>
                    {d.v ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
              {adding && (
                <div className="p-3 space-y-2" style={{ borderColor: border }}>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name"
                    className="w-full h-9 rounded-lg px-3 text-[12px] outline-none"
                    style={{ background: bg, border: `1px solid ${border}`, color: ink }} />
                  <div className="flex gap-2">
                    <input value={newPct} onChange={(e) => setNewPct(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="Shareholding %" inputMode="numeric"
                      className="flex-1 h-9 rounded-lg px-3 text-[12px] outline-none"
                      style={{ background: bg, border: `1px solid ${border}`, color: ink }} />
                    <button onClick={addDirector} disabled={!newName.trim() || !newPct}
                      className="px-3 h-9 rounded-lg text-[11px] font-bold disabled:opacity-40"
                      style={{ background: navy, color: "#fff" }}>Save</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!allRequired}
              onClick={() => navigate({ to: "/bank" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Submit & continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
