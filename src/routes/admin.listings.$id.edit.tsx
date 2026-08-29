import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, SectionLabel } from "@/components/admin/Catalog";
import { ListingHeader, ListingPageActions, listingRefId } from "@/components/admin/ListingProfile";
import { fetchAdminCategories, fetchAdminProduct, fromMinor, updateAdminProduct, type AdminProduct } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Listing edit — MagnetPay Admin" }] }),
  component: Page,
});

type Category = { id: string; name: string };

function Page() {
  const { id } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [originHub, setOriginHub] = useState("");
  const [leadTimeMin, setLeadTimeMin] = useState("");
  const [leadTimeMax, setLeadTimeMax] = useState("");
  const [cbmPerUnit, setCbmPerUnit] = useState("");
  const [weightKgPerUnit, setWeightKgPerUnit] = useState("");
  const [packagingType, setPackagingType] = useState("");
  const [defaultIncoterm, setDefaultIncoterm] = useState("");
  const [active, setActive] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, cats] = await Promise.all([
        fetchAdminProduct(id),
        fetchAdminCategories().catch(() => []),
      ]);
      setProduct(p);
      setCategories((cats as Category[]).map((c) => ({ id: c.id, name: c.name })));
      setTitle(p.title);
      setDescription(p.description ?? "");
      setPrice(String(fromMinor(p.priceMinor)));
      setMoq(p.moq ?? "");
      setStock(p.stock != null ? String(p.stock) : "");
      setCategoryId(p.category?.id ?? "");
      setOriginHub(p.originHub ?? "");
      setLeadTimeMin(p.leadTimeMin != null ? String(p.leadTimeMin) : "");
      setLeadTimeMax(p.leadTimeMax != null ? String(p.leadTimeMax) : "");
      setCbmPerUnit(p.cbmPerUnit != null ? String(p.cbmPerUnit) : "");
      setWeightKgPerUnit(p.weightKgPerUnit != null ? String(p.weightKgPerUnit) : "");
      setPackagingType(p.packagingType ?? "");
      setDefaultIncoterm(p.defaultIncoterm ?? "");
      setActive(p.active);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const priceMinor = Math.round(Number(price) * 100);
      if (!Number.isFinite(priceMinor) || priceMinor < 0) {
        toast.error("Enter a valid price");
        return;
      }
      await updateAdminProduct(id, {
        title: title.trim(),
        description: description.trim() || null,
        priceMinor,
        moq: moq.trim() || undefined,
        stock: stock.trim() ? Number(stock) : null,
        categoryId: categoryId || null,
        active,
        originHub: originHub.trim() || null,
        leadTimeMin: leadTimeMin.trim() ? Number(leadTimeMin) : null,
        leadTimeMax: leadTimeMax.trim() ? Number(leadTimeMax) : null,
        cbmPerUnit: cbmPerUnit.trim() ? Number(cbmPerUnit) : null,
        weightKgPerUnit: weightKgPerUnit.trim() ? Number(weightKgPerUnit) : null,
        packagingType: packagingType.trim() || null,
        defaultIncoterm: defaultIncoterm.trim() || null,
      });
      toast.success("Listing updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

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

  const fieldStyle: React.CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.ink,
  };

  if (!product) {
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

  return (
    <AdminShell
      title={product.title}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Listings", to: "/admin/listings" },
        { label: listingRefId(id), to: `/admin/listings/${id}` as never },
        { label: "Edit" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <ListingPageActions id={id} active="edit" />
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 text-white disabled:opacity-50"
            style={{ background: T.navy }}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save changes
          </button>
        </div>
      }
    >
      <ListingHeader product={product} />
      <Card className="mt-4">
        <SectionLabel>Catalog fields</SectionLabel>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
          <EditField label="Title" value={title} onChange={setTitle} />
          <EditField label="MOQ" value={moq} onChange={setMoq} />
          <EditField label="Price (major units)" value={price} onChange={setPrice} type="number" step="0.01" />
          <EditField label="Stock" value={stock} onChange={setStock} type="number" />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] outline-none"
              style={fieldStyle}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 h-9">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: T.navy }} />
              <span className="font-medium" style={{ color: T.ink }}>Live on marketplace</span>
            </label>
          </div>
          <EditField label="Origin hub" value={originHub} onChange={setOriginHub} />
          <EditField label="Lead time min (days)" value={leadTimeMin} onChange={setLeadTimeMin} type="number" />
          <EditField label="Lead time max (days)" value={leadTimeMax} onChange={setLeadTimeMax} type="number" />
          <EditField label="CBM / unit" value={cbmPerUnit} onChange={setCbmPerUnit} type="number" step="0.001" />
          <EditField label="Weight kg / unit" value={weightKgPerUnit} onChange={setWeightKgPerUnit} type="number" step="0.01" />
          <EditField label="Packaging type" value={packagingType} onChange={setPackagingType} />
          <EditField label="Default incoterm" value={defaultIncoterm} onChange={setDefaultIncoterm} />
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-y"
              style={fieldStyle}
            />
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] outline-none"
        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
      />
    </div>
  );
}
