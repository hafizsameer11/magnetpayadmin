import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ArrowRight, MapPin, Warehouse, Plus, Star, Home, X, Check, Building2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { getRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/address")({
  head: () => ({ meta: [{ title: "Address book — MagnetPay" }] }),
  component: Address,
});

type AddrType = "Home" | "Office" | "Pickup" | "Warehouse" | "Factory";

type Addr = {
  id: string;
  type: AddrType;
  label: string;
  body: string;
  flag: string;
  contact: string;
  primary: boolean;
};

const ICONS: Record<AddrType, typeof Home> = {
  Home, Office: Building2, Pickup: MapPin, Warehouse, Factory: Building2,
};
const TINTS: Record<AddrType, string> = {
  Home: "#0E3B2E", Office: "#0F766E", Pickup: "#0F766E", Warehouse: "#C2410C", Factory: "#C2410C",
};

const NG_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Kano", "Oyo", "Kaduna", "Enugu", "Anambra",
  "Delta", "Edo", "Cross River", "Akwa Ibom", "Ogun", "Plateau", "Borno", "Imo",
  "Abia", "Bayelsa", "Benue", "Ebonyi", "Ekiti", "Gombe", "Jigawa", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Nasarawa", "Niger", "Ondo", "Osun", "Sokoto",
  "Taraba", "Yobe", "Zamfara", "Adamawa", "Bauchi",
].sort();

