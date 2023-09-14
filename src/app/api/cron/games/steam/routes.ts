import { prisma } from "@/services/prisma";
import { fetchSteamGames } from "@/services/steam";
import { Prisma, StoreProvider } from "@prisma/client";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { jobQueue } from "../../../queues/job/route";
import { hasApiAccess } from "@/helpers/access";

export async function POST(req: NextRequest) {
  try {
    if (!hasApiAccess(req)) throw new Error("Forbidden Access");

    const { count, skipEmbedding = false, lastGameId } = await req.json();

    console.log("[games:fetch]", dayjs().format("DD/MM/YYYY"));

    const lastSteamGame = await prisma.game.findFirst({
      where: { provider: StoreProvider.Steam },
      orderBy: { id: "desc" },
    });

    console.log(
      "[games:fetch]",
      `Start with id: ${lastGameId || lastSteamGame?.referenceId}`
    );

    const steamGames = await fetchSteamGames({
      count: count || 25000,
      lastGameId: lastGameId || lastSteamGame?.referenceId,
    });

    if (steamGames?.length) {
      const data: Prisma.GameCreateManyInput[] = steamGames.map((game) => ({
        title: game.name,
        referenceId: game.appid.toString(),
        provider: StoreProvider.Steam,
      }));

      const existGames = await prisma.game.findMany({
        where: {
          provider: StoreProvider.Steam,
          referenceId: { in: data.map((item) => item.referenceId) },
        },
        select: { id: true, referenceId: true },
      });
      const existReferenceIds = existGames.map((item) => item.referenceId);

      const games = await prisma.$transaction([
        // create queries
        ...data
          .filter(
            (item) => existReferenceIds.includes(item.referenceId) == false
          )
          .map((item) => prisma.game.create({ data: item })),
        // update queries
        // ...data
        //   .filter((item) => existReferenceIds.includes(item.referenceId) == true)
        //   .map((item) =>
        //     prisma.game.update({
        //       where: {
        //         id: existGames.find((r) => r.referenceId === item.referenceId)
        //           ?.id,
        //       },
        //       data: item,
        //     })
        //   ),
      ]);

      if (!skipEmbedding) {
        jobQueue.enqueueMany(
          games.map((game) => ({
            payload: {
              name: "createEmbedding",
              data: { gameId: game.id, skipEmbedding },
            },
            options: {
              id: game.id,
              delay: 300,
              // retry: ["7sec", "5min", "1h"],
              exclusive: true,
            },
          }))
        );
      }

      console.log("[games:end]", {
        lastGameId: steamGames[steamGames.length - 1].appid,
      });
    } else {
      console.log("[games:end]", "no data");
      return NextResponse.json({ success: false, data: null });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);

    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden Access",
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    // if (!hasApiAccess(req)) throw new Error("Forbidden Access");

    console.log("[games:fetch]", dayjs().format("DD/MM/YYYY"));

    const lastSteamGame = await prisma.game.findFirst({
      where: { provider: StoreProvider.Steam },
      orderBy: { id: "desc" },
    });

    console.log(
      "[games:fetch]",
      `Start with id: ${lastSteamGame?.referenceId}`
    );

    const steamGames = await fetchSteamGames({
      count: 25000,
      lastGameId: lastSteamGame?.referenceId,
    });

    if (steamGames?.length) {
      const data: Prisma.GameCreateManyInput[] = steamGames.map((game) => ({
        title: game.name,
        referenceId: game.appid.toString(),
        provider: StoreProvider.Steam,
      }));

      const existGames = await prisma.game.findMany({
        where: {
          provider: StoreProvider.Steam,
          referenceId: { in: data.map((item) => item.referenceId) },
        },
        select: { id: true, referenceId: true },
      });
      const existReferenceIds = existGames.map((item) => item.referenceId);

      const games = await prisma.$transaction([
        ...data
          .filter(
            (item) => existReferenceIds.includes(item.referenceId) == false
          )
          .map((item) => prisma.game.create({ data: item })),
      ]);

      jobQueue.enqueueMany(
        games.map((game) => ({
          payload: {
            name: "createEmbedding",
            data: { gameId: game.id },
          },
          options: {
            id: game.id,
            delay: 300,
            exclusive: true,
          },
        }))
      );

      console.log("[games:end]", {
        lastGameId: steamGames[steamGames.length - 1].appid,
      });
    } else {
      console.log("[games:end]", "no data");
      return NextResponse.json({ success: false, data: null });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);

    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden Access",
    });
  }
}
