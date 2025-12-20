export default function AdminDashboard() {
  return (
    <>
      <h1>Admin Dashboard</h1>
      <p>Administrative overview and tools.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <section>
          <h3>Users</h3>
          <p>Manage accounts and roles.</p>
        </section>

        <section>
          <h3>System</h3>
          <p>View application status.</p>
        </section>

        <section>
          <h3>Maintenance</h3>
          <p>Run administrative jobs.</p>
        </section>
      </div>
    </>
  );
}
