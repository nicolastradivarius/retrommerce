import { Frame, TaskBar, List } from '@react95/core';
import { User, Computer, FolderOpen } from '@react95/icons';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';
import styles from './page.module.css';

export default function UserPage() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="450px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <User variant="32x32_4" />
            <div>
              <h1 className={styles.title}>Panel de Usuario</h1>
              <span className={styles.badge}>USUARIO</span>
            </div>
          </div>

          <div className={styles.logoutRow}>
            <LogoutButton />
          </div>

          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>¡Bienvenido, Usuario!</h2>
            <p className={styles.welcomeText}>
              Desde aquí puedes explorar nuestro catálogo de tecnología vintage,
              gestionar tus pedidos y ver tus favoritos.
            </p>
          </div>

          <div className={styles.menuSection}>
            <p className={styles.menuTitle}>Menú de opciones:</p>
            <div className={styles.menuList}>
              <div className={styles.menuItem}>
                <FolderOpen variant="16x16_4" />
                <span>Ver Catálogo de Productos</span>
              </div>
              <div className={styles.menuItem}>
                <FolderOpen variant="16x16_4" />
                <span>Mis Favoritos</span>
              </div>
              <div className={styles.menuItem}>
                <Computer variant="16x16_4" />
                <span>Mis Pedidos</span>
              </div>
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
