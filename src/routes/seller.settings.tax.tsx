import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  Building2,
  FileText,
  Check,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/settings/tax")({
  head: () => ({ meta: [{ title: "Tax & invoicing — MagnetPay" }] }),
  component: TaxInvoicing,
});

function TaxInvoicing() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [autoFapiao, setAutoFapiao] = useState(true);
  const [vatInclusive, setVatInclusive] = useState(false);
  const [footer, setFooter] = useState(
    "Guangzhou Huayi Co., Ltd. · No. 88 Industrial Rd, Tianhe District, Guangzhou\nBank of China · 6228 4801 2345 6789 · Thank you for your business.",
  );

  const Tile = ({ k, v }: { k: string; v: string }) => (
    <div
      className="p-3 rounded-xl"
      style={{ background: `${t.navy}06`, border: `1px solid ${t.border}` }}
    >
      <p
        className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
        style={{ color: t.muted }}
      >
        {k}
      </p>
      <p
        className="text-[12px] font-bold mt-0.5 tabular-nums"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {v}
      </p>
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
          className="relative min-h-full pb-8"
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
            <p className="text-[13px] font-bold">Tax & invoicing</p>
            <div className="size-9" />
          </header>

          {/* Entity */}
          <section className="px-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Tax entity
            </p>
            <div
              className="rounded-2xl p-3.5"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl grid place-items-center"
                  style={{ background: `${t.navy}10`, color: t.navy }}
                >
                  <Building2 className="size-5" strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold leading-tight">
                    Guangzhou Huayi Co., Ltd.
                  </p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    Small-scale VAT taxpayer · Guangdong
                  </p>
                </div>
                <button
                  onClick={() => toast("Entity switcher opens here")}
                  className="text-[10.5px] font-bold"
                  style={{ color: t.accent }}
                >
                  Change
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Tile k="USCC" v="91440101MA9XX12K3T" />
                <Tile k="VAT rate" v="3.00%" />
              </div>
            </div>
          </section>

          {/* Fapiao */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Fapiao (发票) & VAT
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="px-3.5 py-3 flex items-center gap-3"
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <Receipt className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Auto-issue fapiao on release</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    Email VAT fapiao to buyer when each milestone releases
                  </p>
                </div>
                <button
                  onClick={() => setAutoFapiao((v) => !v)}
                  className="relative w-10 h-6 rounded-full"
                  style={{ background: autoFapiao ? t.navy : "#d4ccba" }}
                >
                  <span
                    className="absolute top-0.5 size-5 rounded-full bg-white transition-transform"
                    style={{ transform: autoFapiao ? "translateX(18px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
              <div
                className="px-3.5 py-3 flex items-center gap-3"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <FileText className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Prices include VAT</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    When off, VAT is added on top of listed prices
                  </p>
                </div>
                <button
                  onClick={() => setVatInclusive((v) => !v)}
                  className="relative w-10 h-6 rounded-full"
                  style={{ background: vatInclusive ? t.navy : "#d4ccba" }}
                >
                  <span
                    className="absolute top-0.5 size-5 rounded-full bg-white transition-transform"
                    style={{ transform: vatInclusive ? "translateX(18px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
              <Link
                to="/me"
                className="px-3.5 py-3 flex items-center gap-3"
                style={{ borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-8 rounded-lg grid place-items-center"
                  style={{ background: `${t.navy}08`, color: t.navy }}
                >
                  <FileText className="size-4" strokeWidth={2.3} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold">Fapiao history</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                    42 issued this year · ¥841,200 declared
                  </p>
                </div>
                <ChevronRight className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
              </Link>
            </div>
          </section>

          {/* Invoice footer */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Invoice footer
            </p>
            <div
              className="rounded-2xl p-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <textarea
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                rows={4}
                className="w-full bg-transparent outline-none text-[11.5px] leading-snug resize-none"
                style={{ color: t.ink }}
              />
            </div>
            <button
              onClick={() => toast.success("Tax settings saved")}
              className="mt-3 w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-[12px] font-bold text-white"
              style={{ background: t.navy }}
            >
              <Check className="size-4" strokeWidth={2.6} /> Save tax settings
            </button>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
