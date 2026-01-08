import { Frame } from '@react95/core';
import { Computer } from '@react95/icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import styles from './page.module.css';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="400px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <Computer variant="32x32_4" />
            <h1 className={styles.title}>Iniciar Sesión</h1>
          </div>

          <LoginForm />

          <hr className={styles.divider} />

          <Link href="/" className={styles.backLink}>
            ← Volver al catálogo
          </Link>
        </Frame>
      </div>
    </div>
  );
}
