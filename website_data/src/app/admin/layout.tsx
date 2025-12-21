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
        <h2>Admin</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="/admin">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin#system-status">System</a>
          <a href="/admin/maintenance">Maintenance</a>
        </nav>
      </aside>

      <main style={{ padding: 24, flex: 1 }}>{children}</main>
    </div>
  );
}
