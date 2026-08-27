import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  ShieldCheck,
  Bell,
  Globe2,
  Receipt,
  Users2,
  LifeBuoy,
  FileText,
  LogOut,
  Star,
  BadgeCheck,
  Wallet,
  Store,
  Boxes,
  TrendingUp,
  Banknote,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { BottomNav } from "@/components/magnetpay/BottomNav";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { getRole, setRole, type V8Role } from "@/lib/v8-role";

export const Route = createFileRoute("/me/")({
  head: () => ({ meta: [{ title: "Profile — MagnetPay" }] }),
  component: ProfileHome,
});

function ProfileHome() {
  const t = escrowTheme;
  const navigate = useNavigate();
  const [role, setRoleState] = useState<V8Role>("buyer");
  useEffect(() => setRoleState(getRole()), []);

  const pick = (r: V8Role) => {
    setRole(r);
    setRoleState(r);
    navigate({ to: r === "seller" ? "/seller" : "/home" });
  };


  const Row = ({
    to,
    I,
    label,
    hint,
    danger,
  }: {
    to: string;
    I: typeof Pencil;
    label: string;
    hint?: string;
    danger?: boolean;
  }) => (
    <Link
      to={to}
      className="w-full px-3.5 py-3 flex items-center gap-3"
      style={{ borderTop: `1px solid ${t.border}` }}
    >
      <div
        className="size-8 rounded-lg grid place-items-center shrink-0"
        style={{
          background: danger ? `${t.danger}10` : `${t.navy}08`,
          color: danger ? t.danger : t.navy,
        }}
      >
        <I className="size-4" strokeWidth={2.3} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[12.5px] font-bold leading-tight"
          style={{ color: danger ? t.danger : t.ink }}
        >
          {label}
        </p>
        {hint && (
          <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
            {hint}
          </p>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0" strokeWidth={2.4} style={{ color: t.muted }} />
    </Link>
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy} bottomNav={<BottomNav active="profile" />}>
        <div
          className="relative min-h-full pb-32"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to={role === "seller" ? "/seller" : "/home"}
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">
              {role === "seller" ? "Seller profile" : "Buyer profile"}
            </p>
            <Link
              to="/me/edit"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.navy }}
            >
              <Pencil className="size-4" strokeWidth={2.4} />
            </Link>
          </header>

          {/* Identity card */}
          <section className="px-4">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div
                className="size-14 rounded-2xl grid place-items-center text-[18px] font-bold shrink-0"
                style={{
                  background: role === "seller" ? t.accent : t.navy,
                  color: "#fff",
                }}
              >
                {role === "seller" ? "GH" : "CO"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold leading-tight">
                  {role === "seller" ? "Guangzhou Huayi Co." : "Chidi Okoro"}
                </p>
                <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                  {role === "seller" ? "ops@huayi.cn · 王伟" : "chidi.okoro@gmail.com"}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${t.success}15`, color: t.success }}
                  >
                    <BadgeCheck className="size-2.5" strokeWidth={2.6} />
                    {role === "seller" ? "KYB verified" : "KYC verified"}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${t.warn}15`, color: t.warn }}
                  >
                    <Star className="size-2.5 fill-current" />
                    {role === "seller" ? "4.8 supplier" : "4.9 buyer"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="px-4 mt-3 grid grid-cols-3 gap-2">
            {(role === "seller"
              ? [
                  { k: "Orders", v: "182" },
                  { k: "Products", v: "47" },
                  { k: "Payouts", v: "9" },
                ]
              : [
                  { k: "Orders", v: "24" },
                  { k: "Escrows", v: "3" },
                  { k: "Suppliers", v: "11" },
                ]
            ).map((s) => (
              <div
                key={s.k}
                className="rounded-2xl p-3 text-center"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
              >
                <p
                  className="text-[16px] font-bold tabular-nums"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: t.navy }}
                >
                  {s.v}
                </p>
                <p
                  className="text-[9.5px] font-bold uppercase tracking-[0.14em] mt-0.5"
                  style={{ color: t.muted }}
                >
                  {s.k}
                </p>
              </div>
            ))}
          </section>

          {/* Account */}
          <section className="px-4 mt-5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Account
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div style={{ borderTop: "none" }}>
                <Row to="/me/edit" I={Pencil} label="Edit profile" hint="Name, photo, contact" />
              </div>
              <Row to="/settings/security" I={ShieldCheck} label="Security" hint="Passcode, biometrics, 2FA" />
              <Row to="/settings/notifications" I={Bell} label="Notifications" hint="Push, email, SMS" />
              <Row to="/settings/locale" I={Globe2} label="Language & currency" hint="English · CNY display" />
              {role === "buyer" && (
                <Row to="/me/wishlist" I={Heart} label="Wishlist" hint="Saved products" />
              )}
              {role === "buyer" && (
                <Row to="/recipients" I={Wallet} label="Saved recipients" hint="Banks, wallets" />
              )}
            </div>
          </section>

          {/* Seller workspace — only for sellers */}
          {role === "seller" && (
            <section className="px-4 mt-4">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                style={{ color: t.muted }}
              >
                Seller workspace
              </p>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
              >
                <div style={{ borderTop: "none" }}>
                  <Row to="/seller/storefront" I={Store} label="Storefront" hint="Public shop page" />
                </div>
                <Row to="/seller/catalog" I={Boxes} label="Catalog" hint="Products & variants" />
                <Row to="/seller/payouts" I={Banknote} label="Payouts" hint="CNY bank, history" />
                <Row to="/seller/performance" I={TrendingUp} label="Performance" hint="Conversion, ratings" />
                <Row to="/seller/settings/tax" I={Receipt} label="Tax & invoicing" hint="VAT, fapiao, footer" />
                <Row to="/seller/settings/team" I={Users2} label="Team & roles" hint="3 members · 2 roles" />
              </div>
            </section>
          )}

          {/* Help & legal */}
          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Support
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div style={{ borderTop: "none" }}>
                <Row to="/help" I={LifeBuoy} label="Help center" hint="FAQs, guides" />
              </div>
              <Row to="/help/ticket" I={Bell} label="Contact support" hint="Chat or open a ticket" />
              <Row to="/legal" I={FileText} label="Legal" hint="Terms, privacy, AML" />
            </div>
          </section>

          {/* Account exit */}
          <section className="px-4 mt-4 mb-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div style={{ borderTop: "none" }}>
                <Row to="/settings/account" I={LogOut} label="Log out & account" danger hint="Sign out or delete account" />
              </div>
            </div>

            {/* Profile switch */}
            <div className="mt-4 flex items-center justify-between gap-3 px-1">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: t.muted }}
              >
                Profile
              </p>
              <div
                className="flex gap-0.5 p-0.5 rounded-full"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}
              >
                {(["buyer", "seller"] as const).map((k) => {
                  const on = role === k;
                  return (
                    <button
                      key={k}
                      onClick={() => pick(k)}
                      className="px-3 py-1 rounded-full text-[10.5px] font-bold transition"
                      style={{
                        background: on ? t.navy : "transparent",
                        color: on ? "#fff" : t.muted,
                      }}
                    >
                      {k === "buyer" ? "Buyer" : "Seller"}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-[9.5px] mt-4" style={{ color: t.muted }}>
              MagnetPay v8 · build 2026.06
            </p>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
