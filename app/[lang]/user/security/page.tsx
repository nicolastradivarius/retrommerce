import { Frame, TitleBar, Cursor } from "@react95/core";
import { FolderSettings } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";

export default async function SecurityPage({
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
        <div className={styles.window}>
          <TitleBar
            active
            icon={<FolderSettings variant="16x16_4" />}
            title={dict.user.security}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>

          <Frame className={styles.windowContent}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                {dict.user.changePassword}
              </h3>

              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword" className={styles.label}>
                    {dict.user.currentPassword}
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    placeholder={dict.user.currentPasswordPlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    {dict.user.newPassword}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder={dict.user.newPasswordPlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    {dict.user.confirmPassword}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder={dict.user.confirmPasswordPlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.saveButton}>
                    {dict.user.updatePassword}
                  </button>
                  <Link
                    href={`/${lang}/user`}
                    className={`${styles.cancelButton} ${Cursor.Pointer}`}
                  >
                    {dict.common.cancel}
                  </Link>
                </div>
              </form>
            </div>

            <div className={styles.backLink}>
              <Link
                href={`/${lang}/user`}
                className={`${styles.link} ${Cursor.Pointer}`}
              >
                ← {dict.common.backToUserPanel}
              </Link>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
