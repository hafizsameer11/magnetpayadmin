import { Link, useRouterState } from "@tanstack/react-router";
import { T } from "@/components/admin/AdminShell";

const LINKS: { label: string; to: string }[] = [
  { label: "Overview", to: "/admin/merchants" },
  { label: "List", to: "/admin/merchants/list" },
  { label: "KYB", to: "/admin/merchants/kyb" },
  { label: "Transactions", to: "/admin/merchants/transactions" },
  { label: "Disputes", to: "/admin/merchants/disputes" },
  { label: "Settlements", to: "/admin/merchants/settlements" },
  { label: "Float", to: "/admin/merchants/float" },
  { label: "Fees", to: "/admin/merchants/fees" },
  { label: "Tiers", to: "/admin/merchants/tiers" },
  { label: "Billers", to: "/admin/merchants/billers" },
  { label: "Directory", to: "/admin/merchants/directory" },
  { label: "Referrals", to: "/admin/merchants/referrals" },
  { label: "Broadcasts", to: "/admin/merchants/broadcasts" },
  { label: "Reports", to: "/admin/merchants/reports" },
  { label: "Audit", to: "/admin/merchants/audit" },
];

export function MerchantsSubnav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {LINKS.map((l) => {
        const active =
          l.to === "/admin/merchants"
            ? path === "/admin/merchants" || path === "/admin/merchants/"
            : path === l.to || path.startsWith(l.to + "/");
        return (
          <Link
            key={l.to}
            to={l.to}
            className="h-8 px-3 rounded-full text-[11.5px] font-semibold inline-flex items-center"
            style={{
              background: active ? T.navy : T.surface,
              color: active ? "#fff" : T.ink,
              border: `1px solid ${active ? T.navy : T.border}`,
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
