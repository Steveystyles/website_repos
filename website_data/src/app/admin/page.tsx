import { requireAdmin } from "@/lib/requireAdmin"

export default async function AdminPage() {
  const session = await requireAdmin()

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.email}</p>
    </div>
  )
}
