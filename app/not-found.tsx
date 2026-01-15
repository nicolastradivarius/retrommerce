import { Frame, TitleBar, Button } from "@react95/core";
import { Computer3, Warning } from "@react95/icons";
import Link from "next/link";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "./[lang]/components/BottomNav";
import styles from "./not-found.module.css";

export default async function NotFound() {
  const user = await getCurrentUserWithAvatar();

  return (
    <div className={styles.container}>
      <BottomNav
        lang="en"
        dict={
          {
            start: "Start",
            products: "Products",
            myProfile: "My Profile",
            userPanel: "User Panel",
            login: "Login",
          }
        }
        user={user}
      />
      <div className={styles.window}>
        <TitleBar
          active
          icon={<Computer3 variant="16x16_4" />}
          title="Error 404 - Page not found"
        />
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
            <Link href="/products">
              <Button>Back to home</Button>
            </Link>
          </div>
        </Frame>
      </div>
    </div>
  );
}
