import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ArrowRight, Camera, ScanLine, Check, IdCard, Sparkles, Upload } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/kyc2")({
  head: () => ({ meta: [{ title: "ID & selfie — MagnetPay" }] }),
  component: Kyc2,
});

const ID_TYPES = [
  { k: "Driver's Licence", sub: "Front & back" },
  { k: "International Passport", sub: "Photo page" },
  { k: "Voter's Card", sub: "Front & back" },
];

function Kyc2() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    teal = "#0F766E", accent = "#C2410C";
  const navigate = useNavigate();
  const [pick, setPick] = useState<string>(ID_TYPES[1].k);
  const [idCaptured, setIdCaptured] = useState(false);
  const [selfie, setSelfie] = useState<"idle" | "scanning" | "done">("idle");
  const ready = idCaptured && selfie === "done";

  useEffect(() => {
    if (selfie !== "scanning") return;
    const t = setTimeout(() => setSelfie("done"), 1800);
    return () => clearTimeout(t);
  }, [selfie]);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/kyc1" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 6 of 8 · Tier 2 KYC</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 6 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}26` }}>Tier 2</span>
              <span className="text-[11px]" style={{ color: muted }}>Unlocks ₦20M / day + cross-border</span>
            </div>
            <h1 className="mt-3 text-[24px] leading-[1.05] font-bold tracking-tight">Photo ID + selfie</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              Choose an ID and we'll match it to a quick liveness check.
            </p>
          </section>

          <section className="px-4 mt-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>1 · Choose document</p>
            <div className="space-y-2">
              {ID_TYPES.map((t) => {
                const selected = pick === t.k;
                return (
                  <button key={t.k} onClick={() => { setPick(t.k); setIdCaptured(false); }}
                    className="w-full p-3 rounded-2xl flex items-center gap-3 text-left transition active:scale-[0.99]"
                    style={{
                      background: selected ? `${navy}08` : surface,
                      border: `1.5px solid ${selected ? navy : border}`,
                    }}>
                    <div className="size-9 rounded-xl grid place-items-center"
                      style={{ background: selected ? navy : `${ink}06`, color: selected ? "#fff" : sub }}>
                      <IdCard className="size-4" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold">{t.k}</p>
                      <p className="text-[10.5px]" style={{ color: muted }}>{t.sub}</p>
                    </div>
                    <span className="size-5 rounded-full grid place-items-center"
                      style={{ background: selected ? navy : "transparent", border: selected ? "none" : `1.5px solid ${border}` }}>
                      {selected && <Check className="size-3" strokeWidth={3.2} style={{ color: "#fff" }} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>2 · Capture</p>
            <div className="grid grid-cols-2 gap-3">
              {/* ID */}
              <button onClick={() => setIdCaptured(true)}
                className="aspect-[4/5] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition"
                style={{
                  background: idCaptured ? navy : surface,
                  border: idCaptured ? "none" : `1.5px dashed ${navy}`,
                  color: idCaptured ? "#fff" : ink,
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">ID photo</span>
                  {idCaptured && <Check className="size-4" strokeWidth={3} style={{ color: "#A7F3D0" }} />}
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full aspect-[1.6] rounded-xl border-2 border-dashed grid place-items-center"
                    style={{ borderColor: idCaptured ? "rgba(255,255,255,0.3)" : navy, color: idCaptured ? "#fff" : navy }}>
                    {idCaptured ? <IdCard className="size-7 opacity-60" strokeWidth={2} /> : <Upload className="size-6" strokeWidth={2} />}
                  </div>
                </div>
                <p className="text-[10.5px] font-bold" style={{ color: idCaptured ? "#fff" : navy }}>
                  {idCaptured ? "Captured · Retake" : "Tap to capture"}
                </p>
              </button>

              {/* Selfie */}
              <button
                disabled={selfie === "scanning"}
                onClick={() => setSelfie(selfie === "done" ? "scanning" : "scanning")}
                className="aspect-[4/5] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition"
                style={{
                  background: selfie === "done" ? navy : surface,
                  border: selfie === "done" ? "none" : `1.5px dashed ${navy}`,
                  color: selfie === "done" ? "#fff" : ink,
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Selfie</span>
                  {selfie === "done" ? <Check className="size-4" strokeWidth={3} style={{ color: "#A7F3D0" }} />
                    : <Sparkles className="size-3.5" style={{ color: teal }} strokeWidth={2.4} />}
                </div>
                <div className="flex items-center justify-center">
                  <div className="size-20 rounded-full border-2 grid place-items-center"
                    style={{
                      borderStyle: selfie === "scanning" ? "solid" : "dashed",
                      borderColor: selfie === "done" ? "rgba(255,255,255,0.4)" : navy,
                      color: selfie === "done" ? "#fff" : navy,
                      animation: selfie === "scanning" ? "spin 1.4s linear infinite" : undefined,
                    }}>
                    <ScanLine className="size-7" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-[10.5px] font-bold flex items-center gap-1.5" style={{ color: selfie === "done" ? "#fff" : navy }}>
                  <Camera className="size-3.5" strokeWidth={2.6} />
                  {selfie === "done" ? "Liveness passed" : selfie === "scanning" ? "Scanning…" : "Start liveness"}
                </p>
              </button>
            </div>
            <p className="mt-3 text-[10.5px] text-center" style={{ color: muted }}>
              Good lighting · no hat/glasses · face the camera straight on
            </p>
          </section>

          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!ready}
              onClick={() => navigate({ to: "/kyc-status" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Submit for review <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
