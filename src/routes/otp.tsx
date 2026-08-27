import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, RefreshCw, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify code — MagnetPay" }] }),
  component: Otp,
});

function Otp() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472";
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(24);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const setAt = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    txt.split("").forEach((c, i) => (next[i] = c));
    setDigits(next);
    refs.current[Math.min(txt.length, 5)]?.focus();
  };

  const filled = digits.every((d) => d);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/signup" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 2 of 8 · Account</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 2 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-4">
            <h1 className="text-[26px] leading-[1.05] font-bold tracking-tight">Enter the<br />6-digit code</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              Sent to <span className="font-bold" style={{ color: ink }}>+234 812 345 6789</span>.{" "}
              <Link to="/signup" className="font-bold underline" style={{ color: navy }}>Change</Link>
            </p>
          </section>

          <section className="px-4 mt-8">
            <div className="flex justify-between gap-2" onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setAt(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  className="flex-1 h-14 min-w-0 rounded-2xl text-center text-[22px] font-bold outline-none"
                  style={{
                    background: surface,
                    border: `1.5px solid ${d ? navy : border}`,
                    color: ink,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-[11.5px]" style={{ color: sub }}>
                {seconds > 0 ? (
                  <>Resend code in <span className="font-bold" style={{ color: ink, fontFamily: "'JetBrains Mono', monospace" }}>{mm}:{ss}</span></>
                ) : "Didn't get it?"}
              </p>
              <button
                disabled={seconds > 0}
                onClick={() => setSeconds(30)}
                className="flex items-center gap-1.5 text-[11.5px] font-bold disabled:opacity-40"
                style={{ color: seconds > 0 ? muted : navy }}>
                <RefreshCw className="size-3.5" strokeWidth={2.6} /> Resend
              </button>
            </div>

            <button className="mt-5 w-full h-11 rounded-2xl text-[12px] font-bold" style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
              Get code on WhatsApp instead
            </button>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!filled}
              onClick={() => navigate({ to: "/passcode" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Verify <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
