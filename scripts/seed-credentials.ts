import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedCredentials() {
  console.log("🔐 Provisioning verified accounts in Neon PostgreSQL...");

  const adminHash = await bcrypt.hash("VanguardAdmin2025!", 12);
  const clientHash = await bcrypt.hash("Client2025!", 12);
  const freelancerHash = await bcrypt.hash("Freelancer2025!", 12);

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@vanguard.studio" },
    update: {
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "admin@vanguard.studio",
      name: "Vanguard System Administrator",
      role: UserRole.ADMIN,
      passwordHash: adminHash,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin: ${admin.email} (Password: VanguardAdmin2025!)`);

  // 2. Sample Client (Sarah Chen)
  const sarah = await prisma.user.upsert({
    where: { email: "sarah.chen@novatech.sample" },
    update: {
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "sarah.chen@novatech.sample",
      name: "Sarah Chen (Sample Client)",
      role: UserRole.CLIENT,
      passwordHash: clientHash,
      company: "NovaTech Solutions",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Client (Sarah): ${sarah.email} (Password: Client2025!)`);

  // 3. Simple Client (client@example.com)
  const simpleClient = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "client@example.com",
      name: "Demo Client",
      role: UserRole.CLIENT,
      passwordHash: clientHash,
      company: "Acme Corp",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Client (Demo): ${simpleClient.email} (Password: Client2025!)`);

  // 4. Freelancer (Alex Vance)
  const alex = await prisma.user.upsert({
    where: { email: "alex@creativefreelancer.sample" },
    update: {
      passwordHash: freelancerHash,
      role: UserRole.FREELANCER,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "alex@creativefreelancer.sample",
      name: "Alex Vance (Lead Freelance Engineer)",
      role: UserRole.FREELANCER,
      passwordHash: freelancerHash,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Freelancer: ${alex.email} (Password: Freelancer2025!)`);

  console.log("\n🎉 All test accounts successfully configured and ready to log in!");
}

seedCredentials()
  .catch((err) => {
    console.error("❌ Seed credentials failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
