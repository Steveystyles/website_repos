import { requireAdmin } from "@/auth/requireAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          padding: 20,
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h2>Admin</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="/admin">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/system">System</a>
          <a href="/admin/maintenance">Maintenance</a>
        </nav>
      </aside>

      <main style={{ padding: 24, flex: 1 }}>{children}</main>
    </div>
  );
}
