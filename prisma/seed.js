/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const teamName = "SV Steinheim U13";
  const email = "demo.trainer@example.com";

  const team = await prisma.team.upsert({
    where: { name: teamName },
    update: {},
    create: { name: teamName },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: { activeTeamId: team.id },
    create: { email, activeTeamId: team.id },
  });

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: user.id, teamId: team.id } },
    update: { role: "TRAINER" },
    create: { userId: user.id, teamId: team.id, role: "TRAINER" },
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
