import { requireAdmin } from "@/lib/requireAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <aside
        style={{
          width: 260,
          padding: 24,
          borderRight: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "10px 0 30px -24px rgba(15, 23, 42, 0.35)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              marginBottom: 6,
            }}
          >
            Admin Console
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Overview</h2>
        </div>
        <nav style={{ display: "grid", gap: 10 }}>
          <a
            href="/admin"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              fontWeight: 600,
              color: "#0f172a",
              textDecoration: "none",
            }}
          >
            Dashboard
          </a>
          <a
            href="/admin/users"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              fontWeight: 600,
              color: "#0f172a",
              textDecoration: "none",
            }}
          >
            Users
          </a>
          <a
            href="/admin/maintenance"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              fontWeight: 600,
              color: "#0f172a",
              textDecoration: "none",
            }}
          >
            Maintenance
          </a>
        </nav>
      </aside>

      <main style={{ padding: 24, flex: 1 }}>{children}</main>
    </div>
  );
}
