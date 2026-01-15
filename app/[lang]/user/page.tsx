import { Frame, TitleBar } from "@react95/core";
import {
  User,
  Computer,
  FolderOpen,
  Notepad,
  Folder,
  Awfxcg321303,
} from "@react95/icons";
import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import LogoutButton from "../components/LogoutButton";
import BottomNav from "../components/BottomNav";
import { getDictionary, hasLocale } from "../dictionaries";
import styles from "./page.module.css";

export default async function UserPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.layout}>
          {/* Ventana de Perfil */}
          <div className={styles.window}>
            <TitleBar
              active
              icon={<User variant="16x16_4" />}
              title={dict.user.myProfile}
            />
            <Frame className={styles.windowContent}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={dict.user.profilePhoto}
                      fill
                      sizes="64px"
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <Awfxcg321303 variant="32x32_4" />
                    </div>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user.name || "Usuario"}</p>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              </div>

              <div className={styles.separator} />

              <div className={styles.profileActions}>
                <Link
                  href={`/${lang}/user/profile`}
                  className={styles.editProfileLink}
                >
                  <Notepad variant="16x16_4" />
                  {dict.user.editProfile}
                </Link>
                <LogoutButton lang={lang} dict={dict} />
              </div>
            </Frame>
          </div>

          {/* Ventana de Panel de Control */}
          <div className={styles.window}>
            <TitleBar
              active
              icon={<Computer variant="16x16_4" />}
              title={dict.user.controlPanel}
            />
            <Frame className={styles.windowContent}>
              <div className={styles.menuGrid}>
                <Link href={`/${lang}/products`} className={styles.menuLink}>
                  <div className={styles.desktopIcon}>
                    <Folder variant="32x32_4" />
                    <span>{dict.user.catalog}</span>
                  </div>
                </Link>

                <Link
                  href={`/${lang}/user/profile`}
                  className={styles.menuLink}
                >
                  <div className={styles.desktopIcon}>
                    <Notepad variant="32x32_4" />
                    <span>{dict.user.myProfile}</span>
                  </div>
                </Link>

                <Link
                  href={`/${lang}/user/favorites`}
                  className={styles.menuLink}
                >
                  <div className={styles.desktopIcon}>
                    <FolderOpen variant="32x32_4" />
                    <span>{dict.user.favorites}</span>
                  </div>
                </Link>

                <Link href={`/${lang}/user/orders`} className={styles.menuLink}>
                  <div className={styles.desktopIcon}>
                    <Computer variant="32x32_4" />
                    <span>{dict.user.myOrders}</span>
                  </div>
                </Link>
              </div>
            </Frame>
          </div>
        </div>
      </div>
    </div>
  );
}
