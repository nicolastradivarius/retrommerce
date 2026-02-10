import { Frame, TitleBar, Cursor } from "@react95/core";
import { Notepad } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";

export default async function ProfileInfoPage({
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
            icon={<Notepad variant="16x16_4" />}
            title={dict.user.profileInfo}
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
                {dict.user.editPersonalInfo}
              </h3>

              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    {dict.user.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    placeholder={dict.user.namePlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    {dict.user.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={user.email}
                    disabled
                    className={`${styles.input} ${styles.disabled}`}
                  />
                  <p className={styles.hint}>{dict.user.emailCannotChange}</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    {dict.user.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue=""
                    placeholder={dict.user.phonePlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.saveButton}>
                    {dict.common.save}
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

            <div className={styles.separator} />

            <div className={styles.addressSection}>
              <h3 className={styles.sectionTitle}>
                {dict.user.shippingAddresses}
              </h3>

              <div className={styles.addressList}>
                <p className={styles.emptyMessage}>{dict.user.noAddresses}</p>
              </div>

              <button className={styles.addButton}>
                {dict.user.addAddress}
              </button>
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
