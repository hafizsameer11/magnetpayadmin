import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ArrowRight, Globe2, ChevronLeft } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getLocale, setLocale, LOCALES, type V8Locale } from "@/lib/v8-locale";
import { markStep } from "@/lib/v8-onboarding";

export const Route = createFileRoute("/locale")({
  head: () => ({ meta: [{ title: "Language — MagnetPay" }] }),
  component: LocalePicker,
});

function LocalePicker() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();
  const [picked, setPicked] = useState<V8Locale>("en");

  useEffect(() => { setPicked(getLocale()); markStep("/locale"); }, []);

  const confirm = () => { setLocale(picked); navigate({ to: "/welcome" }); };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@500;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/splash" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 1 of 3</p>
              <div className="mt-1 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 1 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-5">
            <div className="size-12 rounded-2xl grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
              <Globe2 className="size-6" strokeWidth={2.2} />
            </div>
            <h1 className="mt-3 text-[26px] leading-[1.05] font-bold tracking-tight">
              Choose your<br />language
            </h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              Pick the language you read most easily. You can switch any time in Settings · 你随时可以在设置中更改.
            </p>
          </section>

          <section className="px-4 mt-6 space-y-3">
            {LOCALES.map((l) => {
              const selected = picked === l.code;
              return (
                <button key={l.code} onClick={() => setPicked(l.code)}
                  className="w-full text-left rounded-2xl p-4 transition active:scale-[0.99] flex items-center gap-3"
                  style={{
                    background: selected ? navy : surface,
                    border: selected ? `1.5px solid ${navy}` : `1px solid ${border}`,
                    color: selected ? "#fff" : ink,
                    boxShadow: selected ? `0 18px 36px -16px ${navy}90` : "none",
                  }}>
                  <span className="size-12 rounded-2xl grid place-items-center text-[22px] shrink-0"
                    style={{ background: selected ? "rgba(255,255,255,0.14)" : `${navy}10` }}>
                    {l.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold leading-tight"
                       style={{ fontFamily: l.code === "zh" ? "'Noto Sans SC', 'Inter', sans-serif" : undefined }}>
                      {l.native}
                    </p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider mt-0.5"
                       style={{ color: selected ? "rgba(255,255,255,0.7)" : muted }}>
                      {l.hint}
                    </p>
                  </div>
                  <span className="size-6 rounded-full grid place-items-center shrink-0"
                    style={{ background: selected ? "#fff" : "transparent", border: selected ? "none" : `1.5px solid ${border}` }}>
                    {selected && <Check className="size-3.5" strokeWidth={3.2} style={{ color: navy }} />}
                  </span>
                </button>
              );
            })}
          </section>

          <p className="px-4 mt-5 text-center text-[10.5px]" style={{ color: muted }}>
            Currency, dates and number formats follow your region automatically.
          </p>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6"
               style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button onClick={confirm}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition"
              style={{ background: navy, color: "#fff" }}>
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
