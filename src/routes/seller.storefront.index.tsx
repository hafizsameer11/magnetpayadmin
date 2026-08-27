import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Eye, ImagePlus, Camera, ChevronRight, Award, FileText, Star, Plus } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { SellerNav } from "@/components/magnetpay/SellerNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/storefront/")({
  head: () => ({ meta: [{ title: "Storefront editor — Seller" }] }),
  component: StorefrontEditor,
});

function StorefrontEditor() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [name, setName] = useState("Hangzhou Magnetics Co.");
  const [tagline, setTagline] = useState("OEM pumps, magnets & bearings · 12 yrs export");
  const [about, setAbout] = useState("");
  const bannerRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState<string | null>(null);
  function pick(ref: React.RefObject<HTMLInputElement | null>) { ref.current?.click(); }
  function onBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBanner(URL.createObjectURL(f)); toast.success("Banner updated");
  }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={t.navy} bottomNav={<SellerNav active="storefront" />}>
        <div className="relative min-h-full pb-32" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/seller" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.muted }}>Seller</p>
              <p className="text-[13px] font-bold">Storefront editor</p>
            </div>
            <Link to="/seller/storefront/preview" className="size-9 grid place-items-center rounded-full text-white" style={{ background: t.navy }}>
              <Eye className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          {/* Banner */}
          <section className="px-4 mt-2">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Banner</p>
            <input ref={bannerRef} type="file" accept="image/*" hidden onChange={onBanner} />
            <button onClick={() => pick(bannerRef)} className="w-full aspect-[16/7] rounded-2xl relative overflow-hidden grid place-items-center"
              style={{ background: banner ? `url(${banner}) center/cover` : `linear-gradient(135deg, ${t.navy}, ${t.navy}cc)`, color: "#fff" }}>
              {!banner && <ImagePlus className="size-6" strokeWidth={2} />}
              <p className="absolute bottom-2 text-[10.5px] font-bold" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>{banner ? "Tap to replace" : "Tap to upload · 1600×700"}</p>
            </button>
          </section>

          {/* Logo + identity */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Identity</p>
            <div className="rounded-2xl p-3 flex items-start gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={() => toast.success("Logo updated")} />
              <button onClick={() => pick(logoRef)} className="size-16 rounded-2xl grid place-items-center shrink-0 relative" style={{ background: t.navy, color: "#fff" }}>
                <span className="text-[16px] font-extrabold">HM</span>
                <span className="absolute -bottom-1 -right-1 size-5 rounded-full grid place-items-center" style={{ background: t.accent, color: "#fff", border: `2px solid ${t.surface}` }}>
                  <Camera className="size-2.5" strokeWidth={2.6} />
                </span>
              </button>
              <div className="flex-1 space-y-2 min-w-0">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop name"
                  className="w-full bg-transparent text-[13px] font-extrabold outline-none border-b pb-1" style={{ borderColor: t.border }} />
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Tagline"
                  className="w-full bg-transparent text-[11px] outline-none" style={{ color: t.sub }} />
              </div>
            </div>
          </section>

          {/* Featured */}
          <section className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: t.muted }}>Featured products</p>
              <button onClick={() => toast("Featured products picker coming soon")} className="text-[10.5px] font-bold flex items-center gap-0.5" style={{ color: t.accent }}>
                <Plus className="size-3" strokeWidth={2.8} /> Pick
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { id: "PB-A2", n: "Pump body PB-A2", p: "from ¥212" },
                { id: "CS-7", n: "Coil set CS-7", p: "from ¥248" },
                { id: "B-22", n: "Bearing B-22", p: "from ¥24" },
              ].map((p, i, a) => (
                <Link key={p.id} to="/seller/products/$id/edit" params={{ id: p.id }} className={`px-3.5 py-2.5 flex items-center gap-3 ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <span className="text-[9.5px] font-bold w-5 text-center tabular-nums" style={{ color: t.muted }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{p.n}</p>
                    <p className="text-[10.5px] tabular-nums" style={{ color: t.muted, fontFamily: "'JetBrains Mono', monospace" }}>{p.id} · {p.p}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                </Link>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Shop categories</p>
            <div className="flex flex-wrap gap-1.5">
              {["Pumps", "Bearings", "Magnets", "Coils", "Shafts", "+ Add"].map((c, i, a) => (
                <button key={c} onClick={() => toast(i === a.length - 1 ? "Add a category" : `${c} selected`)} className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: i === a.length - 1 ? t.surface : `${t.navy}10`, color: i === a.length - 1 ? t.accent : t.navy, border: `1px dashed ${i === a.length - 1 ? t.border : "transparent"}` }}>{c}</button>
              ))}
            </div>
          </section>

          {/* About / certs */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>About & trust</p>
            <div className="rounded-2xl p-3 space-y-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3}
                placeholder="Tell buyers about your factory, capacity, history…"
                className="w-full bg-transparent text-[12px] outline-none resize-none" />
              <div className="pt-2 grid grid-cols-2 gap-2" style={{ borderTop: `1px dashed ${t.border}` }}>
                <SubRow I={Award} l="Certifications" s="ISO 9001 · CE · 3 more" />
                <SubRow I={Camera} l="Factory photos" s="8 uploaded" />
              </div>
            </div>
          </section>

          {/* Policies */}
          <section className="px-4 mt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: t.muted }}>Shop policies</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              {[
                { l: "Returns & refunds", s: "14-day defect return · buyer-paid freight" },
                { l: "Default lead time", s: "5–10 days production" },
                { l: "Default MOQ", s: "50 units per order" },
              ].map((r, i, a) => (
                <button key={r.l} onClick={() => toast(`Edit ${r.l.toLowerCase()}`)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left ${i < a.length - 1 ? "border-b" : ""}`} style={{ borderColor: t.border }}>
                  <FileText className="size-3.5 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold">{r.l}</p>
                    <p className="text-[10.5px] truncate" style={{ color: t.muted }}>{r.s}</p>
                  </div>
                  <ChevronRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
                </button>
              ))}
            </div>
          </section>

          {/* Preview CTA */}
          <section className="px-4 mt-5">
            <Link to="/seller/storefront/preview"
              className="w-full rounded-2xl flex items-center justify-center gap-2 text-[13.5px] font-bold py-3.5"
              style={{ background: t.navy, color: "#fff" }}>
              <Eye className="size-4" strokeWidth={2.6} /> Preview storefront
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}

function SubRow({ I, l, s }: { I: any; l: string; s: string }) {
  const t = escrowTheme;
  return (
    <button onClick={() => toast(`Manage ${l.toLowerCase()}`)} className="rounded-xl p-2 flex items-center gap-2 text-left" style={{ background: t.bg }}>
      <I className="size-3.5 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold leading-tight">{l}</p>
        <p className="text-[9.5px] truncate" style={{ color: t.muted }}>{s}</p>
      </div>
    </button>
  );
}
