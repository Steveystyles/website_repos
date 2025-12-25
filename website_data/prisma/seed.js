const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding DEV database...")

  const passwordHash = await bcrypt.hash("devpassword", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@dev.local" },
    update: {
      passwordHash,
    },
    create: {
      email: "admin@dev.local",
      name: "Dev Admin",
      role: "ADMIN",
      passwordHash,
    },
  })

  console.log("✅ Seed complete")
  console.log("   Admin login:")
  console.log("   email: admin@dev.local")
  console.log("   password: devpassword")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
