import styles from "./page.module.scss";
import { Button } from "antd";
import { LoginButton } from "@/components/buttons";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className={styles.main}>
      <h1>AI Games Research</h1>
      {!!session ? (
        <Link href="/chat">
          <Button>Go to app</Button>
        </Link>
      ) : (
        <LoginButton />
      )}
    </main>
  );
}
