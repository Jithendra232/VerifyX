import {
  DashboardPage,
  Panel,
  SimpleTable,
  StatusBadge,
} from "../../components/dashboard/DashboardUI";
import { useAuthSync } from "../../context/AuthSyncContext";

function UserProfilePage() {
  const { mongoUser, clerkUser } = useAuthSync();

  const rows = [
    { id: "name", label: "Name", value: mongoUser?.name || clerkUser?.fullName || "-" },
    { id: "email", label: "Email", value: mongoUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || "-" },
    { id: "role", label: "Role", value: mongoUser?.role || "-" },
    { id: "account", label: "Account ID", value: mongoUser?._id || "-" },
  ];

  return (
    <DashboardPage
      title="User Profile"
      subtitle="Account identity and role details synced for dashboard access."
    >
      <Panel title="Profile Details" subtitle="Current account information.">
        <SimpleTable
          columns={[
            { key: "label", header: "Field", render: (row) => row.label },
            {
              key: "value",
              header: "Value",
              render: (row) =>
                row.id === "role" ? <StatusBadge tone="info">{row.value}</StatusBadge> : row.value,
            },
          ]}
          rows={rows}
          emptyTitle="No profile details"
          emptyDescription="Profile information will appear after account sync."
        />
      </Panel>
    </DashboardPage>
  );
}

export default UserProfilePage;
