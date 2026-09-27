import { PageTitle, Panel } from "@/components/admin/ui";

export default function ReportsPage() {
  return (
    <>
      <PageTitle title="Reports" subtitle="Detailed analytics are coming soon" />
      <Panel className="py-16 text-center text-ink-500">
        Report exports and deeper analytics will land here. For now, the Overview dashboard covers hire request, candidate and message trends.
      </Panel>
    </>
  );
}
