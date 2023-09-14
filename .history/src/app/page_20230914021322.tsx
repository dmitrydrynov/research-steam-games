import styles from "./page.module.scss";
import { Button, Typography } from "antd";
import { LoginButton } from "@/components/buttons";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className={styles.main}>
      <h1>AI Games Research</h1>
      {!!session?.user ? (
        <Link href="/chat">
          <Button>Go to app</Button>
        </Link>
      ) : (
        <LoginButton />
      )}
    </main>
  );
}
