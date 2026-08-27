import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Fingerprint, Lock, Delete, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getRole, ROLE_META } from "@/lib/v8-role";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — MagnetPay" }] }),
  component: Login,
});

function Login() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C", danger = "#B91C1C";
  const navigate = useNavigate();

  const [role, setRoleState] = useState<"buyer" | "seller" | "both">("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const meta = ROLE_META[role];
  const tint = role === "seller" ? accent : navy;

  const [phone, setPhone] = useState("812 345 6789");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const press = (k: string) => {
    setErr("");
    if (k === "del") return setCode((c) => c.slice(0, -1));
    if (code.length >= 6) return;
    const next = code + k;
    setCode(next);
    if (next.length === 6) {
      setTimeout(() => {
        if (next === "000000") {
          setErr("Wrong passcode. Try again.");
          setCode("");
        } else {
          try { window.localStorage.setItem("v8.onboardingDone", "1"); } catch {}
          navigate({ to: "/home" });
        }
      }, 200);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-6" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/splash" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Welcome back</p>
          </header>

          <section className="px-4 mt-3">
            <div className="size-11 rounded-2xl grid place-items-center" style={{ background: `${tint}14`, color: tint }}>
              <Lock className="size-5" strokeWidth={2.2} />
            </div>
            <h1 className="mt-3 text-[24px] leading-[1.05] font-bold tracking-tight">Log in to MagnetPay</h1>
            <p className="mt-1.5 text-[12px]" style={{ color: sub }}>
              Enter your phone and 6-digit passcode to continue.
            </p>
          </section>

          <section className="px-4 mt-4">
            <label className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: muted }}>Phone</label>
            <div className="mt-2 flex gap-2">
              <div className="flex items-center gap-1.5 px-3 h-12 rounded-2xl text-[12.5px] font-bold"
                style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                <span className="text-base">{meta.country.flag}</span> {meta.country.dial}
              </div>
              <div className="flex-1 h-12 rounded-2xl px-4 flex items-center" style={{ background: surface, border: `1.5px solid ${border}` }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent outline-none text-[15px] font-bold tracking-wide"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}
                />
              </div>
            </div>
          </section>

          <section className="px-4 mt-5">
            <label className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: muted }}>Passcode</label>
            <div className="mt-3 flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="size-3.5 rounded-full transition"
                  style={{
                    background: i < code.length ? (err ? danger : tint) : "transparent",
                    border: `1.5px solid ${i < code.length ? (err ? danger : tint) : border}`,
                  }} />
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] font-bold h-4" style={{ color: err ? danger : muted }}>
              {err || "\u00A0"}
            </p>
          </section>

          <section className="px-4 mt-2">
            <div className="grid grid-cols-3 gap-2.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "del"].map((k, i) => {
                if (k === "bio")
                  return (
                    <button key={i} onClick={() => navigate({ to: "/home" })} className="h-14 rounded-2xl grid place-items-center active:bg-black/5">
                      <Fingerprint className="size-5" strokeWidth={2.4} style={{ color: tint }} />
                    </button>
                  );
                if (k === "del")
                  return (
                    <button key={i} onClick={() => press("del")} className="h-14 rounded-2xl grid place-items-center active:bg-black/5">
                      <Delete className="size-5" strokeWidth={2.4} style={{ color: sub }} />
                    </button>
                  );
                return (
                  <button key={i} onClick={() => press(k)} className="h-14 rounded-2xl text-[22px] font-bold active:scale-95 transition"
                    style={{ background: surface, border: `1px solid ${border}`, color: ink, fontFamily: "'JetBrains Mono', monospace" }}>
                    {k}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-4 flex items-center justify-between">
            <Link to="/otp" className="text-[12px] font-bold" style={{ color: tint }}>
              Forgot passcode?
            </Link>
            <Link to="/role" className="flex items-center gap-1 text-[12px] font-bold" style={{ color: ink }}>
              New here? Sign up <ArrowRight className="size-3.5" strokeWidth={2.6} />
            </Link>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
