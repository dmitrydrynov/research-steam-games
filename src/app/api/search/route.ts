import { NextRequest, NextResponse } from "next/server";
import { openAI } from "@/services/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = getServerSession(authOptions);

    if (!session) throw new Error("Forbidden Access");

    const { query } = await req.json();
    let result: any = "";

    if (query && query.length > 0) {
      result = await openAI.searchGames(query);
      console.debug("Completion usage", query, result?.usage);
    }

    return NextResponse.json({ data: result });
  } catch (e) {
    console.error(e);

    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden Access",
    });
  }
}
