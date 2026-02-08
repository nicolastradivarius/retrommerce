import { Frame, Cursor } from "@react95/core";
import { Settings, Computer, FolderOpen, User } from "@react95/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import LogoutButton from "../_components/LogoutButton";
import { getDictionary, hasLocale } from "../dictionaries";
import styles from "./page.module.css";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="500px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <Settings variant="32x32_4" />
            <div>
              <h1 className={styles.title}>{dict.admin.title}</h1>
              <span className={styles.badge}>{dict.admin.badge}</span>
            </div>
          </div>

          <div className={styles.logoutRow}>
            <LogoutButton lang={lang} dict={dict.logoutButton} />
          </div>

          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>{dict.admin.welcome}</h2>
            <p className={styles.welcomeText}>{dict.admin.welcomeText}</p>
          </div>

          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <p className={styles.statValue}>24</p>
              <p className={styles.statLabel}>{dict.admin.products}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>156</p>
              <p className={styles.statLabel}>{dict.admin.users}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>38</p>
              <p className={styles.statLabel}>{dict.admin.orders}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>$12,450</p>
              <p className={styles.statLabel}>{dict.admin.sales}</p>
            </div>
          </div>

          <div className={styles.menuSection}>
            <p className={styles.menuTitle}>{dict.admin.quickActions}</p>
            <div className={styles.menuList}>
              <div className={styles.menuItem}>
                <FolderOpen variant="16x16_4" />
                <span>{dict.admin.manageProducts}</span>
              </div>
              <div className={styles.menuItem}>
                <User variant="16x16_4" />
                <span>{dict.admin.manageUsers}</span>
              </div>
              <div className={styles.menuItem}>
                <Computer variant="16x16_4" />
                <span>{dict.admin.viewOrders}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/${lang}/home`}
            className={`${styles.backLink} ${Cursor.Pointer}`}
          >
            ← {dict.common.backToHome}
          </Link>
        </Frame>
      </div>
    </div>
  );
}
