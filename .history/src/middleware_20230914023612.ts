import { withAuth } from "next-auth/middleware";

// middleware is applied to all routes, use conditionals to select

export default withAuth(function middleware(req) {}, {
  callbacks: {
    authorized: ({ req, token }) => {
      console.log("token", token);

      if (req.nextUrl.pathname.startsWith("/chat") && token === null) {
        return false;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/chat"],
};
