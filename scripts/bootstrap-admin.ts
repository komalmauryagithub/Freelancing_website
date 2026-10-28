import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function bootstrapAdmin() {
  const args = process.argv.slice(2);

  const email = args[0] || process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@vanguard.studio";
  const password = args[1] || process.env.ADMIN_BOOTSTRAP_PASSWORD || "VanguardAdmin2025!";
  const name = args[2] || "Vanguard System Administrator";

  if (!email || !password) {
    console.error("❌ Error: Admin email and password are required.");
    console.log("Usage: npx tsx scripts/bootstrap-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters long.");
    process.exit(1);
  }

  console.log(`🔐 Initiating secure server-side admin bootstrap for: ${email}`);

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      name,
    },
    create: {
      email,
      name,
      role: UserRole.ADMIN,
      passwordHash,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Admin user successfully provisioned!");
  console.log(`   ID:    ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log("🔒 Credentials never exposed to public endpoints.");
}

bootstrapAdmin()
  .catch((err) => {
    console.error("❌ Bootstrap failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
