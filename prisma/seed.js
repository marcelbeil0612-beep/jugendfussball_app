require("dotenv/config");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "marcelbeil@gmx.de";

  await prisma.user.upsert({
    where: { email },
    update: { role: "TRAINER" },
    create: { email, role: "TRAINER" },
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
