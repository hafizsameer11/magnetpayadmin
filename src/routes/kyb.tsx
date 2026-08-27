import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ArrowRight, Building2, MapPin, Tag, Check, ChevronDown, Hash } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";

export const Route = createFileRoute("/kyb")({
  head: () => ({ meta: [{ title: "Business info — MagnetPay" }] }),
  component: Kyb,
});

const ENTITIES = [
  "Limited Liability Co. (有限公司)",
  "Sole Proprietorship (个体户)",
  "Joint Stock Co. (股份有限公司)",
  "Wholly Foreign-Owned (WFOE)",
];
const CATEGORIES = ["Electronics", "Apparel", "Home & Living", "Beauty", "Auto Parts", "Machinery", "Toys", "Hardware"];
const VOLUMES = ["< ¥100k", "¥100k–1M", "¥1M+"];
const PROVINCES = ["Guangdong", "Zhejiang", "Jiangsu", "Fujian", "Shanghai", "Shandong", "Beijing", "Sichuan", "Hubei", "Other"];

function Kyb() {
  const navy = "#0E3B2E", bg = "#F6F1E7", surface = "#FFFFFF",
    border = "#E7DFCE", ink = "#1B1A17", sub = "#5B5749", muted = "#8A8472", accent = "#C2410C";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [legalRep, setLegalRep] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [provOpen, setProvOpen] = useState(false);
  const [entity, setEntity] = useState(ENTITIES[0]);
  const [entityOpen, setEntityOpen] = useState(false);
  const [uscc, setUscc] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);

  const valid =
    name.trim().length >= 2 &&
    legalRep.trim().length >= 2 &&
    address.trim().length >= 6 &&
    uscc.length === 18 &&
    !!category &&
    !!volume;

  const fmtUscc = (raw: string) => {
    const d = raw.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 18);
    return d.replace(/(.{4})(.{4})(.{4})(.{4})(.{2})?/, (_, a, b, c, e, f) => [a, b, c, e, f].filter(Boolean).join(" "));
  };

  type FProps = { I: typeof Building2; label: string; value: string; onChange: (v: string) => void; placeholder: string; hint?: string; };
  const F = ({ I, label, value, onChange, placeholder, hint }: FProps) => (
    <div className="p-3.5 rounded-2xl" style={{ background: surface, border: `1.5px solid ${value ? navy : border}` }}>
      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>{label}</span>
      <div className="mt-1 flex items-center gap-2.5">
        <I className="size-4 shrink-0" strokeWidth={2.2} style={{ color: sub }} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent outline-none text-[13.5px] font-bold leading-snug placeholder:font-normal placeholder:text-[#a8a294]"
          style={{ color: ink }} />
      </div>
      {hint && <p className="mt-1 text-[10.5px]" style={{ color: muted }}>{hint}</p>}
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" />
      <PhoneFrame background={navy}>
        <div className="relative min-h-full pb-32" style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center gap-3">
            <Link to="/profile" className="size-9 grid place-items-center rounded-full" style={{ background: surface, border: `1px solid ${border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Step 1 of 2 · Seller verification (KYB)</p>
              <div className="mt-1 flex gap-1">
                <span className="h-1 flex-1 rounded-full" style={{ background: accent }} />
                <span className="h-1 flex-1 rounded-full" style={{ background: `${accent}22` }} />
              </div>
            </div>
            <button onClick={() => navigate({ to: "/kyb-docs" })} className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Skip</button>
          </header>

          <section className="px-4 mt-4">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-md"
              style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}26` }}>🇨🇳 China business</span>
            <h1 className="mt-3 text-[24px] leading-[1.05] font-bold tracking-tight">About your company</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: sub }}>
              Match the details on your Business License (营业执照). African buyers will see your verified company name on RFQs.
            </p>
          </section>

          <section className="px-4 mt-5 space-y-3">
            <F I={Building2} label="Registered company name 公司名称" value={name} onChange={setName} placeholder="e.g. Shenzhen Hongtai Trading Co., Ltd" hint="Must match your Business License exactly" />
            <F I={Tag} label="Brand / storefront name" value={brand} onChange={setBrand} placeholder="e.g. Hongtai Electronics" hint="Shown to buyers on your storefront" />
            <F I={Building2} label="Legal representative 法定代表人" value={legalRep} onChange={setLegalRep} placeholder="e.g. Wang Wei" hint="Name as on Chinese ID card" />
            <F I={MapPin} label="Registered address 注册地址" value={address} onChange={setAddress} placeholder="District, city" />

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3.5 rounded-2xl relative" style={{ background: surface, border: `1.5px solid ${border}` }}>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Province</span>
                <button onClick={() => setProvOpen((o) => !o)} className="mt-1 flex items-center justify-between w-full">
                  <span className="text-[12.5px] font-bold text-left">{province}</span>
                  <ChevronDown className="size-3.5 shrink-0" style={{ color: muted }} strokeWidth={2.6} />
                </button>
                {provOpen && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-2xl overflow-hidden max-h-56 overflow-y-auto"
                    style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.18)" }}>
                    {PROVINCES.map((p) => (
                      <button key={p} onClick={() => { setProvince(p); setProvOpen(false); }}
                        className="w-full px-3 py-2.5 text-left text-[12px] font-semibold hover:bg-black/5 flex items-center justify-between">
                        {p}
                        {province === p && <Check className="size-3.5" strokeWidth={3} style={{ color: navy }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3.5 rounded-2xl relative" style={{ background: surface, border: `1.5px solid ${border}` }}>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Entity type</span>
                <button onClick={() => setEntityOpen((o) => !o)} className="mt-1 flex items-center justify-between w-full">
                  <span className="text-[11.5px] font-bold text-left leading-tight">{entity}</span>
                  <ChevronDown className="size-3.5 shrink-0" style={{ color: muted }} strokeWidth={2.6} />
                </button>
                {entityOpen && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-2xl overflow-hidden"
                    style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.18)" }}>
                    {ENTITIES.map((e) => (
                      <button key={e} onClick={() => { setEntity(e); setEntityOpen(false); }}
                        className="w-full px-3 py-2.5 text-left text-[11.5px] font-semibold hover:bg-black/5 flex items-center justify-between">
                        {e}
                        {entity === e && <Check className="size-3.5 shrink-0" strokeWidth={3} style={{ color: navy }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: surface, border: `1.5px solid ${uscc.length === 18 ? navy : border}` }}>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Unified Social Credit Code (USCC) 统一社会信用代码</span>
              <div className="mt-1 flex items-center gap-2.5">
                <Hash className="size-4 shrink-0" strokeWidth={2.2} style={{ color: sub }} />
                <input value={fmtUscc(uscc)} onChange={(e) => setUscc(e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 18))}
                  placeholder="91440300MA5XXXXXXX"
                  className="w-full bg-transparent outline-none text-[13px] font-bold placeholder:font-normal placeholder:text-[#a8a294]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: ink }} />
                <span className="text-[10px] font-bold shrink-0" style={{ color: uscc.length === 18 ? navy : muted }}>{uscc.length}/18</span>
              </div>
              <p className="mt-1 text-[10.5px]" style={{ color: muted }}>18-digit code on your Business License</p>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: surface, border: `1.5px solid ${category ? navy : border}` }}>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Primary category</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const on = category === c;
                  return (
                    <button key={c} onClick={() => setCategory(on ? null : c)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition active:scale-95"
                      style={{ background: on ? navy : `${ink}06`, color: on ? "#fff" : sub }}>
                      {on && <Check className="inline size-3 mr-1 -mt-0.5" strokeWidth={3.2} />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: surface, border: `1.5px solid ${volume ? navy : border}` }}>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: muted }}>Expected monthly export volume</span>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {VOLUMES.map((v) => {
                  const on = volume === v;
                  return (
                    <button key={v} onClick={() => setVolume(v)}
                      className="h-9 rounded-xl text-[11px] font-bold transition active:scale-95"
                      style={{ background: on ? navy : `${ink}06`, color: on ? "#fff" : sub }}>{v}</button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="absolute bottom-0 inset-x-0 px-4 pt-4 pb-6" style={{ background: `linear-gradient(to top, ${bg} 70%, ${bg}00 100%)` }}>
            <button
              disabled={!valid}
              onClick={() => navigate({ to: "/kyb-docs" })}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition disabled:opacity-40"
              style={{ background: navy, color: "#fff" }}>
              Continue to documents <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </PhoneFrame>
    </>
  );
}