function Address() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472";
  const navigate = useNavigate();

  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);
  const isBuyer = role !== "seller";

  const buyerTypes: AddrType[] = ["Home", "Office", "Pickup"];
  const sellerTypes: AddrType[] = ["Warehouse", "Factory", "Pickup"];
  const types = isBuyer ? buyerTypes : sellerTypes;

  const [addresses, setAddresses] = useState<Addr[]>(
    isBuyer
      ? [
          { id: "1", type: "Home", label: "Home · Lagos", body: "12 Adeola Odeku St, Victoria Island, Lagos", flag: "🇳🇬", contact: "Chidi Okoro · +234 812 345 6789", primary: true },
        ]
      : [
          { id: "1", type: "Warehouse", label: "Guangzhou hub", body: "Baiyun Cargo Zone, Bldg 4B, Guangzhou 510000", flag: "🇨🇳", contact: "Wang Wei · +86 138 0013 8000", primary: true },
        ],
  );

  // sync default seed once role hydrates
  useEffect(() => {
    setAddresses(
      isBuyer
        ? [
            { id: "1", type: "Home", label: "Home · Lagos", body: "12 Adeola Odeku St, Victoria Island, Lagos", flag: "🇳🇬", contact: "Chidi Okoro · +234 812 345 6789", primary: true },
          ]
        : [
            { id: "1", type: "Warehouse", label: "Guangzhou hub", body: "Baiyun Cargo Zone, Bldg 4B, Guangzhou 510000", flag: "🇨🇳", contact: "Wang Wei · +86 138 0013 8000", primary: true },
          ],
    );
  }, [isBuyer]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ type: AddrType; label: string; street: string; city: string; state: string; contactName: string; contactPhone: string }>({
    type: isBuyer ? "Home" : "Warehouse",
    label: "", street: "", city: "", state: isBuyer ? "Lagos" : "", contactName: "", contactPhone: "",
  });

  useEffect(() => {
    setForm((f) => ({ ...f, type: isBuyer ? "Home" : "Warehouse", state: isBuyer ? "Lagos" : "" }));
  }, [isBuyer]);

  const makePrimary = (id: string) =>
    setAddresses((arr) => arr.map((a) => ({ ...a, primary: a.id === id })));
  const remove = (id: string) =>
    setAddresses((arr) => arr.filter((a) => a.id !== id));

  const canSave = form.label.trim() && form.street.trim() && (isBuyer ? form.state : form.city.trim());

  const save = () => {
    if (!canSave) return;
    const flag = isBuyer ? "🇳🇬" : "🇨🇳";
    const body = isBuyer
      ? `${form.street.trim()}, ${form.state}, Nigeria`
      : `${form.street.trim()}, ${form.city.trim()}, China`;
    const contact = [form.contactName.trim(), form.contactPhone.trim()].filter(Boolean).join(" · ");
    setAddresses((arr) => [
      ...arr,
      {
        id: String(Date.now()),
        type: form.type,
        label: form.label.trim(),
        body, flag, contact,
        primary: arr.length === 0,
      },
    ]);
    setForm({ type: isBuyer ? "Home" : "Warehouse", label: "", street: "", city: "", state: isBuyer ? "Lagos" : "", contactName: "", contactPhone: "" });
    setOpen(false);
  };

  const title = isBuyer ? <>Where should we<br />deliver your orders?</> : <>Your warehouse &<br />pickup addresses</>;
  const subtitle = isBuyer
    ? "We deliver door-to-door across all 36 states + FCT. Add home, office or a pickup location."
    : "We use these for pickup, customs and consolidation. Add as many as you need.";
  const tip = isBuyer
    ? "Tip: add an office address if you'd rather pick up bulky orders at work."
    : "Tip: list every warehouse so we can coordinate consolidated shipments to Nigeria.";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to={isBuyer ? "/permissions" : "/bank"} className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                {isBuyer ? "Step 5 of 6 · Addresses" : "Step 8 of 8 · Addresses"}
              </p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: isBuyer ? 6 : 8 }).map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full" style={{ background: navy }} />
                ))}
              </div>
            </div>
          </header>

          <section className="px-4 mt-4">
            <h1 className="text-[24px] leading-[1.05] font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>{subtitle}</p>
          </section>

          <section className="px-4 mt-5 space-y-3">
            {addresses.map((a) => {
              const I = ICONS[a.type];
              const tint = TINTS[a.type];
              return (
                <div key={a.id} className="p-3.5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${tint}14`, color: tint }}>
                      <I className="size-4" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: tint }}>{a.type}</span>
                        {a.primary && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: `${navy}14`, color: navy }}>
                            <Star className="size-2.5" strokeWidth={3} /> Primary
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[13.5px] font-bold leading-tight">
                        <span className="mr-1">{a.flag}</span>{a.label}
                      </p>
                      <p className="mt-1 text-[11.5px] leading-snug" style={{ color: sub }}>{a.body}</p>
                      {a.contact && <p className="mt-1 text-[10.5px]" style={{ color: muted }}>{a.contact}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {!a.primary && (
                      <button onClick={() => makePrimary(a.id)}
                        className="flex-1 h-8 rounded-lg text-[11px] font-bold active:scale-95" style={{ background: `${navy}10`, color: navy }}>
                        Make primary
                      </button>
                    )}
                    <button onClick={() => remove(a.id)}
                      className="flex-1 h-8 rounded-lg text-[11px] font-bold active:scale-95" style={{ background: `${ink}06`, color: sub }}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button onClick={() => setOpen(true)}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-[12.5px] font-bold active:scale-[0.98] transition"
              style={{ background: surface, border: `1.5px dashed ${border}`, color: navy }}>
              <Plus className="size-4" strokeWidth={2.6} /> Add another address
            </button>
          </section>

          <p className="px-4 mt-4 text-[10.5px] text-center" style={{ color: muted }}>{tip}</p>

          {open && (
            <div className="absolute inset-0 z-40 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
              <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl p-5 pb-7 max-h-[88%] overflow-y-auto"
                style={{ background: bg }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-bold">Add address</h2>
                  <button onClick={() => setOpen(false)} className="size-8 rounded-full grid place-items-center" style={{ background: surface, border: `1px solid ${border}` }}>
                    <X className="size-4" strokeWidth={2.4} />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: muted }}>Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {types.map((t) => {
                      const on = form.type === t;
                      const I = ICONS[t];
                      return (
                        <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                          className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95"
                          style={{
                            background: on ? navy : surface,
                            color: on ? "#fff" : ink,
                            border: `1.5px solid ${on ? navy : border}`,
                          }}>
                          <I className="size-4" strokeWidth={2.4} /> {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder={isBuyer ? "Label (e.g. Home, Office)" : "Label (e.g. Guangzhou hub)"}
                    className="w-full h-12 px-3 rounded-2xl outline-none text-[13px] font-semibold"
                    style={{ background: surface, border: `1.5px solid ${form.label ? navy : border}`, color: ink }} />

                  <textarea value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    placeholder="Street address (number, street, area)" rows={2}
                    className="w-full p-3 rounded-2xl outline-none text-[13px] font-semibold resize-none"
                    style={{ background: surface, border: `1.5px solid ${form.street ? navy : border}`, color: ink }} />

                  {isBuyer ? (
                    <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      className="w-full h-12 px-3 rounded-2xl outline-none text-[13px] font-semibold appearance-none"
                      style={{ background: surface, border: `1.5px solid ${form.state ? navy : border}`, color: ink }}>
                      {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="City / Province (e.g. Guangzhou, Guangdong)"
                      className="w-full h-12 px-3 rounded-2xl outline-none text-[13px] font-semibold"
                      style={{ background: surface, border: `1.5px solid ${form.city ? navy : border}`, color: ink }} />
                  )}

                  <div className="flex gap-2">
                    <input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                      placeholder="Contact name (optional)"
                      className="flex-1 h-12 px-3 rounded-2xl outline-none text-[13px] font-semibold"
                      style={{ background: surface, border: `1px solid ${border}`, color: ink }} />
                    <input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                      placeholder={isBuyer ? "+234 …" : "+86 …"} inputMode="tel"
                      className="flex-1 h-12 px-3 rounded-2xl outline-none text-[13px] font-semibold"
                      style={{ background: surface, border: `1px solid ${border}`, color: ink }} />
                  </div>
                </div>

                <button onClick={save} disabled={!canSave}
                  className="mt-4 w-full h-12 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: navy, color: "#fff" }}>
                  <Check className="size-4" strokeWidth={2.8} /> Save address
                </button>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={addresses.length === 0}
              onClick={() => navigate({ to: "/permissions" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
