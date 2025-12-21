import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

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

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px -20px rgba(15, 23, 42, 0.35)",
  } as const;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 64px",
        color: "#0f172a",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: 12,
            fontWeight: 600,
            color: "#64748b",
            marginBottom: 8,
          }}
        >
          Admin Console
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "#64748b", maxWidth: 520 }}>
          Monitor system health, manage users, and keep operations on track from a
          single workspace.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            User Management
          </h3>
          <p style={{ color: "#475569", marginBottom: 16 }}>
            Review accounts, promote admins, and reset credentials.
          </p>
          <a href="/admin/users" style={{ color: "#2563eb", fontWeight: 600 }}>
            Open users →
          </a>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            System Overview
          </h3>
          <p style={{ color: "#475569", marginBottom: 16 }}>
            See environment, database, and session details at a glance.
          </p>
          <a
            href="#system-status"
            style={{ color: "#2563eb", fontWeight: 600 }}
          >
            Jump to system status →
          </a>
        </div>

        <div style={cardStyle}>
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
        </div>
      </section>

      <section id="system-status" style={{ marginTop: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            System Status
          </h2>
          <p style={{ color: "#64748b", maxWidth: 520 }}>
            Real-time environment and infrastructure snapshots for the admin
            team.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Environment
            </h3>
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
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Application
            </h3>
            <ul style={{ display: "grid", gap: 8 }}>
              <li>
                <strong>Name:</strong> {appName}
              </li>
            </ul>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Database
            </h3>
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
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Current Session
            </h3>
            <ul style={{ display: "grid", gap: 8 }}>
              <li>
                <strong>User:</strong> {session.user.email}
              </li>
              <li>
                <strong>Role:</strong> {session.user.role}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
