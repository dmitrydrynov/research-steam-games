import "./globals.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/utils/provider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import StyledComponentsRegistry from "@/lib/AntdRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Games Research App",
  description: "Games Research App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <StyledComponentsRegistry>
            <Header />
            <main>{children}</main>
            <Footer />
          </StyledComponentsRegistry>
        </Providers>
      </body>
    </html>
  );
}
