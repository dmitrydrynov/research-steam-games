import { prisma } from "@/services/prisma";
import { seedSteamGames } from "./seeds/steam-games";

async function main() {
  await seedSteamGames(prisma);
  console.log("Steam Games was added");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
