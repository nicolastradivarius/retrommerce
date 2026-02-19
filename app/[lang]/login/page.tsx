import { Frame, TitleBar, Cursor } from "@react95/core";
import { Lock } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import styles from "./page.module.css";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
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

  if (user) {
    redirect(`/${lang}/home`);
  }

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<Lock variant="16x16_4" />}
            title={dict.auth.login}
          >
            <TitleBarClassicOptions />
          </TitleBar>

          <Frame className={styles.windowContent}>
            <LoginForm lang={lang} dict={dict} />

            <div className={styles.separator} />

            <div className={styles.backLink}>
              <Link
                href={`/${lang}/home`}
                className={`${styles.link} ${Cursor.Pointer}`}
              >
                ← {dict.common.backToHome}
              </Link>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
