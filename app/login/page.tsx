import { Frame } from '@react95/core';
import { Computer } from '@react95/icons';
import Link from 'next/link';
import styles from './page.module.css';
import LoginForm from './LoginForm';

export default function LoginPage() {
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

          <div className={styles.infoBox}>
            <p className={styles.infoTitle}>Credenciales de prueba:</p>
            <p className={styles.infoText}>
              <strong>Usuario:</strong> user@retrommerce.com / user123<br />
              <strong>Admin:</strong> admin@retrommerce.com / admin123
            </p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.roleSection}>
            <p className={styles.roleTitle}>Acceso rápido para pruebas:</p>
            <div className={styles.roleButtons}>
              <Link href="/user" className={styles.roleButton}>
                👤 Entrar como Usuario
              </Link>
              <Link href="/admin" className={styles.roleButton}>
                🔧 Entrar como Admin
              </Link>
            </div>
          </div>

          <Link href="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
        </Frame>
      </div>
    </div>
  );
}
