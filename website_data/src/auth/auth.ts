import { readSecret } from "@/lib/secrets"
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: readSecret("NEXTAUTH_SECRET"),

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // 🔐 Look up user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        /**
         * ⚠️ PASSWORD CHECK PLACEHOLDER
         *
         * Right now you are not hashing passwords yet.
         * This is OK for DEV.
         *
         * When you add passwords:
         * - store hashed password on User
         * - verify here with bcrypt
         */

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // 👈 IMPORTANT
        }
      },
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
  async session({ session, user }) {
    if (session.user && user) {
      session.user.id = user.id as string
      session.user.role = user.role as "USER" | "ADMIN"
    }
    return session
    },
  },
}
