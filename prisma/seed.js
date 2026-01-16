require("dotenv/config");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const teamName = "Jugendfussball";
  const email = "marcelbeil@gmx.de";

  const team = await prisma.team.upsert({
    where: { name: teamName },
    update: {},
    create: { name: teamName },
  });

  await prisma.user.upsert({
    where: { email },
    update: { role: "TRAINER", teamId: team.id },
    create: { email, role: "TRAINER", teamId: team.id },
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
