import { hasApiAccess } from "@/helpers/access";
import { prisma } from "@/services/prisma";
import dayjs from "dayjs";
import { NextResponse, NextRequest } from "next/server";
import { jobQueue } from "../../../queues/job/route";
import { Prisma } from "@prisma/client";

export const POST = async (request: NextRequest) => {
  try {
    if (!hasApiAccess(request)) throw new Error("Forbidden Access");

    let { gameId }: { gameId: string | string[] } = await request.json();

    if (!gameId) {
      const games = await prisma.game.findMany({
        where: {
          OR: [
            { lastNews: { equals: Prisma.DbNull } },
            { data: { equals: Prisma.DbNull } },
            {
              updatedAt: {
                lt: dayjs().subtract(1, "day").startOf("day").toDate(),
              },
            },
          ],
        },
        take: 100,
      });

      gameId = games?.map((g) => g.id);
    }

    if (!gameId) throw Error("No gameId");

    gameId = Array.isArray(gameId) ? gameId : [gameId];

    await jobQueue.enqueueMany(
      gameId.map((id) => ({
        payload: {
          name: "updateGames",
          data: { gameId: id },
        },
        options: {
          id,
          delay: 300,
          // retry: ["7sec", "5min", "1h"],
          exclusive: true,
        },
      }))
    );

    // const game = await prisma.game.findFirst({ where: { id: gameId } });

    // if (!game?.referenceId) throw new Error("The game was not found");

    // const data = await getSteamGameData({ gameId: game.referenceId });

    // if (!data[game.referenceId]?.success)
    //   return new Response("No a steam data for " + game.title + `(${game.id})`);

    // const lastNews = await getSteamLastNews({ gameId: game.referenceId });

    // const gameData = data[game.referenceId].data;
    // const gameDataText = oneLine(
    //   removeTags(
    //     stringifyObject(
    //       { ...gameData, lastNews },
    //       {
    //         indent: " ",
    //         singleQuotes: false,
    //       }
    //     ).replace(/[']/g, "")
    //   )
    // );

    // if (!gameData) return new Response();

    // await prisma.game.update({
    //   where: { id: gameId },
    //   data: {
    //     data: gameData,
    //     lastNews,
    //     description: gameData?.detailed_description || "",
    //     referenceUpdatedAt:
    //       Array.isArray(lastNews) && lastNews.length > 0
    //         ? dayjs(lastNews[0].date * 1000).toISOString()
    //         : undefined,
    //   },
    // });

    // const { embedding, usage } = await openAI.generateEmbedding(
    //   gameData.toString()
    // );
    // console.debug("Embedding usage", gameId, usage);

    // const existedGameEmbedding = await prisma.gameEmbedding.findFirst({
    //   where: { gameId },
    // });

    // if (existedGameEmbedding) {
    //   await prisma.gameEmbedding.updateEmbedding({
    //     recordEmbeddingId: existedGameEmbedding.id,
    //     embedding,
    //     content: gameDataText,
    //   });

    //   console.log("[embedding:update]", gameId);
    // } else {
    //   await prisma.gameEmbedding.createEmbedding({
    //     gameId,
    //     embedding,
    //     content: gameDataText,
    //   });

    //   console.log("[embedding:create]", gameId);
    // }

    return NextResponse.json({ updated: gameId });
  } catch (e) {
    console.error(e);

    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden Access",
    });
  }
};

export const GET = async (request: NextRequest) => {
  try {
    // if (!hasApiAccess(request)) throw new Error("Forbidden Access");

    const games = await prisma.game.findMany({
      where: {
        OR: [
          { lastNews: { equals: Prisma.DbNull } },
          {
            updatedAt: {
              lt: dayjs().subtract(1, "day").startOf("day").toDate(),
            },
          },
        ],
      },
      take: 100,
    });

    let gameId = games?.map((g) => g.id);

    if (!gameId) throw Error("No gameId");

    gameId = Array.isArray(gameId) ? gameId : [gameId];

    await jobQueue.enqueueMany(
      gameId.map((id) => ({
        payload: {
          name: "updateGames",
          data: { gameId: id },
        },
        options: {
          id,
          delay: 300,
          // retry: ["7sec", "5min", "1h"],
          exclusive: true,
        },
      }))
    );

    return NextResponse.json({ updated: gameId });
  } catch (e) {
    console.error(e);

    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden Access",
    });
  }
};
