import { Frame, Button } from '@react95/core';
import { User } from '@react95/icons';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUserWithAvatar } from '@/lib/auth';
import styles from './TopBar.module.css';

export default async function TopBar() {
  const user = await getCurrentUserWithAvatar();

  return (
    <div className={styles.topBar}>
      <Frame className={styles.frame}>
        <div className={styles.content}>
          <Link href="/products" className={styles.logo}>
            <h2 className={styles.logoText}>Retrommerce</h2>
          </Link>
          
          <div className={styles.userSection}>
            {user ? (
              <Link href="/user" className={styles.userLink}>
                <div className={styles.userInfo}>
                  {user.avatar ? (
                    <div className={styles.avatarContainer}>
                      <Image
                        src={user.avatar}
                        alt="Foto de perfil"
                        fill
                        sizes="(max-width: 400px) 24px, (max-width: 768px) 28px, 32px"
                        className={styles.avatarImage}
                      />
                    </div>
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <User variant="16x16_4" />
                    </div>
                  )}
                  <span className={styles.welcomeText}>Hola {user.name}</span>
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Log-in</Button>
              </Link>
            )}
          </div>
        </div>
      </Frame>
    </div>
  );
}
