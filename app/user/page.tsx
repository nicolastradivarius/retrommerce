import { Frame, TitleBar } from '@react95/core';
import { User, Computer, FolderOpen, Notepad, Folder, Awfxcg321303 } from '@react95/icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserWithAvatar } from '@/lib/auth';
import LogoutButton from '../components/LogoutButton';
import TopBar from '../components/TopBar';
import styles from './page.module.css';

export default async function UserPage() {
  const user = await getCurrentUserWithAvatar();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <TopBar user={{ name: user.name, email: user.email, avatar: user.avatar }} />
      
      <div className={styles.main}>
        <div className={styles.layout}>
          {/* Ventana de Perfil */}
          <div className={styles.window}>
            <TitleBar 
              active 
              icon={<User variant="16x16_4" />}
              title="Mi Perfil"
            />
            <Frame className={styles.windowContent}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Foto de perfil" 
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <Awfxcg321303 variant="32x32_4" />
                    </div>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user.name || 'Usuario'}</p>
                  <p className={styles.userEmail}>{user.email}</p>
                  <span className={styles.badge}>
                    {user.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                  </span>
                </div>
              </div>
              
              <div className={styles.separator} />
              
              <div className={styles.profileActions}>
                <Link href="/user/profile" className={styles.editProfileLink}>
                  <Notepad variant="16x16_4" />
                  Editar perfil
                </Link>
                <LogoutButton />
              </div>
            </Frame>
          </div>

          {/* Ventana de Panel de Control */}
          <div className={styles.window}>
            <TitleBar 
              active 
              icon={<Computer variant="16x16_4" />}
              title="Panel de Control"
            />
            <Frame className={styles.windowContent}>
              <div className={styles.menuGrid}>
                <Link href="/" className={styles.menuLink}>
                  <div className={styles.desktopIcon}>
                    <Folder variant="32x32_4" />
                    <span>Catálogo</span>
                  </div>
                </Link>

                <Link href="/user/profile" className={styles.menuLink}>
                  <div className={styles.desktopIcon}>
                    <Notepad variant="32x32_4" />
                    <span>Mi Perfil</span>
                  </div>
                </Link>

                <Link href="/user/favorites" className={styles.menuLink}>
                  <div className={styles.desktopIcon}>
                    <FolderOpen variant="32x32_4" />
                    <span>Favoritos</span>
                  </div>
                </Link>

                <Link href="/user/orders" className={styles.menuLink}>
                  <div className={styles.desktopIcon}>
                    <Computer variant="32x32_4" />
                    <span>Mis Pedidos</span>
                  </div>
                </Link>
              </div>
              
              <div className={styles.separator} />
              
              <div className={styles.statusBar}>
                <Frame className={styles.statusItem}>
                  4 objeto(s)
                </Frame>
                <Frame className={styles.statusItem}>
                  Usuario conectado
                </Frame>
              </div>
            </Frame>
          </div>
        </div>
      </div>
    </div>
  );
}
