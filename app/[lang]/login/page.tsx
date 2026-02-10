import { Frame, Cursor } from "@react95/core";
import { Computer } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";
import LoginForm from "@/components/LoginForm";

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
        <Frame width="400px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <Computer variant="32x32_4" />
            <h1 className={styles.title}>{dict.auth.login}</h1>
          </div>

          <LoginForm lang={lang} dict={dict} />

          <hr className={styles.divider} />

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
