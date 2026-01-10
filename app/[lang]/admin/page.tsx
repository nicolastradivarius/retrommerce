import { Frame } from '@react95/core';
import { Settings, Computer, FolderOpen, User } from '@react95/icons';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';
import styles from './page.module.css';

export default function AdminPage() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="500px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <Settings variant="32x32_4" />
            <div>
              <h1 className={styles.title}>Panel de Administración</h1>
              <span className={styles.badge}>ADMIN</span>
            </div>
          </div>

          <div className={styles.logoutRow}>
            <LogoutButton />
          </div>

          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>Bienvenido, Administrador</h2>
            <p className={styles.welcomeText}>
              Gestiona productos, usuarios y pedidos desde este panel de control.
            </p>
          </div>

          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <p className={styles.statValue}>24</p>
              <p className={styles.statLabel}>Productos</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>156</p>
              <p className={styles.statLabel}>Usuarios</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>38</p>
              <p className={styles.statLabel}>Pedidos</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>$12,450</p>
              <p className={styles.statLabel}>Ventas</p>
            </div>
          </div>

          <div className={styles.menuSection}>
            <p className={styles.menuTitle}>Acciones rápidas:</p>
            <div className={styles.menuList}>
              <div className={styles.menuItem}>
                <FolderOpen variant="16x16_4" />
                <span>Gestionar Productos</span>
              </div>
              <div className={styles.menuItem}>
                <User variant="16x16_4" />
                <span>Gestionar Usuarios</span>
              </div>
              <div className={styles.menuItem}>
                <Computer variant="16x16_4" />
                <span>Ver Pedidos</span>
              </div>
            </div>
          </div>

          <Link href="/products" className={styles.backLink}>
            ← Volver al inicio
          </Link>
        </Frame>
      </div>
    </div>
  );
}
