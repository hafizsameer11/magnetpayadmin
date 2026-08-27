import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useRoleGuard } from "@/lib/use-role-guard";
import { useState } from "react";
import { ChevronLeft, ScanFace, Fingerprint, Delete, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/send/auth")({
  head: () => ({ meta: [{ title: "Authorize — MagnetPay" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    rid: String(s.rid ?? ""),
    name: String(s.name ?? "Recipient"),
    channel: String(s.channel ?? "bank"),
    cny: Number(s.cny) || 0,
    purpose: String(s.purpose ?? "GDS"),
    note: String(s.note ?? ""),
  }),
  component: SendAuth,
});

function SendAuth() {
  useRoleGuard(["buyer", "both"], "Sending CNY isn't available for seller accounts");
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();
  const params = useSearch({ from: "/send/auth" });
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const press = (k: string) => {
    setErr(false);
    const next = k === "del" ? pin.slice(0, -1) : pin.length < 6 ? pin + k : pin;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => {
        if (next === "000000") setErr(true);
        else navigate({ to: "/send/success", search: params });
      }, 250);
    }
  };

  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-6" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <button onClick={() => navigate({ to: "/send/review", search: params })}
              className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Authorize</p>
              <p className="text-[13px] font-bold">Enter passcode</p>
            </div>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-3">
            <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${accent}14`, color: accent }}>
                <ShieldCheck className="size-5" strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold">Pay {params.name}</p>
                <p className="text-[10.5px]" style={{ color: muted }}>¥{fmt(params.cny)} · purpose {params.purpose}</p>
              </div>
            </div>
          </section>

          <section className="px-4 mt-7">
            <div className="flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="size-3.5 rounded-full transition"
                  style={{
                    background: i < pin.length ? (err ? "#B91C1C" : navy) : "transparent",
                    border: `1.5px solid ${i < pin.length ? (err ? "#B91C1C" : navy) : border}`,
                  }} />
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] font-bold h-4" style={{ color: err ? "#B91C1C" : muted }}>
              {err ? "Wrong passcode — try again" : "Enter 6-digit passcode"}
            </p>
          </section>

          <section className="px-4 mt-4">
            <div className="grid grid-cols-3 gap-2.5">
              {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) => {
                if (k === "") return (
                  <button key={i} onClick={() => alert("Biometric prompt")}
                    className="h-14 rounded-2xl grid place-items-center" style={{ background: "transparent" }}>
                    <Fingerprint className="size-5" style={{ color: sub }} strokeWidth={2.3} />
                  </button>
                );
                if (k === "del") return (
                  <button key={i} onClick={() => press("del")} className="h-14 rounded-2xl grid place-items-center active:bg-black/5">
                    <Delete className="size-5" strokeWidth={2.4} style={{ color: sub }} />
                  </button>
                );
                return (
                  <button key={i} onClick={() => press(k)}
                    className="h-14 rounded-2xl text-[22px] font-bold active:scale-95 transition"
                    style={{ background: surface, border: `1px solid ${border}`, color: ink, fontFamily: "'JetBrains Mono', monospace" }}>
                    {k}
                  </button>
                );
              })}
            </div>
            <button className="mt-3 w-full text-center text-[11.5px] font-bold flex items-center justify-center gap-1.5" style={{ color: navy }}>
              <ScanFace className="size-3.5" strokeWidth={2.4} /> Use Face ID instead
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
