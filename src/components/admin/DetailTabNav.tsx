import { Link, useRouterState } from "@tanstack/react-router";
import { T } from "./AdminShell";

export type DetailTab = {
  to: string;
  label: string;
  exact?: boolean;
  params?: Record<string, string>;
};

export function DetailTabNav({ tabs, params }: { tabs: DetailTab[]; params?: Record<string, string> }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mt-4 flex items-center gap-1 border-b overflow-x-auto" style={{ borderColor: T.border }}>
      {tabs.map((t) => {
        const resolvedParams = { ...params, ...t.params };
        const href = t.to.replace(/\$(\w+)/g, (_, key) => resolvedParams[key] ?? "").replace(/\/$/, "");
        const active = t.exact
          ? path === href || path === `${href}/`
          : path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={t.to + t.label}
            to={t.to as never}
            params={resolvedParams as never}
            className="px-3 h-10 inline-flex items-center text-[12.5px] font-semibold transition relative shrink-0"
            style={{ color: active ? T.ink : T.sub }}
          >
            {t.label}
            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-t" style={{ background: T.navy }} />
            )}
          </Link>
        );
      })}
    </div>
  );
}
