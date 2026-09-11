import { useAdminPlans, usePlanUpsert, type AdminPlan } from "@/lib/admin";
import { PageTitle, Panel } from "@/components/admin/ui";
import { Spinner } from "@/components/ui/Spinner";
import { Input, Textarea, Checkbox } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

function PlanForm({ p }: { p: AdminPlan }) {
  const upsert = usePlanUpsert();
  return (
    <Panel>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          upsert.mutate({
            slug: p.slug,
            name: fd.get("name"),
            tagline: fd.get("tagline"),
            priceAed: Number(fd.get("priceAed")),
            priceSar: Number(fd.get("priceSar")),
            features: String(fd.get("features")).split("\n").map((s) => s.trim()).filter(Boolean),
            footnote: fd.get("footnote") || undefined,
            isPopular: fd.get("isPopular") === "on",
            isActive: fd.get("isActive") === "on",
            sortOrder: p.sortOrder,
          });
        }}
      >
        <h2 className="h-serif text-xl text-ink-950 sm:col-span-2">{p.name}</h2>
        <Input label="Name" name="name" defaultValue={p.name} />
        <Input label="Tagline" name="tagline" defaultValue={p.tagline} />
        <Input label="Price (AED)" name="priceAed" type="number" min={0} defaultValue={p.priceAed} />
        <Input label="Price (SAR)" name="priceSar" type="number" min={0} defaultValue={p.priceSar} />
        <Textarea label="Features (one per line)" name="features" defaultValue={p.features.join("\n")} wrapClassName="sm:col-span-2" />
        <Input label="Footnote" name="footnote" defaultValue={p.footnote ?? ""} wrapClassName="sm:col-span-2" />
        <Checkbox label="Most popular badge" name="isPopular" defaultChecked={p.isPopular} />
        <Checkbox label="Active (visible on website)" name="isActive" defaultChecked={p.isActive} />
        <div className="sm:col-span-2">
          <Button type="submit" size="sm" loading={upsert.isPending}>
            Save {p.name}
          </Button>
          {upsert.isSuccess && <span className="ml-3 text-sm text-forest-700">Saved</span>}
        </div>
      </form>
    </Panel>
  );
}

export default function PlansAdminPage() {
  const { data, isLoading } = useAdminPlans();
  return (
    <>
      <PageTitle title="Plans" subtitle="Pricing shown on the website, in AED and SAR" />
      {isLoading ? <Spinner /> : <div className="grid gap-6 xl:grid-cols-3">{data?.map((p) => <PlanForm key={p.id} p={p} />)}</div>}
    </>
  );
}
