import { Frame, TitleBar, Cursor, Avatar } from "@react95/core";
import {
  User,
  Computer,
  FolderSettings,
  Notepad,
  Awfxcg321303,
  Msrating106,
  FolderFile,
  Textchat,
} from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
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
            >
              <TitleBar.OptionsBox>
                <TitleBar.Minimize />
                <TitleBar.Restore />
                <TitleBar.Close />
              </TitleBar.OptionsBox>
            </TitleBar>
            <Frame className={styles.windowContent}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                  {user.avatar ? (
                    <Avatar
                      src={user.avatar}
                      alt={dict.user.profilePhoto}
                      size="64px"
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
                <LogoutButton
                  lang={lang}
                  dict={dict.logoutButton}
                  className={styles.logoutButton}
                />
              </div>
            </Frame>
          </div>

          {/* Ventana de Configuración */}
          <div className={styles.window}>
            <TitleBar
              active
              icon={<FolderSettings variant="16x16_4" />}
              title={dict.user.profileSettings}
            >
              <TitleBar.OptionsBox>
                <TitleBar.Minimize />
                <TitleBar.Restore />
                <TitleBar.Close />
              </TitleBar.OptionsBox>
            </TitleBar>
            <Frame className={styles.windowContent}>
              <div className={styles.settingsGrid}>
                <Link
                  href={`/${lang}/user/profile-info`}
                  className={`${styles.settingLink} ${Cursor.Pointer}`}
                >
                  <div className={styles.settingIcon}>
                    <Notepad variant="32x32_4" />
                    <span>{dict.user.profileInfo}</span>
                  </div>
                </Link>

                <Link
                  href={`/${lang}/user/security`}
                  className={`${styles.settingLink} ${Cursor.Pointer}`}
                >
                  <div className={styles.settingIcon}>
                    <FolderSettings variant="32x32_4" />
                    <span>{dict.user.security}</span>
                  </div>
                </Link>
              </div>
            </Frame>
          </div>

          {/* Ventana de Panel de Control */}
          <div className={styles.window}>
            <TitleBar
              active
              icon={<Computer variant="16x16_4" />}
              title={dict.user.controlPanel}
            >
              <TitleBar.OptionsBox>
                <TitleBar.Minimize />
                <TitleBar.Restore />
                <TitleBar.Close />
              </TitleBar.OptionsBox>
            </TitleBar>
            <Frame className={styles.windowContent}>
              <div className={styles.settingsGrid}>
                <Link
                  href={`/${lang}/user/products`}
                  className={`${styles.settingLink} ${Cursor.Pointer}`}
                >
                  <div className={styles.settingIcon}>
                    <FolderFile variant="32x32_4" />
                    <span>{dict.user.myProducts}</span>
                  </div>
                </Link>

                <Link
                  href={`/${lang}/user/favorites`}
                  className={`${styles.settingLink} ${Cursor.Pointer}`}
                >
                  <div className={styles.settingIcon}>
                    <Msrating106 variant="32x32_4" />
                    <span>{dict.user.favorites}</span>
                  </div>
                </Link>

                <Link
                  href={`/${lang}/user/orders`}
                  className={`${styles.settingLink} ${Cursor.Pointer}`}
                >
                  <div className={styles.settingIcon}>
                    <Computer variant="32x32_4" />
                    <span>{dict.user.myOrders}</span>
                  </div>
                </Link>

                <Link
                  href={`/${lang}/user/reviews`}
                  className={`${styles.settingLink} ${Cursor.Pointer}`}
                >
                  <div className={styles.settingIcon}>
                    <Textchat variant="32x32_4" />
                    <span>{dict.user.myReviews}</span>
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
