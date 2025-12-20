import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

export async function requireAdminApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  return session;
}
