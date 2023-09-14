import { SHA256 as sha256 } from "crypto-js";
import { prisma } from "@/services/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/helpers/access";

export default async function POST(req: NextRequest) {
  const { email, password } = req.body as any;

  if (!email || !password) {
    return NextResponse.json({ message: "invalid inputs" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
      },
    });
    if (user && user.password === hashPassword(password)) {
      const { password, ...other } = user;

      return NextResponse.json(other);
    } else {
      return NextResponse.json(
        { message: "invalid credentials" },
        { status: 401 }
      );
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
  }
}
