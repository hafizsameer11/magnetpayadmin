import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, SectionLabel, statusPillCatalog, Thumb } from "@/components/admin/Catalog";
import {
  ListingPageActions,
  listingCatalogStatus,
  listingRefId,
  sellerRefId,
} from "@/components/admin/ListingProfile";
import { Pill } from "@/components/admin/UserProfile";
import {
  fetchAdminCategories,
  fetchAdminLogisticsEstimateConfig,
  fetchAdminProduct,
  fmtMoney,
  fromMinor,
  moderateProduct,
  resolveApiFileUrl,
  updateAdminProduct,
  type AdminProduct,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Edit listing — MagnetPay Admin" }] }),
  component: Page,
});

type Category = { id: string; name: string };
type FormState = {
  title: string;
  description: string;
  tags: string;
  price: string;
  moq: string;
  stock: string;
  categoryId: string;
  originHub: string;
  leadTimeMin: string;
  leadTimeMax: string;
  cbmPerUnit: string;
  weightKgPerUnit: string;
  packagingType: string;
  defaultIncoterm: string;
  active: boolean;
};

const INCOTERMS = ["FOB", "CIF", "EXW", "DAP", "DDP", "CFR"];

function parseDescription(raw: string) {
  const tags: string[] = [];
  const body: string[] = [];
  for (const line of raw.split("\n")) {
    const tagMatch = line.match(/^Tags:\s*(.+)$/i);
    if (tagMatch) {
      for (const t of tagMatch[1].split(/[,;|]/)) {
        const trimmed = t.trim();
        if (trimmed) tags.push(trimmed);
      }
    } else {
      body.push(line);
    }
  }
  return {
    body: body.join("\n").trim(),
    tags: [...new Set(tags)],
  };
}

