import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import {
  AdminCard,
  AdminInfoCard,
  AdminPageHeader,
  AdminPageShell,
  AdminSectionHeader,
} from "@/components/admin/AdminComponents";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  const environment =
    process.env.NODE_ENV === "production" ? "PROD" : "DEV";

  const appName = "Website";
  const nodeVersion = process.version;

  let dbStatus: "OK" | "ERROR" = "OK";
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "ERROR";
    dbError = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor system health, manage users, and keep operations on track from a single workspace."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <AdminCard>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            User Management
          </h3>
          <p style={{ color: "#475569", marginBottom: 16 }}>
            Review accounts, promote admins, and reset credentials.
          </p>
          <a href="/admin/users" style={{ color: "#2563eb", fontWeight: 600 }}>
            Open users →
          </a>
        </AdminCard>

        <AdminCard>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Maintenance
          </h3>
          <p style={{ color: "#475569", marginBottom: 16 }}>
            Run scheduled jobs and keep services tidy.
          </p>
          <a
            href="/admin/maintenance"
            style={{ color: "#2563eb", fontWeight: 600 }}
          >
            Manage maintenance →
          </a>
        </AdminCard>
      </section>

      <section id="system-status" style={{ marginTop: 8 }}>
        <AdminSectionHeader
          title="System Status"
          description="Real-time environment and infrastructure snapshots for the admin team."
          size="lg"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <AdminInfoCard title="Environment">
            <ul style={{ display: "grid", gap: 8, color: "#0f172a" }}>
              <li>
                <strong>Mode:</strong>{" "}
                <span
                  style={{
                    color: environment === "PROD" ? "#991b1b" : "#075985",
                    fontWeight: 600,
                  }}
                >
                  {environment}
                </span>
              </li>
              <li>
                <strong>Node.js:</strong> {nodeVersion}
              </li>
            </ul>
          </AdminInfoCard>

          <AdminInfoCard title="Application">
            <ul style={{ display: "grid", gap: 8 }}>
              <li>
                <strong>Name:</strong> {appName}
              </li>
            </ul>
          </AdminInfoCard>

          <AdminInfoCard title="Database">
            <ul style={{ display: "grid", gap: 8 }}>
              <li>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: dbStatus === "OK" ? "#065f46" : "#991b1b",
                    fontWeight: 600,
                  }}
                >
                  {dbStatus}
                </span>
              </li>
              {dbError && (
                <li style={{ color: "#991b1b" }}>
                  <strong>Error:</strong> {dbError}
                </li>
              )}
            </ul>
          </AdminInfoCard>

          <AdminInfoCard title="Current Session">
            <ul style={{ display: "grid", gap: 8 }}>
              <li>
                <strong>User:</strong> {session.user.email}
              </li>
              <li>
                <strong>Role:</strong> {session.user.role}
              </li>
            </ul>
          </AdminInfoCard>
        </div>
      </section>
    </AdminPageShell>
  );
}
