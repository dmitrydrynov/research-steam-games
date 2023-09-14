import { jobQueue } from "@/app/api/queues/job/job";
import { ExtendedPrismaClient } from "@/services/prisma";
import { StoreProvider } from "@prisma/client";

export const seedSteamGames = async (prisma: ExtendedPrismaClient) => {
  const lastSteamGame = await prisma.game.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (lastSteamGame?.provider == StoreProvider.Steam) {
    // next job
  } else {
    await jobQueue.enqueue(
      {
        name: "fetchGames",
        params: { count: 10 },
      }
      // { delay: "24h" } // scheduling options
    );
  }

  // return prisma.$transaction([
  // prisma.gameSetting.createMany({
  //   data: [
  //     { name: "fairy" },
  //     { name: "fantasy" },
  //     { name: "oriental fantasy" },
  //     { name: "historic" },
  //     { name: "military" },
  //     { name: "real life" },
  //     { name: "aci-fi" },
  //     { name: "sport" },
  //     { name: "zombie" },
  //     { name: "other" },
  //   ],
  // }),
  // ]);
};
