import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, Camera, ArrowRight, Check, User2, Mail, Calendar as CalendarIcon } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Your profile — MagnetPay" }] }),
  component: Profile,
});

const COLORS = {
  navy: "#0E3B2E", surface: "#FFFFFF", border: "#E7DFCE",
  ink: "#1B1A17", sub: "#5B5749", muted: "#8A8472", teal: "#0F766E", danger: "#B91C1C",
};

type FieldProps = {
  I: typeof User2;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint?: string;
  type?: string;
  inputMode?: "text" | "email" | "numeric";
  verified?: boolean;
  error?: boolean;
  maxLength?: number;
};

function Field({ I, label, value, onChange, placeholder, hint, type = "text", inputMode = "text", verified, error, maxLength }: FieldProps) {
  const { surface, border, navy, muted, sub, ink, teal, danger } = COLORS;
  return (
    <div className="p-3.5 rounded-2xl" style={{
      background: surface,
      border: `1.5px solid ${error ? danger : value ? navy : border}`,
    }}>
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{label}</span>
        {verified && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: teal }}>
            <Check className="size-3" strokeWidth={3} /> Looks good
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2.5">
        <I className="size-4 shrink-0" strokeWidth={2.2} style={{ color: sub }} />
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent outline-none text-[14px] font-bold placeholder:font-normal placeholder:text-[#a8a294]"
          style={{ color: ink }}
        />
      </div>
      {hint && <p className="mt-1 text-[10.5px]" style={{ color: error ? danger : muted }}>{hint}</p>}
    </div>
  );
}


const COPY = {
  buyer: {
    badge: "🇳🇬 Buyer profile",
    badgeTint: "#0E3B2E",
    title: <>Tell us about<br />yourself</>,
    subtitle: "Use your real name — it must match your BVN / NIN for verification.",
    namePlaceholder: "e.g. Chidi Okoro",
    nameHint: "As on your Nigerian government ID",
    emailPlaceholder: "you@example.com",
    photoHint: "Optional · helps suppliers recognize you",
    avatar: "#0E3B2E",
    next: "identity check",
  },
  seller: {
    badge: "🇨🇳 Seller profile",
    badgeTint: "#C2410C",
    title: <>关于你<br />Tell us about yourself</>,
    subtitle: "Use the legal representative's name — it must match the Chinese ID (身份证) you'll upload next.",
    namePlaceholder: "e.g. Wang Wei 王伟",
    nameHint: "Pinyin + 中文 name as on 身份证",
    emailPlaceholder: "you@example.cn",
    photoHint: "Optional · shown on your storefront",
    avatar: "#C2410C",
    next: "business verification",
  },
} as const;

function Profile() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", teal = "#0F766E", danger = "#B91C1C";
  const navigate = useNavigate();

  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const copyKey: "buyer" | "seller" = role === "seller" ? "seller" : "buyer";
  const c = COPY[copyKey];
  const nextPath = role === "seller" ? "/kyb" : "/kyc1";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [dobOpen, setDobOpen] = useState(false);
  const [marketing, setMarketing] = useState(true);

  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const minDob = new Date(today.getFullYear() - 100, 0, 1);

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    // Prefer ASCII initials; fall back to first char (handles Chinese names).
    const ascii = (s: string) => /[A-Za-z]/.test(s) ? s.match(/[A-Za-z]/)![0] : s[0];
    return (ascii(parts[0]) + (parts[1] ? ascii(parts[1]) : "")).toUpperCase();
  }, [name]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = email.length > 0 && !emailValid;
  const dobValid = !!dob && dob <= maxDob && dob >= minDob;

  const valid = name.trim().length >= 2 && emailValid && dobValid;




  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/passcode" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 4 of 6 · Profile</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 4 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
            <button onClick={() => navigate({ to: nextPath })} className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Skip</button>
          </header>

          <section className="px-4 mt-4">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-md"
              style={{ background: `${c.badgeTint}14`, color: c.badgeTint, border: `1px solid ${c.badgeTint}26` }}>
              {c.badge}
            </span>
            <h1 className="mt-3 text-[26px] leading-[1.05] font-bold tracking-tight">{c.title}</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>{c.subtitle}</p>
          </section>

          <section className="px-4 mt-6 flex items-center gap-4">
            <div className="relative">
              <div className="size-20 rounded-3xl grid place-items-center text-[28px] font-bold"
                style={{ background: c.avatar, color: "#fff" }}>
                {initials}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 size-8 rounded-full grid place-items-center active:scale-95"
                style={{ background: surface, border: `1.5px solid ${border}`, color: ink }}>
                <Camera className="size-3.5" strokeWidth={2.4} />
              </button>
            </div>
            <div>
              <p className="text-[13px] font-bold">Add a photo</p>
              <p className="text-[11px] mt-0.5" style={{ color: muted }}>{c.photoHint}</p>
            </div>
          </section>

          <section className="px-4 mt-6 space-y-3">
            <Field I={User2} label={role === "seller" ? "Legal representative name 姓名" : "Full name"} value={name} onChange={setName} placeholder={c.namePlaceholder} hint={c.nameHint} maxLength={60} />
            <Field I={Mail} label="Email address" value={email} onChange={setEmail} placeholder={c.emailPlaceholder} type="email" inputMode="email"
              hint={emailError ? "Enter a valid email address" : "For receipts & alerts"} verified={emailValid} error={emailError} />

            {/* DOB date-picker */}
            <Popover open={dobOpen} onOpenChange={setDobOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full p-3.5 rounded-2xl text-left transition active:scale-[0.995]"
                  style={{ background: surface, border: `1.5px solid ${dobValid ? navy : border}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Date of birth</span>
                    {dobValid && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: teal }}>
                        <Check className="size-3" strokeWidth={3} /> 18+
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2.5">
                    <CalendarIcon className="size-4 shrink-0" strokeWidth={2.2} style={{ color: sub }} />
                    <span className={cn("text-[14px] font-bold", !dob && "font-normal")} style={{ color: dob ? ink : "#a8a294" }}>
                      {dob ? format(dob, "d MMM yyyy") : "Pick your date of birth"}
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px]" style={{ color: muted }}>You must be 18 or older</p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={(d) => { setDob(d); if (d) setDobOpen(false); }}
                  defaultMonth={dob ?? new Date(today.getFullYear() - 25, today.getMonth())}
                  captionLayout="dropdown"
                  startMonth={minDob}
                  endMonth={maxDob}
                  disabled={{ after: maxDob, before: minDob }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <label className="flex items-start gap-2.5 px-1 pt-1 cursor-pointer">
              <button type="button" onClick={() => setMarketing((m) => !m)}
                className="size-4 rounded grid place-items-center mt-0.5 shrink-0"
                style={{ background: marketing ? navy : "transparent", border: `1.5px solid ${marketing ? navy : border}` }}>
                {marketing && <Check className="size-2.5" strokeWidth={3.5} style={{ color: "#fff" }} />}
              </button>
              <span className="text-[11.5px]" style={{ color: sub }}>
                {role === "seller"
                  ? "Send me RFQ alerts and FX rate updates. You can opt out anytime."
                  : "Send me product updates and FX deal alerts. You can opt out anytime."}
              </span>
            </label>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!valid}
              onClick={() => navigate({ to: nextPath })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Continue to {c.next} <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
