import { useAdminMe } from "@/lib/admin";
import { PageTitle, Panel } from "@/components/admin/ui";

export default function SettingsPage() {
  const { data } = useAdminMe();
  return (
    <>
      <PageTitle title="Settings" subtitle="Account and workspace preferences" />
      <Panel className="max-w-md">
        <h2 className="font-bold text-ink-950">Signed in as</h2>
        <p className="mt-1 text-sm text-ink-700">{data?.user.name}</p>
        <p className="text-sm text-ink-500">{data?.user.email}</p>
        <p className="mt-6 text-sm text-ink-500">Notification preferences, team members and integrations will be managed here.</p>
      </Panel>
    </>
  );
}
