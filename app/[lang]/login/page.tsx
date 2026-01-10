import { Frame } from '@react95/core';
import { Computer } from '@react95/icons';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDictionary, hasLocale } from '../dictionaries';
import styles from './page.module.css';
import LoginForm from './LoginForm';

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
  const user = await getCurrentUser();

  if (user) {
    redirect(`/${lang}/products`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="400px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <Computer variant="32x32_4" />
            <h1 className={styles.title}>{dict.auth.login}</h1>
          </div>

          <LoginForm lang={lang} dict={dict} />

          <hr className={styles.divider} />

          <Link href={`/${lang}/products`} className={styles.backLink}>
            ← {dict.common.backToCatalog}
          </Link>
        </Frame>
      </div>
    </div>
  );
}
