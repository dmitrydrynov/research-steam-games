import { NextRequest } from "next/server";
import { SHA256 as sha256 } from "crypto-js";

export const hasApiAccess = (req: NextRequest) => {
  const accessToken = Buffer.from(process.env.SECRET_KEY as string).toString(
    "base64"
  );

  return (
    req.headers.has("authorization") &&
    req.headers.get("authorization") === "Bearer " + accessToken
  );
};

// We hash the user entered password using crypto.js
export const hashPassword = (string: string) => {
  return sha256(string).toString();
};
