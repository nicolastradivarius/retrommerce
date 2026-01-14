import { Frame, Button, Cursor, Avatar } from "@react95/core";
import { User } from "@react95/icons";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import type { Locale } from "../dictionaries";
import styles from "./TopBar.module.css";

interface TopBarProps {
  lang: Locale;
  dict: {
    topBar: {
      hello: string;
    };
    auth: {
      login: string;
    };
  };
}

export default async function TopBar({ lang, dict }: TopBarProps) {
  const user = await getCurrentUserWithAvatar();

  return (
    <div className={styles.topBar}>
      <Frame className={styles.frame}>
        <div className={styles.content}>
          <Link href={`/`} className={styles.logo}>
            <h2 className={styles.logoText}>Retrommerce</h2>
          </Link>

          <div className={styles.userSection}>
            {user ? (
              <Link href={`/${lang}/user`} className={styles.userLink}>
                <div className={styles.userInfo}>
                  {user.avatar ? (
                    <div className={styles.avatarContainer}>
                      <Avatar
                        src={user.avatar}
                        alt={dict.topBar.hello}
                        className={styles.avatarImage}
                      />
                    </div>
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <User variant="16x16_4" />
                    </div>
                  )}
                  <span className={styles.welcomeText}>
                    {dict.topBar.hello} {user.name}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href={`/${lang}/login`}>
                <Button>{dict.auth.login}</Button>
              </Link>
            )}
          </div>
        </div>
      </Frame>
    </div>
  );
}
