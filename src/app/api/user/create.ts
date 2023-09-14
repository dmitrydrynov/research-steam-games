import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prisma";
import { hashPassword } from "@/helpers/access";

export async function POST(req: NextRequest) {
  let errors = [];
  const { name, email, password } = req.body as any;

  if (password.length < 6) {
    errors.push("password length should be more than 6 characters");

    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: { ...req.body, password: hashPassword(password) },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
  }
}
