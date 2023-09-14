import styles from "./page.module.scss";
import { ChatContent } from "./content";

export default function Home() {
  return (
    <main className={styles.main}>
      <ChatContent />
    </main>
  );
}
