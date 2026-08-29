import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { createAdminCategory, fetchAdminCategories } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({ meta: [{ title: "Categories — MagnetPay Admin" }] }),
  component: Page,
});

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setRows(await fetchAdminCategories());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load categories");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const s = (slug.trim() || slugify(n)).trim();
    if (!n || !s) {
      toast.error("Name and slug required");
      return;
    }
    setBusy(true);
    try {
      await createAdminCategory({ name: n, slug: s });
      toast.success("Category created");
      setName("");
      setSlug("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      title="Categories"
      description="Marketplace category taxonomy."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Categories" }]}
    >
      <form
        onSubmit={(e) => void create(e)}
        className="rounded-xl p-4 mb-5 flex flex-wrap items-end gap-3"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug || slug === slugify(name)) setSlug(slugify(e.target.value));
            }}
            className="mt-1 h-9 w-full px-3 rounded-lg text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            placeholder="Electronics"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 h-9 w-full px-3 rounded-lg text-[12px] outline-none tabular-nums"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
            placeholder="electronics"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: T.navy }}
        >
          <Plus className="size-3.5" /> Create
        </button>
      </form>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr",
          }}
        >
          <span>Name</span>
          <span>Slug</span>
          <span className="text-right">Products</span>
          <span>ID</span>
        </div>
        {rows.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const count = (r._count as { products?: number } | undefined)?.products ?? 0;
          return (
            <Link
              key={str(r.id)}
              to="/admin/categories/$id"
              params={{ id: str(r.id) }}
              className="grid items-center px-4 h-12 text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
              style={{
                gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="font-semibold">{str(r.name)}</span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {str(r.slug)}
              </span>
              <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {count}
              </span>
              <span className="tabular-nums text-[10.5px]" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {str(r.id).slice(0, 8)}
              </span>
            </Link>
          );
        })}
        {!rows.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No categories yet. Create one above.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
