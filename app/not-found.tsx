import { Frame, TitleBar, Button, Cursor } from "@react95/core";
import { Computer3, Warning } from "@react95/icons";
import Link from "next/link";
import styles from "./not-found.module.css";

export default async function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <TitleBar
          active
          icon={<Computer3 variant="16x16_4" />}
          title="Error 404 - Page not found"
        >
          <TitleBar.OptionsBox>
            <TitleBar.Minimize />
            <TitleBar.Restore />
            <TitleBar.Close />
          </TitleBar.OptionsBox>
        </TitleBar>
        <Frame className={styles.windowContent}>
          <div className={styles.errorContent}>
            <div className={styles.iconSection}>
              <Warning variant="32x32_4" />
            </div>
            <div className={styles.messageSection}>
              <p className={styles.errorTitle}>
                We cannot find the page you requested.
              </p>
              <p className={styles.errorMessage}>
                The page you are looking for might have been removed, renamed,
                or is temporarily unavailable.
              </p>
              <p className={styles.errorCode}>
                Error code: HTTP 404 - File not found
              </p>
            </div>
          </div>

          <div className={styles.separator} />

          <div className={styles.actions}>
            <Link href="/products" className={Cursor.Pointer}>
              <Button className={Cursor.Pointer}>Back to home</Button>
            </Link>
          </div>
        </Frame>
      </div>
    </div>
  );
}
