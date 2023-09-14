import { prisma } from "@/services/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  jwt: { maxAge: 60 * 60 * 24 * 30 },
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     email: {
    //       label: "Email",
    //       type: "email",
    //       placeholder: "your@email.com",
    //     },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     const userCredentials = {
    //       email: credentials?.email,
    //       password: credentials?.password,
    //     };

    //     const res = await fetch(
    //       `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/user/login`,
    //       {
    //         method: "POST",
    //         body: JSON.stringify(userCredentials),
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );

    //     const user = await res.json();

    //     if (res.ok && user) {
    //       return user;
    //     } else {
    //       return null;
    //     }
    //   },
    // }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (user !== null) {
        session.user = user;
      }

      return session;
    },
    jwt: ({ token }) => {
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