function buildDescription(body: string, tags: string) {
  const tagList = tags
    .split(/[,;|]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const parts = [body.trim()];
  for (const tag of tagList) parts.push(`Tags: ${tag}`);
  return parts.filter(Boolean).join("\n\n") || null;
}

function productImage(product: AdminProduct) {
  const raw = product.imageUrl ?? product.media?.[0]?.url ?? product.variants?.find((v) => v.imageUrl)?.imageUrl ?? "";
  return raw ? resolveApiFileUrl(raw) : "";
}

function primarySku(product: AdminProduct) {
  return product.variants?.find((v) => v.sku)?.sku ?? "—";
}

function productToForm(product: AdminProduct): FormState {
  const { body, tags } = parseDescription(product.description ?? "");
  return {
    title: product.title,
    description: body,
    tags: tags.join(", "),
    price: String(fromMinor(product.priceMinor)),
    moq: product.moq ?? "",
    stock: product.stock != null ? String(product.stock) : "",
    categoryId: product.category?.id ?? "",
    originHub: product.originHub ?? "",
    leadTimeMin: product.leadTimeMin != null ? String(product.leadTimeMin) : "",
    leadTimeMax: product.leadTimeMax != null ? String(product.leadTimeMax) : "",
    cbmPerUnit: product.cbmPerUnit != null ? String(product.cbmPerUnit) : "",
    weightKgPerUnit: product.weightKgPerUnit != null ? String(product.weightKgPerUnit) : "",
    packagingType: product.packagingType ?? "",
    defaultIncoterm: product.defaultIncoterm ?? "FOB",
    active: product.active,
  };
}

function Page() {
  const { id } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modBusy, setModBusy] = useState(false);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [originHubs, setOriginHubs] = useState<{ code: string; city: string; hub: string }[]>([]);
  const [packagingTypes, setPackagingTypes] = useState<string[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, cats, logistics] = await Promise.all([
        fetchAdminProduct(id),
        fetchAdminCategories().catch(() => []),
        fetchAdminLogisticsEstimateConfig().catch(() => null),
      ]);
      const nextForm = productToForm(p);
      setProduct(p);
      setForm(nextForm);
      setBaseline(JSON.stringify(nextForm));
      setCategories((cats as Category[]).map((c) => ({ id: c.id, name: c.name })));
      setOriginHubs(
        (logistics?.originHubs ?? [])
          .filter((h) => h.active !== false)
          .map((h) => ({ code: h.code, city: h.city, hub: h.hub })),
      );
      setPackagingTypes(
        (logistics?.packagingTypes ?? [])
          .filter((p) => p.active !== false)
          .map((p) => p.name),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load listing");
      setProduct(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const dirty = form != null && baseline !== JSON.stringify(form);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const resetForm = () => {
    if (!product) return;
    const next = productToForm(product);
    setForm(next);
    setBaseline(JSON.stringify(next));
  };

  const save = async () => {
    if (!form || !product) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const priceMinor = Math.round(Number(form.price) * 100);
      if (!Number.isFinite(priceMinor) || priceMinor < 0) {
        toast.error("Enter a valid price");
        return;
      }
      const stockNum = form.stock.trim() ? Number(form.stock) : null;
      if (stockNum != null && (!Number.isInteger(stockNum) || stockNum < 0)) {
        toast.error("Stock must be a whole number");
        return;
      }
      await updateAdminProduct(id, {
        title: form.title.trim(),
        description: buildDescription(form.description, form.tags),
        priceMinor,
        moq: form.moq.trim() || undefined,
        stock: stockNum,
        categoryId: form.categoryId || null,
        active: form.active,
        originHub: form.originHub.trim() || null,
        leadTimeMin: form.leadTimeMin.trim() ? Number(form.leadTimeMin) : null,
        leadTimeMax: form.leadTimeMax.trim() ? Number(form.leadTimeMax) : null,
        cbmPerUnit: form.cbmPerUnit.trim() ? Number(form.cbmPerUnit) : null,
        weightKgPerUnit: form.weightKgPerUnit.trim() ? Number(form.weightKgPerUnit) : null,
        packagingType: form.packagingType.trim() || null,
        defaultIncoterm: form.defaultIncoterm.trim() || null,
      });
      toast.success("Listing saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const moderate = async (status: "APPROVED" | "HIDDEN" | "REJECTED") => {
    setModBusy(true);
    try {
      await moderateProduct(id, status);
      toast.success(status === "APPROVED" ? "Listing approved" : status === "HIDDEN" ? "Listing paused" : "Listing delisted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setModBusy(false);
    }
  };

  const currency = product?.currency?.toUpperCase() ?? "CNY";
  const status = product ? listingCatalogStatus(product) : "pending";

  const hubOptions = useMemo(() => {
    const opts = originHubs.map((h) => ({ value: h.city, label: `${h.city} — ${h.hub}` }));
    if (form?.originHub && !opts.some((o) => o.value === form.originHub)) {
      opts.unshift({ value: form.originHub, label: form.originHub });
    }
    return opts;
  }, [originHubs, form?.originHub]);

  if (loading) {
    return (
      <AdminShell
        title="Edit listing"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Listings", to: "/admin/listings" },
          { label: listingRefId(id) },
        ]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!product || !form) {
    return (
      <AdminShell
        title="Edit listing"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Listings", to: "/admin/listings" },
          { label: listingRefId(id) },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>Product not found.</p>
      </AdminShell>
    );
  }

  const img = productImage(product);

  return (
    <AdminShell
      title="Edit listing"
      description={`Update catalog data for ${listingRefId(id)}.`}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Listings", to: "/admin/listings" },
        { label: listingRefId(id), to: `/admin/listings/${id}` as never },
        { label: "Edit" },
      ]}
      actions={<ListingPageActions id={id} active="edit" />}
    >
      <div
        className="mb-4 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <Link
          to="/admin/listings/$id"
          params={{ id }}
          className="inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
          style={{ color: T.navy }}
        >
          <ArrowLeft className="size-3.5" /> Back to listing
        </Link>
        <span style={{ color: T.border }}>|</span>
        {img ? <Thumb src={img} alt={product.title} size={40} /> : null}
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate text-[13px]" style={{ color: T.ink }}>
            {product.title}
          </p>
          <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            {listingRefId(id)} · SKU {primarySku(product)}
          </p>
        </div>
        {statusPillCatalog(status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-24">
        <div className="lg:col-span-2 space-y-4">
          <FormSection title="Product details" hint="Title, category, and buyer-facing copy.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" className="md:col-span-2">
                <Input value={form.title} onChange={(v) => setField("title", v)} placeholder="Product title" />
              </Field>
              <Field label="Category">
                <Select value={form.categoryId} onChange={(v) => setField("categoryId", v)}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tags" hint="Comma-separated marketplace tags">
                <Input value={form.tags} onChange={(v) => setField("tags", v)} placeholder="OEM, Wholesale, CE certified" />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <Textarea
                  value={form.description}
                  onChange={(v) => setField("description", v)}
                  rows={6}
                  placeholder="Describe materials, specs, packaging, and what is included."
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Pricing & inventory" hint="Amounts in listing currency. Stock is units available to sell.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={`Unit price (${currency})`}>
                <Input value={form.price} onChange={(v) => setField("price", v)} type="number" step="0.01" min="0" />
              </Field>
              <Field label="Minimum order (MOQ)">
                <Input value={form.moq} onChange={(v) => setField("moq", v)} placeholder="50 units" />
              </Field>
              <Field label="Stock on hand">
                <Input value={form.stock} onChange={(v) => setField("stock", v)} type="number" min="0" step="1" placeholder="0" />
              </Field>
              <Field label="Marketplace visibility">
                <label className="flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setField("active", e.target.checked)}
                    style={{ accentColor: T.navy }}
                  />
                  <span className="text-[12px] font-medium" style={{ color: T.ink }}>
                    Live on marketplace
                  </span>
                </label>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Logistics & fulfillment" hint="Used for freight estimates and buyer lead-time expectations.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Origin hub">
                <Select value={form.originHub} onChange={(v) => setField("originHub", v)}>
                  <option value="">Select hub</option>
                  {hubOptions.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Default incoterm">
                <Select value={form.defaultIncoterm} onChange={(v) => setField("defaultIncoterm", v)}>
                  {INCOTERMS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                  {!INCOTERMS.includes(form.defaultIncoterm) && form.defaultIncoterm ? (
                    <option value={form.defaultIncoterm}>{form.defaultIncoterm}</option>
                  ) : null}
                </Select>
              </Field>
              <Field label="Lead time min (days)">
                <Input value={form.leadTimeMin} onChange={(v) => setField("leadTimeMin", v)} type="number" min="0" />
              </Field>
              <Field label="Lead time max (days)">
                <Input value={form.leadTimeMax} onChange={(v) => setField("leadTimeMax", v)} type="number" min="0" />
              </Field>
              <Field label="CBM per unit">
                <Input value={form.cbmPerUnit} onChange={(v) => setField("cbmPerUnit", v)} type="number" step="0.001" min="0" />
              </Field>
              <Field label="Weight kg per unit">
                <Input value={form.weightKgPerUnit} onChange={(v) => setField("weightKgPerUnit", v)} type="number" step="0.01" min="0" />
              </Field>
              <Field label="Packaging type" className="md:col-span-2">
                {packagingTypes.length ? (
                  <Select value={form.packagingType} onChange={(v) => setField("packagingType", v)}>
                    <option value="">Select packaging</option>
                    {packagingTypes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    {form.packagingType && !packagingTypes.includes(form.packagingType) ? (
                      <option value={form.packagingType}>{form.packagingType}</option>
                    ) : null}
                  </Select>
                ) : (
                  <Input value={form.packagingType} onChange={(v) => setField("packagingType", v)} placeholder="Carton, pallet, roll…" />
                )}
              </Field>
            </div>
          </FormSection>

          {(product.variants?.length ?? 0) > 0 ? (
            <FormSection title="Variants" hint="SKU-level pricing is managed by the seller portal. View only here.">
              <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${T.border}` }}>
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: T.bg, color: T.muted }}>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Options</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants!.map((v) => (
                      <tr key={v.id} style={{ borderTop: `1px solid ${T.border}` }}>
                        <td className="px-3 py-2 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {v.sku ?? "—"}
                        </td>
                        <td className="px-3 py-2" style={{ color: T.sub }}>
                          {v.options ? JSON.stringify(v.options) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {fmtMoney(product.currency, v.priceMinor)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{v.stock ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Pill tone={v.active ? "success" : "neutral"}>{v.active ? "Active" : "Off"}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormSection>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <SectionLabel>Listing info</SectionLabel>
            <dl className="mt-3 space-y-2.5 text-[12px]">
              <MetaRow label="Listing ID" value={listingRefId(id)} mono />
              <MetaRow label="Internal ID" value={id.slice(0, 8) + "…"} mono />
              <MetaRow label="Primary SKU" value={primarySku(product)} mono />
              <MetaRow label="Currency" value={currency} />
              <MetaRow label="Current price" value={fmtMoney(product.currency, product.priceMinor)} mono />
              <MetaRow label="Created" value={new Date(product.createdAt).toLocaleDateString()} />
              <MetaRow label="Updated" value={product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "—"} />
            </dl>
          </Card>

          {product.store ? (
            <Card>
              <SectionLabel>Seller</SectionLabel>
              <Link
                to="/admin/sellers/$id"
                params={{ id: product.store.id }}
                className="mt-2 block text-[14px] font-bold hover:underline"
                style={{ color: T.ink }}
              >
                {product.store.name}
              </Link>
              <p className="mt-1 text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {sellerRefId(product.store.id)}
              </p>
            </Card>
          ) : null}

          <Card>
            <SectionLabel>Moderation</SectionLabel>
            <p className="mt-2 text-[12px]" style={{ color: T.sub }}>
              Quick actions without leaving the editor.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {!product.active ? (
                <ActionBtn disabled={modBusy} onClick={() => void moderate("APPROVED")} tone={T.success}>
                  Approve listing
                </ActionBtn>
              ) : null}
              {product.active ? (
                <ActionBtn disabled={modBusy} onClick={() => void moderate("HIDDEN")}>
                  Pause listing
                </ActionBtn>
              ) : null}
              <ActionBtn disabled={modBusy} onClick={() => void moderate("REJECTED")} tone={T.danger}>
                Delist product
              </ActionBtn>
            </div>
          </Card>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        style={{ background: T.surface, borderTop: `1px solid ${T.border}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.06)" }}
      >
        <p className="text-[12px]" style={{ color: dirty ? T.warn : T.muted }}>
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={resetForm}
            className="h-9 px-4 rounded-lg text-[12px] font-semibold disabled:opacity-40"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Discard
          </button>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() => void save()}
            className="h-9 px-4 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: T.navy }}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save changes
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <p className="text-[13px] font-bold" style={{ color: T.ink }}>
            {title}
          </p>
          {hint ? (
            <p className="mt-0.5 text-[11.5px]" style={{ color: T.muted }}>
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </Card>
  );
}

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </label>
      {hint ? (
        <p className="mt-0.5 mb-1 text-[10.5px]" style={{ color: T.muted }}>
          {hint}
        </p>
      ) : null}
      <div className={hint ? "" : "mt-1"}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: T.bg,
  border: `1px solid ${T.border}`,
  color: T.ink,
};

function Input({
  value,
  onChange,
  type = "text",
  step,
  min,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      step={step}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 rounded-lg text-[12px] outline-none focus:ring-2"
      style={inputStyle}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-y min-h-[120px] focus:ring-2"
      style={inputStyle}
    />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 rounded-lg text-[12px] outline-none"
      style={inputStyle}
    >
      {children}
    </select>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt style={{ color: T.muted }}>{label}</dt>
      <dd
        className="font-semibold tabular-nums text-right truncate max-w-[58%]"
        style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : undefined, color: T.ink }}
      >
        {value}
      </dd>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-9 px-3 rounded-lg text-[12px] font-semibold disabled:opacity-50"
      style={{
        background: tone ? `${tone}14` : T.bg,
        border: `1px solid ${tone ? `${tone}40` : T.border}`,
        color: tone ?? T.ink,
      }}
    >
      {children}
    </button>
  );
}
