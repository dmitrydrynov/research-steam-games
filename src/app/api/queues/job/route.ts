import { removeTags } from "@/helpers/text";
import logger from "@/lib/logger";
import { openAI } from "@/services/openai";
import { prisma } from "@/services/prisma";
import { getSteamGameData, getSteamLastNews } from "@/services/steam";
import { oneLine } from "common-tags";
import dayjs from "dayjs";
import { Queue } from "quirrel/next-app";
import stringifyObject from "stringify-object";

// const jsonToContent = (json: Record<string, any>) => {
//   const properties = Object.keys(json);
//   let text = "";

//   for (const prop in properties) {
//     const value = json[prop]
//     text += `${prop}: ${value}\n`;
//   }

//   return text;
// };

export const jobQueue = Queue(
  "api/queues/job",
  async (job: { name: "createEmbedding"; data: Record<string, any> }) => {
    try {
      if (job.name == "createEmbedding") {
        const { gameId, skipEmbedding } = job.data;

        const game = await prisma.game.findFirst({ where: { id: gameId } });

        if (!game) throw new Error("The game was not found");

        const data = await getSteamGameData({ gameId: game.referenceId });
        const lastNews = await getSteamLastNews({ gameId: game.referenceId });
        const gameData = data[game.referenceId].data;

        if (gameData) {
          const releaseDate = !gameData.release_date.coming_soon
            ? dayjs(gameData.release_date.date)
            : undefined;
          const referenceUpdatedAt =
            Array.isArray(lastNews) && lastNews.length > 0
              ? dayjs(lastNews[0].date * 1000)
              : releaseDate || dayjs();
          const gameDataText = oneLine(
            removeTags(
              stringifyObject(
                { ...gameData, lastNews },
                {
                  indent: " ",
                  singleQuotes: false,
                }
              ).replace(/[']/g, "")
            )
          );

          await prisma.game.update({
            where: { id: gameId },
            data: {
              data: gameData,
              description: gameData?.short_description || "",
              lastNews,
              updatedAt: dayjs().toISOString(),
              referenceUpdatedAt: referenceUpdatedAt.toISOString(),
            },
          });

          if (!skipEmbedding) {
            const { embedding } = await openAI.generateEmbedding(gameDataText);

            const existedGameEmbedding = await prisma.gameEmbedding.findFirst({
              where: { gameId },
            });

            if (existedGameEmbedding) {
              await prisma.gameEmbedding.updateEmbedding({
                recordEmbeddingId: existedGameEmbedding.id,
                embedding,
                content: gameDataText,
              });

              console.log("[embedding:update]", gameId);
            } else {
              await prisma.gameEmbedding.createEmbedding({
                gameId,
                embedding,
                content: gameDataText,
              });

              console.log("[embedding:create]", gameId);
            }
          }
        }
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
  {
    logger: {
      receivedJob(route, data) {
        console.log("[receivedJob]", route);
      },
      processingError: (r, d, error) => {
        console.error("[processingError]", error);
      },
    },
  }
);

export const POST = jobQueue;
