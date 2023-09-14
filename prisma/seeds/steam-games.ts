import { ExtendedPrismaClient } from "@/services/prisma";

export const seedSteamGames = async (prisma: ExtendedPrismaClient) => {
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
