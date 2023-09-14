import { NextRequest } from "next/server";

export const hasApiAccess = (req: NextRequest) => {
  const accessToken = Buffer.from(process.env.SECRET_KEY as string).toString(
    "base64"
  );

  return (
    req.headers.has("authorization") &&
    req.headers.get("authorization") === "Bearer " + accessToken
  );
};
