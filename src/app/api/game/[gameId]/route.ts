import { NextRequest, NextResponse } from "next/server";
import { openAI } from "@/services/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/services/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const session = getServerSession(authOptions);

    if (!session) throw new Error("Forbidden Access");

    const game = await prisma.game.findUnique({ where: { id: params.gameId } });

    return NextResponse.json(game);
  } catch (e) {
    console.error(e);

    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden Access",
    });
  }
}
