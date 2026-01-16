/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const teamName = "SV Steinheim U13";
  const DEMO_ADMIN_EMAIL = "demo.trainer@example.com";
  const DEMO_ADMIN_PASSWORD = "Demo1234!"; // nur fuer Dev/Stage
  const DEMO_ADMIN_HASH = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  // Achtung: Demo-Admin-Login nur fuer Entwicklung, in Prod spaeter ersetzen/abschalten.

  const team = await prisma.team.upsert({
    where: { name: teamName },
    update: {},
    create: { name: teamName },
  });

  const demoAdmin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: {
      activeTeamId: team.id,
      isSystemAdmin: true,
      passwordHash: DEMO_ADMIN_HASH,
    },
    create: {
      email: DEMO_ADMIN_EMAIL,
      activeTeamId: team.id,
      isSystemAdmin: true,
      passwordHash: DEMO_ADMIN_HASH,
    },
  });

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: demoAdmin.id, teamId: team.id } },
    update: { role: "TRAINER" },
    create: { userId: demoAdmin.id, teamId: team.id, role: "TRAINER" },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
