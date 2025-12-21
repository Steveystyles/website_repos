"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AdminSectionHeader,
  AdminStatCard,
} from "@/components/admin/AdminComponents";


export async function createUser(formData: FormData) {
  const session = await requireAdmin();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string | null;
  const role = formData.get("role") as "USER" | "ADMIN";
  const password = formData.get("password") as string;

  if (!email || !password || !role) {
    throw new Error("Missing required fields");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      role,
      passwordHash,
    },
  });

  revalidatePath("/admin/users");
}
export async function deleteUser(formData: FormData) {
  const session = await requireAdmin();

  const userId = formData.get("userId") as string;
  const confirmed = formData.get("confirm") === "on";

  if (!userId) {
    throw new Error("Missing user ID");
  }

  // Prevent self-deletion
  if (session.user.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  // Require explicit confirmation
  if (!confirmed) {
    return; // silently do nothing
  }

  // Prevent deleting the last admin
  const adminCount = await prisma.user.count({
    where: { role: "ADMIN" },
  });

  const target = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (target?.role === "ADMIN" && adminCount <= 1) {
    throw new Error("Cannot delete the last admin");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}

export async function updateUserRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "USER" | "ADMIN";

  if (!userId || !role) {
    throw new Error("Invalid form submission");
  }

  const session = await requireAdmin();

  if (session.user.id === userId) {
    throw new Error("You cannot change your own role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  // 🔥 THIS is the key line
  revalidatePath("/admin/users");
}

export async function resetUserPassword(formData: FormData) {
  const session = await requireAdmin();

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("password") as string;

  if (!userId || !newPassword) {
    throw new Error("Missing password reset data");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/users");
}

/**
 * Page Component (Server Component)
 * Renders the UI
 */
export default async function AdminUsersPage() {
  // Extra safety — layout already enforces admin
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: { email: "asc" },
  });

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const standardUsers = totalUsers - adminUsers;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="User Management"
        description="Create accounts, control admin access, and reset credentials. Changes apply instantly across the platform."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Total users", value: totalUsers },
          { label: "Admins", value: adminUsers },
          { label: "Standard users", value: standardUsers },
        ].map((stat) => (
          <AdminStatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <AdminCard style={{ marginBottom: 24 }}>
        <AdminSectionHeader
          title="Add a new user"
          description="Invite someone by creating their account and assigning a role."
        />

        <form
          action={createUser}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <input
            name="email"
            placeholder="Email address"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              background: "#f8fafc",
            }}
          />
          <input
            name="name"
            placeholder="Full name"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              background: "#f8fafc",
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Temporary password"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              background: "#f8fafc",
            }}
          />
          <select
            name="role"
            defaultValue="USER"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5f5",
              background: "#f8fafc",
            }}
          >
            <option value="USER">Standard user</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#0f172a",
              color: "#f8fafc",
              fontWeight: 600,
            }}
          >
            Create user
          </button>
        </form>
      </AdminCard>

      <AdminCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <AdminSectionHeader
            title="Users"
            description="View and manage account access."
            marginBottom={0}
          />
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 10px",
          }}
        >
          <thead>
            <tr style={{ textTransform: "uppercase", fontSize: 11, color: "#64748b" }}>
              <th align="left" style={{ paddingLeft: 8 }}>
                User
              </th>
              <th align="left">Role</th>
              <th align="right" style={{ paddingRight: 8 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
              return (
                <tr
                  key={user.id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                  }}
                >
                  <td style={{ padding: "14px 8px" }}>
                    <div style={{ fontWeight: 600 }}>{user.email}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {user.name ?? "No name on file"}
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor:
                          user.role === "ADMIN" ? "#fee2e2" : "#e0f2fe",
                        color:
                          user.role === "ADMIN" ? "#991b1b" : "#075985",
                      }}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Standard"}
                    </span>
                  </td>
                  <td align="right" style={{ paddingRight: 8 }}>
                    <details style={{ position: "relative", display: "inline-block" }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          listStyle: "none",
                          padding: "8px 12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          background: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        Manage ▾
                      </summary>

                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          marginTop: 8,
                          minWidth: 240,
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: 12,
                          boxShadow:
                            "0 20px 30px -20px rgba(15, 23, 42, 0.4)",
                          zIndex: 10,
                        }}
                      >
                        <form action={updateUserRole} style={{ marginBottom: 12 }}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="role" value={nextRole} />

                          <button
                            type="submit"
                            disabled={session.user.id === user.id}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              textAlign: "left",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              cursor:
                                session.user.id === user.id
                                  ? "not-allowed"
                                  : "pointer",
                              color:
                                session.user.id === user.id
                                  ? "#94a3b8"
                                  : "#0f172a",
                              fontWeight: 600,
                            }}
                          >
                            {user.role === "ADMIN"
                              ? "Demote to standard"
                              : "Promote to admin"}
                          </button>
                        </form>

                        <div style={{ borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />

                        <form action={resetUserPassword} style={{ marginBottom: 12 }}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input
                            type="password"
                            name="password"
                            placeholder="New password"
                            required
                            style={{
                              width: "100%",
                              marginBottom: 8,
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "#ffffff",
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            Reset password
                          </button>
                        </form>

                        <div style={{ borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />

                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <label
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            <input type="checkbox" name="confirm" /> I understand this
                            is permanent
                          </label>
                          <button
                            type="submit"
                            disabled={session.user.id === user.id}
                            style={{
                              marginTop: 8,
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1px solid #fecaca",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontWeight: 600,
                              cursor:
                                session.user.id === user.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            Delete user
                          </button>
                        </form>
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminCard>
    </AdminPageShell>
  );
}
