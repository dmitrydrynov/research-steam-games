import { removeTags } from "@/helpers/text";
import { openAI } from "@/services/openai";
import { prisma } from "@/services/prisma";
import { getSteamGameData, getSteamLastNews } from "@/services/steam";
import { oneLine } from "common-tags";
import dayjs from "dayjs";
import { Queue } from "quirrel/next-app";
import stringifyObject from "stringify-object";

export const jobQueue = Queue(
  "api/queues/job",
  async (job: { name: "updateGames"; data: Record<string, any> }) => {
    try {
      if (job.name == "updateGames") {
        const { gameId, skipEmbedding } = job.data;

        const game = await prisma.game.findFirst({ where: { id: gameId } });

        if (!game) throw new Error("The game was not found");

        const data = await getSteamGameData({ gameId: game.referenceId });
        const lastNews = await getSteamLastNews({ gameId: game.referenceId });
        const gameData = data[game.referenceId].data;

        if (gameData) {
          const {
            header_image,
            capsule_image,
            capsule_imagev5,
            screenshots,
            movies,
            background,
            background_raw,
            ...paramsForEmbedding
          } = gameData;

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
                { ...paramsForEmbedding, lastNews },
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
      throw error;
    }
  },
  {
    logger: {
      receivedJob(route, data) {
        console.log("[quirrel:receivedJob]", route);
      },
      processingError: (r, d, error) => {
        console.error("[quirrel:processingError]", error);
      },
    },
  }
);

export const POST = jobQueue;
