import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getRole, ROLE_META, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — MagnetPay" }] }),
  component: Signup,
});

function Signup() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472",
    accent = "#C2410C";
  const navigate = useNavigate();
  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const meta = ROLE_META[role];
  const tint = role === "seller" ? accent : navy;

  const [phone, setPhone] = useState("");
  const max = role === "seller" ? 11 : 11;
  const valid = phone.length >= (role === "seller" ? 11 : 10);

  const fmtNg = (d: string) => {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  };
  const fmtCn = (d: string) => {
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  };
  const display = role === "seller" ? fmtCn(phone) : fmtNg(phone);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/role" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                Step 1 of 6 · {meta.label} account
              </p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 1 ? tint : `${tint}22` }} />
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/otp" })}
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: muted }}
            >Skip</button>
          </header>

          <section className="px-4 mt-4">
            <div className="size-12 rounded-2xl grid place-items-center" style={{ background: `${tint}12`, color: tint }}>
              <Phone className="size-5" strokeWidth={2.2} />
            </div>
            <h1 className="mt-4 text-[26px] leading-[1.05] font-bold tracking-tight">What's your<br />phone number?</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              We'll send a 6-digit code to verify it's really you.{" "}
              {role === "seller" ? "Make sure it's the number registered with your business." : "Standard SMS rates may apply."}
            </p>
          </section>

          <section className="px-4 mt-6">
            <label className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: muted }}>Phone number</label>
            <div className="mt-2 flex gap-2">
              <div
                className="flex items-center gap-1.5 px-3 h-14 rounded-2xl text-[13px] font-bold opacity-90"
                style={{ background: surface, border: `1px solid ${border}`, color: ink }}
                title={`Locked to ${meta.country.name} based on your role`}
              >
                <span className="text-base">{meta.country.flag}</span> {meta.country.dial}
              </div>
              <div className="flex-1 h-14 rounded-2xl px-4 flex items-center" style={{ background: surface, border: `1.5px solid ${phone ? tint : border}` }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  placeholder={meta.placeholder}
                  value={display}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, max))}
                  className="w-full bg-transparent outline-none text-[17px] font-bold tracking-wide placeholder:font-normal"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }}
                />
              </div>
            </div>
            <p className="mt-2 text-[10.5px]" style={{ color: muted }}>
              Country locked to <b style={{ color: ink }}>{meta.country.name}</b> — change your role to use a different country.
            </p>

            <p className="mt-3 text-[11px] flex items-start gap-1.5" style={{ color: sub }}>
              <ShieldCheck className="size-3.5 mt-0.5 shrink-0" strokeWidth={2.4} />
              Your number is encrypted and never shared with {role === "seller" ? "buyers" : "sellers"}.
            </p>
          </section>

          <section className="px-4 mt-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: muted }}>Or continue with</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(role === "seller" ? ["WeChat", "Apple"] : ["Google", "Apple"]).map((p) => (
                <button key={p} onClick={() => navigate({ to: "/profile" })}
                  className="h-12 rounded-2xl text-[12.5px] font-bold active:scale-[0.98] transition"
                  style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  {p}
                </button>
              ))}
            </div>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <p className="text-center text-[10.5px] mb-3" style={{ color: muted }}>
              By continuing you agree to the <span className="font-bold" style={{ color: ink }}>Terms</span> & <span className="font-bold" style={{ color: ink }}>Privacy</span>.
            </p>
            <button
              disabled={!valid}
              onClick={() => navigate({ to: "/otp" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold transition active:scale-[0.98] disabled:opacity-40"
              style={{ background: tint, color: "#fff" }}
            >
              Send code <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
