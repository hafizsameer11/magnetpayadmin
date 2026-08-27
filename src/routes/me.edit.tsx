import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Camera, Check, User2, Mail, Phone, MapPin } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/me/edit")({
  head: () => ({ meta: [{ title: "Edit profile — MagnetPay" }] }),
  component: EditProfile,
});

function EditProfile() {
  const t = escrowTheme;
  const navigate = useNavigate();
  const [name, setName] = useState("Chidi Okoro");
  const [email, setEmail] = useState("chidi.okoro@gmail.com");
  const [phone, setPhone] = useState("+234 803 555 0144");
  const [country, setCountry] = useState("Nigeria");
  const [bio, setBio] = useState("Procurement lead at Lagos Pumps Ltd. Sourcing industrial parts from Guangzhou.");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate({ to: "/me" }), 500);
  };

  const Field = ({
    I,
    label,
    value,
    onChange,
    type = "text",
  }: {
    I: typeof User2;
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
  }) => (
    <div
      className="p-3.5 rounded-2xl"
      style={{ background: t.surface, border: `1px solid ${t.border}` }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: t.muted }}
      >
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2.5">
        <I className="size-4 shrink-0" strokeWidth={2.2} style={{ color: t.sub }} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-[13px] font-bold"
          style={{ color: t.ink }}
        />
      </div>
    </div>
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-28"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/me"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">Edit profile</p>
            <div className="size-9" />
          </header>

          <section className="px-4 mt-2 flex items-center gap-4">
            <div className="relative">
              <div
                className="size-20 rounded-3xl grid place-items-center text-[26px] font-bold"
                style={{ background: t.navy, color: "#fff" }}
              >
                {name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase() || "?"}
              </div>
              <button
                onClick={() => toast("Photo picker opens here")}
                className="absolute -bottom-1.5 -right-1.5 size-8 rounded-full grid place-items-center"
                style={{ background: t.surface, border: `1.5px solid ${t.border}`, color: t.ink }}
              >
                <Camera className="size-3.5" strokeWidth={2.4} />
              </button>
            </div>
            <div>
              <p className="text-[12.5px] font-bold">Profile photo</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                Shown to suppliers and on receipts
              </p>
              <button
                onClick={() => toast("Photo removed")}
                className="mt-1.5 text-[10.5px] font-bold"
                style={{ color: t.danger }}
              >
                Remove
              </button>
            </div>
          </section>

          <section className="px-4 mt-5 space-y-2.5">
            <Field I={User2} label="Full name" value={name} onChange={setName} />
            <Field I={Mail} label="Email" value={email} onChange={setEmail} type="email" />
            <Field I={Phone} label="Phone" value={phone} onChange={setPhone} />
            <Field I={MapPin} label="Country" value={country} onChange={setCountry} />
            <div
              className="p-3.5 rounded-2xl"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: t.muted }}
              >
                About
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full mt-1 bg-transparent outline-none text-[12.5px] resize-none"
                style={{ color: t.ink }}
              />
              <p className="text-[10px] mt-1 text-right" style={{ color: t.muted }}>
                {bio.length}/160
              </p>
            </div>
          </section>

          <section className="absolute bottom-3 left-0 right-0 px-4">
            <button
              disabled={saving}
              onClick={save}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold text-white disabled:opacity-60"
              style={{ background: saved ? t.success : t.navy }}
            >
              {saved ? (
                <>
                  <Check className="size-4" strokeWidth={2.6} /> Saved
                </>
              ) : saving ? (
                "Saving…"
              ) : (
                "Save changes"
              )}
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
