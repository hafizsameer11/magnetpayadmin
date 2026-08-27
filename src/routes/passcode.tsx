import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Fingerprint, ScanFace, Lock, Delete, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/passcode")({
  head: () => ({ meta: [{ title: "Set passcode — MagnetPay" }] }),
  component: Passcode,
});

function Passcode() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C", danger = "#B91C1C";
  const navigate = useNavigate();
  const [first, setFirst] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState<"create" | "confirm">("create");
  const [bio, setBio] = useState(true);
  const [err, setErr] = useState("");

  const current = stage === "create" ? first : confirm;

  const press = (k: string) => {
    setErr("");
    const next =
      k === "del" ? current.slice(0, -1) :
      current.length < 6 ? current + k : current;

    if (stage === "create") {
      setFirst(next);
      if (next.length === 6) setTimeout(() => setStage("confirm"), 150);
    } else {
      setConfirm(next);
      if (next.length === 6) {
        if (next === first) setTimeout(() => navigate({ to: "/profile" }), 200);
        else setTimeout(() => { setErr("Passcodes don't match"); setConfirm(""); }, 200);
      }
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-6" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/otp" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 3 of 8 · Account</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < 3 ? navy : `${navy}22` }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-3">
            <div className="size-11 rounded-2xl grid place-items-center" style={{ background: `${accent}14`, color: accent }}>
              <Lock className="size-5" strokeWidth={2.2} />
            </div>
            <h1 className="mt-3 text-[22px] leading-[1.05] font-bold tracking-tight">
              {stage === "create" ? "Create a 6-digit passcode" : "Re-enter to confirm"}
            </h1>
            <p className="mt-1.5 text-[12px]" style={{ color: sub }}>
              {stage === "create"
                ? "You'll use this to unlock the app and confirm payments."
                : "Type it once more — it has to match."}
            </p>
          </section>

          <section className="px-4 mt-5">
            <div className="flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="size-3.5 rounded-full transition"
                  style={{
                    background: i < current.length ? (err ? danger : navy) : "transparent",
                    border: `1.5px solid ${i < current.length ? (err ? danger : navy) : border}`,
                  }} />
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] font-bold h-4" style={{ color: err ? danger : muted }}>
              {err || (stage === "confirm" ? "Confirming…" : "")}
            </p>

            <div className="mt-2 p-3 rounded-2xl flex items-center justify-between" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl grid place-items-center" style={{ background: `${navy}10`, color: navy }}>
                  <Fingerprint className="size-4" strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold">Enable biometrics</p>
                  <p className="text-[10.5px]" style={{ color: muted }}>Face ID / Fingerprint after setup</p>
                </div>
              </div>
              <button onClick={() => setBio((b) => !b)}
                className="w-11 h-6 rounded-full p-0.5 flex items-center transition"
                style={{ background: bio ? navy : `${ink}1a`, justifyContent: bio ? "flex-end" : "flex-start" }}>
                <span className="size-5 rounded-full bg-white" />
              </button>
            </div>
          </section>

          <section className="px-4 mt-5">
            <div className="grid grid-cols-3 gap-2.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, i) => {
                if (k === "") return <div key={i} />;
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
            <button className="mt-2 w-full text-center text-[11.5px] font-bold" style={{ color: muted }}>
              <ScanFace className="size-3.5 inline mr-1" strokeWidth={2.4} /> Use Face ID instead
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
