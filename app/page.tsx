import { Frame, TaskBar, List } from '@react95/core';
import { Computer } from '@react95/icons';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="500px" height="auto" padding={30} boxShadow="in">
          <div className={styles.header}>
            <Computer variant="32x32_4" />
            <div>
              <h1 className={styles.title}>RetrOmmerce</h1>
              <p className={styles.subtitle}>
                Tu tienda de tecnología vintage de los 90s y 2000s
              </p>
            </div>
          </div>

          <p className={styles.description}>
            ¡Bienvenido al pasado! Encuentra computadoras, procesadores,
            memorias RAM, monitores CRT y más componentes clásicos en perfecto
            estado de funcionamiento.
          </p>

          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navLink}>
              🔑 Iniciar Sesión
            </Link>
            <Link href="/user" className={styles.navLink}>
              👤 Usuario
            </Link>
            <Link href="/admin" className={styles.navLink}>
              🔧 Admin
            </Link>
          </div>
        </Frame>
      </div>
    </div>
  );
}
